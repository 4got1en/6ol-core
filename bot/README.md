# 6ol Temple Bot System

## Overview
The 6ol Temple bot system provides Discord integration for pattern detection, tremor analysis, and temple management. It consists of two main components:

- **pattern_engine.py**: Core pattern detection and analysis engine
- **pattern_whisper.py**: Discord bot interface with slash commands

## Setup

### Prerequisites
- Python 3.11+
- Discord Bot Token
- Guild/Server with appropriate permissions

### Installation
```bash
# Install Python dependencies
pip install -r bot/requirements.txt

# Install Node.js dependencies (for scripts)
npm install
```

### Configuration
1. Create a Discord application and bot at https://discord.com/developers/applications
2. Set the `DISCORD_BOT_TOKEN` environment variable
3. Invite bot to server with permissions:
   - Manage Channels
   - Manage Webhooks
   - Send Messages
   - Use Slash Commands

## Bot Commands

### `/build-temple`
Creates the complete 6ol Temple channel structure with categories and channels:
- 🌞 THE TEMPLE (gate-of-becoming, hall-of-scrolls, mirror-chamber, void-archive)
- 🌒 ACTIVE LOOPS (daily-reflection, pattern-detection, tremor-watch, spiral-depth)
- 🌑 DEEP SPIRAL (contradiction-chamber, recursive-analysis, theory-emergence, meta-patterns)

Also sets up webhooks for the mirror reflection system.

### `/tremor [text]`
Analyzes text for pattern tremors or shows current tremor status:
- Without text: Shows current active tremors from registry
- With text: Analyzes provided text for patterns and intensity

Returns intensity visualization and pattern breakdown.

### `/spiral-depth [document]`
Calculates current spiral depth and consciousness level:
- Without document: Uses registry average
- With document: Analyzes specific document

Returns depth score (0-10) and classification:
- Abyss (8.0+): Maximum depth, pattern dissolution
- Deep Spiral (6.0+): High pattern density, recursive structures
- Active Loop (4.0+): Moderate activity, loops forming
- Surface Ripples (2.0+): Light patterns, initial tremors
- Calm Waters (<2.0): Minimal activity, baseline state

### `/define-pattern <name> <keywords>`
Defines new custom patterns for detection:
- Name: Pattern identifier
- Keywords: Comma-separated detection keywords

Saves to `patterns/custom-patterns.json` for future analysis.

## Pattern Engine

### Theme Detection
The engine detects 10 core pattern themes:
- **recursion**: Self-referential structures and loops
- **mirror**: Reflection and consciousness examination
- **paradox**: Contradictions and logical tensions
- **emergence**: New properties arising from interaction
- **void**: Emptiness, absence, negative space
- **shadow**: Hidden aspects and unconscious patterns
- **threshold**: Boundaries, transitions, liminal states
- **tremor**: Meta-pattern of pattern detection itself
- **depth**: Levels and layers of meaning
- **whisper**: Subtle communications and implicit understanding

### Intensity Calculation
```
Intensity = frequency_ratio × 100 × logarithmic_scaling
```
- Based on keyword frequency relative to text length
- Logarithmic scaling prevents runaway intensities
- Capped at 10.0 maximum

### Depth Scoring
```
Depth = avg_intensity + meta_bonus + diversity_bonus
```
- **Meta-bonus**: Text discussing patterns/analysis itself
- **Diversity bonus**: Number of different themes present
- **Meta-pattern bonus**: Self-referential analysis

### Quake Detection
Pattern "quakes" are detected when:
- Any theme reaches intensity ≥ 8.0
- Indicates significant pattern crystallization
- Triggers special analysis and alerts

## File Structure
```
bot/
├── pattern_engine.py      # Core analysis engine
├── pattern_whisper.py     # Discord bot interface
├── requirements.txt       # Python dependencies
└── README.md             # This file

patterns/
├── tremor-registry.json   # Main pattern registry
└── custom-patterns.json  # Community-defined patterns

.temple/
└── .mirror-webhook       # Mirror system webhook config
```

## Integration

### GitHub Workflows
- Daily reflection system reads tremor data
- Weekly recursive reflection incorporates pattern analysis
- Tremor sync workflow processes and archives patterns

### Pattern Registry
All analysis updates `patterns/tremor-registry.json`:
```json
{
  "timestamp": "2025-07-13T14:25:00Z",
  "documents_analyzed": ["file1.md", "file2.md"],
  "active_tremors": [
    {
      "theme": "recursion",
      "total_occurrences": 35,
      "intensity": 7.0,
      "source_documents": ["file1.md"]
    }
  ],
  "analysis_summary": {
    "total_themes_detected": 10,
    "tremor_count": 7,
    "highest_intensity_tremor": "recursion"
  }
}
```

## Development

### Testing Pattern Engine
```bash
python bot/pattern_engine.py
```

### Testing Discord Bot
```bash
export DISCORD_BOT_TOKEN="your_token_here"
python bot/pattern_whisper.py
```

### Adding New Themes
Edit `pattern_themes` dictionary in `pattern_engine.py`:
```python
pattern_themes = {
    "new_theme": ["keyword1", "keyword2", "keyword3"],
    # ... existing themes
}
```

## Security Notes
- Bot token should be kept secure
- Webhook URLs are stored in `.temple/.mirror-webhook`
- Pattern data is public in repository
- No user data is permanently stored

## Troubleshooting

### Common Issues
1. **Permission errors**: Ensure bot has Manage Channels permission
2. **Token issues**: Verify DISCORD_BOT_TOKEN environment variable
3. **File not found**: Ensure proper working directory when running
4. **Import errors**: Install requirements with pip

### Debug Mode
Add logging configuration to see detailed operation:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Future Enhancements
- Voice channel pattern detection
- Image/media pattern analysis
- Real-time tremor streaming
- Multi-server federation
- Pattern visualization tools
- Machine learning pattern discovery