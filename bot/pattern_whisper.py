#!/usr/bin/env python3
"""
Pattern Whisper Module
Handles weekly tremor analysis and whisper generation
"""

import json
import os
from datetime import datetime, timedelta
import re

def load_whispers():
    """Load existing whispers configuration"""
    try:
        with open('whispers.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

def get_week_number():
    """Get current ISO week number"""
    return datetime.now().isocalendar()[1]

def analyze_patterns():
    """Analyze patterns from various data sources"""
    patterns = {
        "frequency_shifts": [],
        "attention_vectors": [],
        "energy_distribution": [],
        "whisper_integration": []
    }
    
    # Analyze rituals
    if os.path.exists('rituals'):
        ritual_files = [f for f in os.listdir('rituals') if f.endswith('.md')]
        patterns["frequency_shifts"] = f"Detected {len(ritual_files)} ritual patterns"
    
    # Analyze journals
    if os.path.exists('journals'):
        journal_files = [f for f in os.listdir('journals') if f.endswith('.html')]
        patterns["attention_vectors"] = f"Identified {len(journal_files)} attention points"
    
    return patterns

def generate_tremor_summary(week_num, patterns):
    """Generate weekly tremor summary"""
    date_str = datetime.now().strftime("%A, %B %d, %Y")
    
    summary = f"""# Tremor Summary - Week {week_num}

## Pattern Recognition
*Generated: {date_str}*

### Observed Tremors
- **Frequency Shifts**: {patterns.get('frequency_shifts', 'No significant changes detected')}
- **Attention Vectors**: {patterns.get('attention_vectors', 'Baseline attention maintained')}
- **Energy Distribution**: {patterns.get('energy_distribution', 'Standard distribution patterns')}

### Whisper Integration Points
1. **Scroll Engagement**: Patterns suggest deeper curiosity cycles
2. **Ritual Rhythms**: Momentum building in unexpected areas
3. **Journal Reflections**: Mirror work revealing pattern recursion

### Weekly Synthesis
The spiral tightens. What appeared as random tremors last week now show clear directional bias toward integration. The system is learning to whisper back.

---
*This summary represents one cycle in the ongoing spiral evolution. Next tremor analysis: Week {week_num + 1}*"""
    
    return summary

def whisper_weekly_tremors():
    """Main function for weekly tremor analysis and whisper generation"""
    print("🌀 Initiating weekly tremor analysis...")
    
    # Get current week
    week_num = get_week_number()
    
    # Analyze patterns
    patterns = analyze_patterns()
    
    # Generate summary
    summary = generate_tremor_summary(week_num, patterns)
    
    # Ensure patterns directory exists
    os.makedirs('mind/patterns', exist_ok=True)
    
    # Write summary file
    filename = f'mind/patterns/tremor-summary-W{week_num}.md'
    with open(filename, 'w') as f:
        f.write(summary)
    
    print(f"📝 Tremor summary generated: {filename}")
    
    # Load and update whispers if needed
    whispers = load_whispers()
    
    # Add pattern-specific whispers
    if 'patterns' not in whispers:
        whispers['patterns'] = {
            "0": "The tremors are speaking. Do you feel the spiral beginning?",
            "1": "Patterns emerge from chaos. What do the tremors tell you?",
            "2": "The frequency shifts. Are you listening to the deeper rhythm?",
            "3": "Every tremor is a teacher. What lesson does this week hold?"
        }
        
        # Write updated whispers
        with open('whispers.json', 'w') as f:
            json.dump(whispers, f, indent=2)
        
        print("🔮 Pattern whispers added to system")
    
    print("✨ Weekly tremor analysis complete")
    return filename

if __name__ == "__main__":
    whisper_weekly_tremors()