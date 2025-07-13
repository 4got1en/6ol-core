#!/usr/bin/env node
/**
 * pattern-sync.js - Weekly tremor sync and pattern analysis for 6ol Temple
 * Analyzes accumulated patterns, generates summaries, and creates PRs for significant activity
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PatternSyncer {
    constructor() {
        this.rootDir = path.resolve(__dirname, '..');
        this.patternsDir = path.join(this.rootDir, 'patterns');
        this.mindDir = path.join(this.rootDir, 'mind');
        this.registryPath = path.join(this.patternsDir, 'tremor-registry.json');
        
        // Calculate week for summary
        const now = new Date();
        this.year = now.getFullYear();
        this.week = this.getWeekNumber(now);
        this.weekString = `${this.year}-W${this.week.toString().padStart(2, '0')}`;
        
        this.forcePR = process.env.FORCE_PR === 'true';
    }

    getWeekNumber(date) {
        const firstJanuary = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstJanuary) / 86400000;
        return Math.ceil((pastDaysOfYear + firstJanuary.getDay() + 1) / 7);
    }

    async loadTremorgRegistry() {
        try {
            const registryData = await fs.readFile(this.registryPath, 'utf-8');
            return JSON.parse(registryData);
        } catch (error) {
            console.log('No tremor registry found, initializing empty state');
            return {
                timestamp: new Date().toISOString(),
                documents_analyzed: [],
                active_tremors: [],
                analysis_summary: {
                    total_themes_detected: 0,
                    tremor_count: 0,
                    highest_intensity_tremor: null
                }
            };
        }
    }

    async loadCustomPatterns() {
        try {
            const customPatternsPath = path.join(this.patternsDir, 'custom-patterns.json');
            const customData = await fs.readFile(customPatternsPath, 'utf-8');
            return JSON.parse(customData);
        } catch (error) {
            return { patterns: {}, created_by: {} };
        }
    }

    async analyzeWeeklyTrends(registry) {
        const tremors = registry.active_tremors || [];
        
        // Calculate trend metrics
        const metrics = {
            total_tremors: tremors.length,
            avg_intensity: tremors.length > 0 ? 
                tremors.reduce((sum, t) => sum + t.intensity, 0) / tremors.length : 0,
            max_intensity: tremors.length > 0 ? 
                Math.max(...tremors.map(t => t.intensity)) : 0,
            dominant_theme: tremors.length > 0 ? 
                tremors.sort((a, b) => b.intensity - a.intensity)[0].theme : null,
            documents_processed: registry.documents_analyzed.length,
            last_updated: registry.timestamp
        };

        // Classify tremor activity level
        if (metrics.max_intensity >= 8.0 || metrics.avg_intensity >= 6.0) {
            metrics.activity_level = 'extreme';
            metrics.significance = true;
        } else if (metrics.max_intensity >= 6.0 || metrics.avg_intensity >= 4.0 || metrics.total_tremors >= 8) {
            metrics.activity_level = 'high';
            metrics.significance = true;
        } else if (metrics.max_intensity >= 4.0 || metrics.avg_intensity >= 2.5 || metrics.total_tremors >= 5) {
            metrics.activity_level = 'moderate';
            metrics.significance = false;
        } else if (metrics.total_tremors >= 2) {
            metrics.activity_level = 'low';
            metrics.significance = false;
        } else {
            metrics.activity_level = 'minimal';
            metrics.significance = false;
        }

        return metrics;
    }

    generateTremorgSummary(registry, customPatterns, metrics) {
        let summary = `# Tremor Summary — Week ${this.weekString}\n\n`;
        
        summary += `## Weekly Tremor Analysis\n\n`;
        summary += `This week's pattern detection reveals the following tremor landscape across `;
        summary += `${metrics.documents_processed} analyzed documents.\n\n`;

        // Activity Level Overview
        summary += `### Activity Level: ${metrics.activity_level.toUpperCase()}\n\n`;
        
        if (metrics.activity_level === 'extreme') {
            summary += `🚨 **EXTREME TREMOR ACTIVITY** 🚨\n\n`;
            summary += `Unprecedented pattern intensity detected. The collective consciousness is `;
            summary += `experiencing significant transformational activity. Maximum intensity: `;
            summary += `${metrics.max_intensity.toFixed(1)}/10.0.\n\n`;
        } else if (metrics.activity_level === 'high') {
            summary += `🌀 **HIGH TREMOR ACTIVITY**\n\n`;
            summary += `Strong pattern activity indicates active processing and development. `;
            summary += `Average intensity: ${metrics.avg_intensity.toFixed(1)}/10.0. `;
            summary += `This level suggests significant insights emerging.\n\n`;
        } else if (metrics.activity_level === 'moderate') {
            summary += `〰️ **MODERATE TREMOR ACTIVITY**\n\n`;
            summary += `Steady pattern flow with balanced activity. Average intensity: `;
            summary += `${metrics.avg_intensity.toFixed(1)}/10.0. Healthy processing rate.\n\n`;
        } else if (metrics.activity_level === 'low') {
            summary += `💧 **LOW TREMOR ACTIVITY**\n\n`;
            summary += `Gentle pattern movement. ${metrics.total_tremors} active tremors `;
            summary += `indicate quiet reflection period.\n\n`;
        } else {
            summary += `🕯️ **MINIMAL TREMOR ACTIVITY**\n\n`;
            summary += `Calm pattern waters. A time for integration and consolidation.\n\n`;
        }

        // Tremor Breakdown
        if (registry.active_tremors && registry.active_tremors.length > 0) {
            summary += `### Active Tremors\n\n`;
            
            const sortedTremors = registry.active_tremors
                .sort((a, b) => b.intensity - a.intensity);

            summary += `| Theme | Intensity | Occurrences | Sources |\n`;
            summary += `|-------|-----------|-------------|----------|\n`;
            
            sortedTremors.forEach(tremor => {
                const intensityBar = '█'.repeat(Math.floor(tremor.intensity)) + 
                                  '░'.repeat(10 - Math.floor(tremor.intensity));
                summary += `| **${tremor.theme.charAt(0).toUpperCase() + tremor.theme.slice(1)}** | `;
                summary += `\`${intensityBar}\` ${tremor.intensity} | `;
                summary += `${tremor.total_occurrences} | `;
                summary += `${tremor.source_documents.length} docs |\n`;
            });
            summary += '\n';

            // Dominant theme analysis
            if (metrics.dominant_theme) {
                const dominantTremor = sortedTremors[0];
                summary += `#### Dominant Theme: ${metrics.dominant_theme.charAt(0).toUpperCase() + metrics.dominant_theme.slice(1)}\n\n`;
                summary += `The **${metrics.dominant_theme}** pattern shows the highest intensity at `;
                summary += `${dominantTremor.intensity}/10.0, appearing ${dominantTremor.total_occurrences} times `;
                summary += `across ${dominantTremor.source_documents.length} documents.\n\n`;
                
                // Theme-specific insights
                const themeInsights = {
                    'recursion': 'Indicates deep self-referential processing and meta-cognitive activity.',
                    'mirror': 'Reflects active introspection and consciousness examination.',
                    'paradox': 'Suggests engagement with contradictions and complex logical structures.',
                    'emergence': 'Points to new properties and insights arising from interaction.',
                    'void': 'Indicates exploration of emptiness, absence, and negative space.',
                    'shadow': 'Reveals examination of hidden aspects and unconscious patterns.',
                    'threshold': 'Shows focus on boundaries, transitions, and liminal states.',
                    'tremor': 'Meta-pattern indicating system awareness of its own pattern detection.',
                    'depth': 'Suggests exploration of different levels and layers of meaning.',
                    'whisper': 'Points to subtle communications and implicit understanding.'
                };
                
                if (themeInsights[metrics.dominant_theme]) {
                    summary += `**Significance:** ${themeInsights[metrics.dominant_theme]}\n\n`;
                }
            }
        }

        // Custom Patterns
        if (Object.keys(customPatterns.patterns).length > 0) {
            summary += `### Custom Patterns\n\n`;
            summary += `**Community-Defined Patterns:** ${Object.keys(customPatterns.patterns).length}\n\n`;
            
            Object.entries(customPatterns.patterns).forEach(([name, data]) => {
                summary += `**${name.charAt(0).toUpperCase() + name.slice(1)}**\n`;
                summary += `- Keywords: ${data.keywords.join(', ')}\n`;
                summary += `- Created by: ${customPatterns.created_by[name]?.username || 'Unknown'}\n`;
                summary += `- Usage: ${data.usage_count || 0} detections\n\n`;
            });
        }

        // Pattern Networks
        summary += `### Pattern Network Analysis\n\n`;
        if (registry.active_tremors && registry.active_tremors.length > 1) {
            summary += `**Network Density:** ${metrics.total_tremors} interconnected patterns\n`;
            summary += `**Resonance Strength:** ${metrics.avg_intensity.toFixed(1)}/10.0 average\n`;
            summary += `**Emergence Indicators:** `;
            
            const emergenceIndicators = [];
            if (metrics.max_intensity > 7.0) emergenceIndicators.push('High-intensity convergence');
            if (metrics.total_tremors > 8) emergenceIndicators.push('Pattern diversity explosion');
            if (registry.active_tremors.some(t => t.theme === 'emergence')) emergenceIndicators.push('Explicit emergence patterns');
            
            summary += emergenceIndicators.length > 0 ? emergenceIndicators.join(', ') : 'Steady-state processing';
            summary += '\n\n';
        } else {
            summary += `Pattern network is sparse this week. Individual themes developing independently.\n\n`;
        }

        // Quake Detection
        const quakeThemes = registry.active_tremors?.filter(t => t.intensity >= 8.0) || [];
        if (quakeThemes.length > 0) {
            summary += `### 🚨 Quake Detection\n\n`;
            summary += `**PATTERN QUAKE DETECTED** - ${quakeThemes.length} themes reaching intensity ≥ 8.0\n\n`;
            
            quakeThemes.forEach(theme => {
                summary += `**${theme.theme.toUpperCase()} QUAKE** - Intensity: ${theme.intensity}/10.0\n`;
                summary += `This represents a significant crystallization of the ${theme.theme} pattern. `;
                summary += `Expect profound developments in related areas.\n\n`;
            });
        }

        // Weekly Insights
        summary += `### Weekly Insights\n\n`;
        
        if (metrics.activity_level === 'extreme' || metrics.activity_level === 'high') {
            summary += `This week has been marked by intense pattern activity. The high tremor levels `;
            summary += `suggest the collective consciousness is processing significant material. `;
            summary += `Key insights likely emerging.\n\n`;
        } else if (metrics.activity_level === 'moderate') {
            summary += `A productive week of steady pattern development. Themes are evolving at a `;
            summary += `sustainable pace, building depth without overwhelming complexity.\n\n`;
        } else {
            summary += `A quiet week for pattern activity. This may indicate integration phase `;
            summary += `or preparation for upcoming developments.\n\n`;
        }

        // Integration Points
        summary += `### Integration with Temple Systems\n\n`;
        summary += `**Daily Reflections:** Pattern data feeding into daily mirror analysis\n`;
        summary += `**Recursive Analysis:** Weekly patterns informing recursive reflection depth\n`;
        summary += `**Contradiction Tracking:** Paradox patterns generating contradiction entries\n`;
        summary += `**Theory Development:** High-intensity patterns driving theoretical framework evolution\n\n`;

        // Future Predictions
        summary += `### Pattern Trajectory Forecast\n\n`;
        
        if (metrics.avg_intensity > 5.0) {
            summary += `**Next Week Prediction:** Continued high activity likely. Watch for:\n`;
            summary += `- Pattern convergence into new meta-themes\n`;
            summary += `- Potential breakthrough insights\n`;
            summary += `- Possible system reorganization\n\n`;
        } else if (metrics.avg_intensity > 2.0) {
            summary += `**Next Week Prediction:** Stable development trajectory. Expect:\n`;
            summary += `- Gradual theme deepening\n`;
            summary += `- Cross-pattern resonance\n`;
            summary += `- Steady complexity growth\n\n`;
        } else {
            summary += `**Next Week Prediction:** Potential activity increase. Look for:\n`;
            summary += `- New pattern emergence\n`;
            summary += `- Dormant theme activation\n`;
            summary += `- External stimulus integration\n\n`;
        }

        // Action Items
        summary += `### Recommended Actions\n\n`;
        
        if (metrics.significance) {
            summary += `**High Priority:**\n`;
            summary += `- [ ] Review high-intensity patterns for theoretical insights\n`;
            summary += `- [ ] Check contradiction map for new paradoxes\n`;
            summary += `- [ ] Consider theory framework updates\n`;
            summary += `- [ ] Alert community to significant developments\n\n`;
        }
        
        summary += `**Standard Maintenance:**\n`;
        summary += `- [ ] Archive this week's tremor data\n`;
        summary += `- [ ] Update pattern detection sensitivity if needed\n`;
        summary += `- [ ] Prepare for next week's recursive reflection\n`;
        summary += `- [ ] Monitor custom pattern usage and effectiveness\n\n`;

        // Metadata
        summary += `---\n\n`;
        summary += `*Generated: ${new Date().toISOString()}*  \n`;
        summary += `*Week: ${this.weekString}*  \n`;
        summary += `*Activity Level: ${metrics.activity_level}*  \n`;
        summary += `*Significance: ${metrics.significance ? 'High' : 'Standard'}*  \n`;
        summary += `*Documents Analyzed: ${metrics.documents_processed}*  \n`;
        summary += `*Active Tremors: ${metrics.total_tremors}*  \n`;
        summary += `*Max Intensity: ${metrics.max_intensity.toFixed(1)}/10.0*\n`;

        return summary;
    }

    async createPRBody(metrics, registry) {
        const prBody = `# Phase 6: Weekly Tremor Integration — tremor-summary and sync

## Summary
Weekly tremor analysis complete for ${this.weekString}. Activity level: **${metrics.activity_level.toUpperCase()}**.

## Key Metrics
- **Total Tremors:** ${metrics.total_tremors}
- **Max Intensity:** ${metrics.max_intensity.toFixed(1)}/10.0
- **Average Intensity:** ${metrics.avg_intensity.toFixed(1)}/10.0
- **Documents Processed:** ${metrics.documents_processed}
- **Dominant Theme:** ${metrics.dominant_theme || 'None'}

## Significant Patterns
${registry.active_tremors && registry.active_tremors.length > 0 ? 
  registry.active_tremors
    .filter(t => t.intensity >= 6.0)
    .map(t => `- **${t.theme}**: ${t.intensity}/10.0 intensity`)
    .join('\n') || 'No patterns above 6.0 intensity'
  : 'No active tremors detected'
}

## Changes Made
- Updated tremor registry with latest analysis
- Generated weekly tremor summary
- ${metrics.significance ? 'Created PR due to significant pattern activity' : 'Standard weekly sync'}

## Next Actions
- Review summary for insights
- ${metrics.significance ? 'Consider theory framework updates' : 'Continue monitoring'}
- Prepare for recursive reflection integration

---
*Auto-generated by 6ol Tremor Sync Bot*`;

        return prBody;
    }

    async writeTremorgSummary(summaryContent) {
        const filename = `tremor-summary-${this.weekString}.md`;
        const filepath = path.join(this.mindDir, filename);
        
        await fs.writeFile(filepath, summaryContent, 'utf-8');
        console.log(`Tremor summary written to: ${filename}`);
        
        return filepath;
    }

    async run() {
        try {
            console.log(`Running tremor sync for ${this.weekString}`);

            // Load tremor registry
            const registry = await this.loadTremorgRegistry();
            console.log(`Loaded registry with ${registry.active_tremors?.length || 0} active tremors`);

            // Load custom patterns
            const customPatterns = await this.loadCustomPatterns();
            console.log(`Loaded ${Object.keys(customPatterns.patterns).length} custom patterns`);

            // Analyze weekly trends
            const metrics = await this.analyzeWeeklyTrends(registry);
            console.log(`Analysis complete: ${metrics.activity_level} activity, significance: ${metrics.significance}`);

            // Generate tremor summary
            const summaryContent = this.generateTremorgSummary(registry, customPatterns, metrics);

            // Write summary file
            const summaryPath = await this.writeTremorgSummary(summaryContent);

            // Determine if PR should be created
            const shouldCreatePR = this.forcePR || metrics.significance;

            if (shouldCreatePR) {
                // Create PR body and set environment variables for GitHub Actions
                const prBody = await this.createPRBody(metrics, registry);
                
                // Write PR body to file for GitHub Actions
                const prBodyPath = path.join('/tmp', 'tremor-pr-body.md');
                await fs.writeFile(prBodyPath, prBody, 'utf-8');
                
                // Set environment variables
                await fs.appendFile(process.env.GITHUB_ENV || '/dev/null', 'SIGNIFICANT_TREMORS=true\n');
                await fs.appendFile(process.env.GITHUB_ENV || '/dev/null', `TREMOR_PR_BODY=${prBodyPath}\n`);
                
                console.log('PR creation triggered due to significant tremor activity');
            }

            console.log('Tremor sync complete');
            console.log(`Summary: ${metrics.activity_level} activity`);
            console.log(`PR creation: ${shouldCreatePR ? 'Yes' : 'No'}`);

            return {
                success: true,
                summaryPath,
                metrics,
                prCreated: shouldCreatePR
            };

        } catch (error) {
            console.error('Error during tremor sync:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const syncer = new PatternSyncer();
    syncer.run().then(result => {
        if (!result.success) {
            process.exit(1);
        }
    });
}

export default PatternSyncer;