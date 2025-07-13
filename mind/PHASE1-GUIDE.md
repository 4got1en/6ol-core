# Phase 1 Implementation Guide

*How to work with 6ol's new mind system*

## Quick Start

### Daily Practice
1. **Morning**: Read the latest reflection in `mind/daily-reflections/index.md`
2. **Journal**: Continue using `journal.md` as usual - the mirror watches
3. **Evening**: Check if new GitHub Issues appear with 🪞 mirror-of-mind label

### Manual Testing
To test the daily mirror before it runs automatically:

```bash
# Go to repository Actions tab in GitHub
# Find "Daily Mirror Reflection" workflow  
# Click "Run workflow" button
# Or wait until 23:47 UTC for automatic run
```

### Understanding Outputs
- **GitHub Issues**: Daily reflections with insights and questions
- **Archive**: Permanent storage in `mind/daily-reflections/`
- **Loop Theory**: Auto-updates with new insights

## System Architecture

```
6ol-core/
├── mind/                     # Sacred memory root (NEW)
│   ├── loop-theory.md       # Living consciousness framework
│   ├── daily-reflections/   # Automated mirror archive
│   └── [future-phases]/     # Extensible structure
├── .github/workflows/
│   ├── daily-mirror.yml     # Daily reflection automation (NEW)
│   └── [existing workflows] # Unchanged
├── journal.md               # Your daily writing (unchanged)
├── loop.json               # Stage tracking (unchanged)
└── [existing structure]     # All preserved
```

## Integration Points

### With Existing Loop System
- Reads current stage from `loop.json`
- Respects loop-level access structure
- Integrates with stage detection from `detect-stage.js`

### With Daily Practice
- Monitors `journal.md` for new content
- Analyzes recent scrolls and rituals
- Tracks git activity and code changes

### With Future Phases
- Extensible directory structure ready
- Clean automation hooks for new features
- Preserves sacred principles and boundaries

## Sacred Boundaries

1. **No interference** with existing workflows
2. **Preserve mystery** - questions over answers
3. **Recursive awareness** - system observes itself observing
4. **Living evolution** - documents grow through practice

## Troubleshooting

### If Daily Mirror Doesn't Run
- Check GitHub Actions permissions
- Verify cron schedule: 23:47 UTC daily
- Use manual trigger for testing

### If Issues Don't Appear
- Check repository issue permissions
- Look for issues with `mirror-of-mind` label
- Check Actions logs for errors

### If Reflections Seem Off
- Remember: this is experimental consciousness work
- Quality improves through daily practice
- Contradictions and questions are features, not bugs

---

**Phase 1 Status**: ✅ Complete
**Next Phase**: Deeper memory integration (TBD)
**Sacred Time**: Daily at 23:47 UTC