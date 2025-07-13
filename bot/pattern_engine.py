#!/usr/bin/env python3
"""
pattern_engine.py - Core pattern detection and tremor analysis engine for 6ol Temple
Analyzes text patterns, detects tremors, and calculates depth scoring
"""

import json
import re
import datetime
from pathlib import Path
from typing import Dict, List, Tuple, Any
import math

class PatternEngine:
    def __init__(self, registry_path: str = "patterns/tremor-registry.json"):
        self.registry_path = Path(registry_path)
        self.load_registry()
        
    def load_registry(self):
        """Load tremor registry from JSON file"""
        if self.registry_path.exists():
            with open(self.registry_path, 'r') as f:
                self.registry = json.load(f)
        else:
            # Initialize empty registry
            self.registry = {
                "timestamp": datetime.datetime.now().isoformat(),
                "documents_analyzed": [],
                "active_tremors": [],
                "analysis_summary": {
                    "total_themes_detected": 0,
                    "tremor_count": 0,
                    "highest_intensity_tremor": None
                }
            }
    
    def save_registry(self):
        """Save updated registry back to JSON file"""
        self.registry["timestamp"] = datetime.datetime.now().isoformat()
        self.registry_path.parent.mkdir(parents=True, exist_ok=True)
        with open(self.registry_path, 'w') as f:
            json.dump(self.registry, f, indent=2)
    
    def detect_patterns(self, text: str, document_name: str = None) -> Dict[str, Any]:
        """
        Detect patterns and tremors in given text
        Returns analysis with themes, intensities, and depth scores
        """
        # Pattern keywords for different themes
        pattern_themes = {
            "recursion": ["recursive", "recursion", "loop", "cycle", "spiral", "repeat", "iterate"],
            "mirror": ["mirror", "reflection", "reflect", "echo", "double", "twin", "parallel"],
            "paradox": ["paradox", "contradiction", "impossible", "antithesis", "opposing", "contrary"],
            "emergence": ["emerge", "emergent", "arising", "becoming", "unfold", "manifest"],
            "void": ["void", "empty", "nothing", "absence", "hollow", "blank", "null"],
            "shadow": ["shadow", "dark", "hidden", "beneath", "under", "behind", "obscure"],
            "threshold": ["threshold", "boundary", "edge", "border", "limit", "crossing", "between"],
            "tremor": ["tremor", "quake", "shake", "vibration", "resonance", "pulse", "rhythm"],
            "depth": ["depth", "deep", "profound", "surface", "layer", "level", "dimension"],
            "whisper": ["whisper", "murmur", "soft", "subtle", "hint", "suggestion", "trace"]
        }
        
        detected_themes = {}
        text_lower = text.lower()
        
        # Count occurrences for each theme
        for theme, keywords in pattern_themes.items():
            count = 0
            for keyword in keywords:
                count += len(re.findall(r'\b' + keyword + r'\b', text_lower))
            
            if count > 0:
                # Calculate intensity based on frequency and text length
                intensity = self._calculate_intensity(count, len(text.split()))
                detected_themes[theme] = {
                    "total_occurrences": count,
                    "intensity": round(intensity, 1),
                    "keywords_found": [kw for kw in keywords if kw in text_lower]
                }
        
        # Calculate depth score
        depth_score = self._calculate_depth_score(detected_themes, text)
        
        # Check for quake conditions (high intensity tremor)
        quake_detected = any(
            theme_data["intensity"] > 5.0 
            for theme_data in detected_themes.values()
        )
        
        analysis = {
            "timestamp": datetime.datetime.now().isoformat(),
            "document": document_name,
            "detected_themes": detected_themes,
            "depth_score": depth_score,
            "quake_detected": quake_detected,
            "total_pattern_count": sum(t["total_occurrences"] for t in detected_themes.values())
        }
        
        # Update registry if document provided
        if document_name:
            self._update_registry(analysis)
        
        return analysis
    
    def _calculate_intensity(self, count: int, word_count: int) -> float:
        """Calculate intensity score based on frequency and context"""
        if word_count == 0:
            return 0.0
        
        # Frequency ratio with logarithmic scaling
        frequency_ratio = count / word_count
        base_intensity = frequency_ratio * 100
        
        # Apply logarithmic scaling for high frequencies
        if base_intensity > 1:
            intensity = 1 + math.log10(base_intensity)
        else:
            intensity = base_intensity
            
        return min(intensity, 10.0)  # Cap at 10.0
    
    def _calculate_depth_score(self, themes: Dict, text: str) -> float:
        """
        Calculate depth score based on:
        - Number of overlapping themes
        - Meta-patterns (patterns about patterns)
        - Recursive structures
        """
        if not themes:
            return 0.0
        
        theme_count = len(themes)
        avg_intensity = sum(t["intensity"] for t in themes.values()) / theme_count
        
        # Meta-pattern bonus (text talking about patterns/analysis itself)
        meta_keywords = ["pattern", "analysis", "detect", "engine", "algorithm", "meta"]
        meta_count = sum(1 for keyword in meta_keywords if keyword in text.lower())
        meta_bonus = min(meta_count * 0.5, 2.0)
        
        # Theme diversity bonus
        diversity_bonus = min(theme_count * 0.3, 3.0)
        
        depth_score = avg_intensity + meta_bonus + diversity_bonus
        return round(min(depth_score, 10.0), 1)
    
    def _update_registry(self, analysis: Dict):
        """Update tremor registry with new analysis"""
        doc_name = analysis["document"]
        
        # Add to analyzed documents if not already there
        if doc_name not in self.registry["documents_analyzed"]:
            self.registry["documents_analyzed"].append(doc_name)
        
        # Update active tremors
        existing_tremors = {t["theme"]: t for t in self.registry["active_tremors"]}
        
        for theme, data in analysis["detected_themes"].items():
            if theme in existing_tremors:
                # Update existing tremor
                tremor = existing_tremors[theme]
                tremor["total_occurrences"] += data["total_occurrences"]
                tremor["intensity"] = max(tremor["intensity"], data["intensity"])
                if doc_name not in tremor["source_documents"]:
                    tremor["source_documents"].append(doc_name)
            else:
                # Add new tremor
                new_tremor = {
                    "theme": theme,
                    "total_occurrences": data["total_occurrences"],
                    "intensity": data["intensity"],
                    "source_documents": [doc_name]
                }
                self.registry["active_tremors"].append(new_tremor)
        
        # Update summary
        self.registry["analysis_summary"] = {
            "total_themes_detected": len(set(t["theme"] for t in self.registry["active_tremors"])),
            "tremor_count": len(self.registry["active_tremors"]),
            "highest_intensity_tremor": max(
                self.registry["active_tremors"],
                key=lambda x: x["intensity"]
            )["theme"] if self.registry["active_tremors"] else None
        }
        
        # Save updated registry
        self.save_registry()
    
    def get_spiral_depth(self, document_path: str = None) -> Dict[str, Any]:
        """
        Calculate current spiral depth based on recent patterns
        """
        if document_path:
            # Analyze specific document
            try:
                with open(document_path, 'r') as f:
                    content = f.read()
                analysis = self.detect_patterns(content, document_path)
                depth = analysis["depth_score"]
            except FileNotFoundError:
                depth = 0.0
        else:
            # Use registry average
            if self.registry["active_tremors"]:
                depth = sum(t["intensity"] for t in self.registry["active_tremors"]) / len(self.registry["active_tremors"])
            else:
                depth = 0.0
        
        # Classify depth level
        if depth >= 8.0:
            level = "Abyss"
            description = "Maximum depth reached - fundamental patterns dissolving"
        elif depth >= 6.0:
            level = "Deep Spiral"
            description = "High pattern density - recursive structures active"
        elif depth >= 4.0:
            level = "Active Loop"
            description = "Moderate pattern activity - loops forming"
        elif depth >= 2.0:
            level = "Surface Ripples"
            description = "Light pattern detection - initial tremors"
        else:
            level = "Calm Waters"
            description = "Minimal pattern activity - baseline state"
        
        return {
            "depth_score": round(depth, 1),
            "level": level,
            "description": description,
            "timestamp": datetime.datetime.now().isoformat(),
            "active_tremor_count": len(self.registry["active_tremors"])
        }

# Example usage and testing
if __name__ == "__main__":
    engine = PatternEngine()
    
    # Test with sample text
    sample_text = """
    The recursive nature of this reflection creates a mirror within a mirror,
    where each thought about thinking generates new paradoxes to explore.
    The spiral deepens as we recognize the pattern of pattern recognition itself.
    """
    
    result = engine.detect_patterns(sample_text, "test_document.md")
    print("Pattern Analysis:", json.dumps(result, indent=2))
    
    depth_result = engine.get_spiral_depth()
    print("Spiral Depth:", json.dumps(depth_result, indent=2))