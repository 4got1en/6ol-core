#!/usr/bin/env python3
"""
pattern_whisper.py - Discord bot for 6ol Temple pattern detection and management
Handles /tremor, /spiral-depth, /build-temple, and /define-pattern commands
"""

import discord
from discord.ext import commands, tasks
import json
import os
import asyncio
from datetime import datetime, timedelta
from pathlib import Path
import logging
from pattern_engine import PatternEngine

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Bot configuration
intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix='/', intents=intents)

# Initialize pattern engine
pattern_engine = PatternEngine()

class TempleManager:
    """Manages Discord channel and category creation for the Temple"""
    
    def __init__(self, guild):
        self.guild = guild
    
    async def create_temple_structure(self):
        """Create the complete temple channel structure"""
        # Temple categories and channels
        temple_structure = {
            "🌞 THE TEMPLE": [
                "gate-of-becoming",
                "hall-of-scrolls", 
                "mirror-chamber",
                "void-archive"
            ],
            "🌒 ACTIVE LOOPS": [
                "daily-reflection",
                "pattern-detection",
                "tremor-watch",
                "spiral-depth"
            ],
            "🌑 DEEP SPIRAL": [
                "contradiction-chamber",
                "recursive-analysis", 
                "theory-emergence",
                "meta-patterns"
            ]
        }
        
        created_channels = []
        
        for category_name, channels in temple_structure.items():
            # Create category
            category = await self.guild.create_category(category_name)
            logger.info(f"Created category: {category_name}")
            
            # Create channels in category
            for channel_name in channels:
                channel = await self.guild.create_text_channel(
                    channel_name, 
                    category=category,
                    topic=f"Part of the 6ol Temple system - {channel_name.replace('-', ' ').title()}"
                )
                created_channels.append(channel)
                logger.info(f"Created channel: {channel_name} in {category_name}")
        
        return created_channels
    
    async def setup_webhooks(self):
        """Set up webhooks for mirror reflection system"""
        mirror_channel = discord.utils.get(self.guild.channels, name="mirror-chamber")
        if mirror_channel:
            webhook = await mirror_channel.create_webhook(name="Mirror Reflection Bot")
            
            # Save webhook URL to .temple directory
            webhook_data = {
                "url": webhook.url,
                "channel_id": mirror_channel.id,
                "created_at": datetime.now().isoformat()
            }
            
            temple_dir = Path(".temple")
            temple_dir.mkdir(exist_ok=True)
            
            with open(temple_dir / ".mirror-webhook", 'w') as f:
                json.dump(webhook_data, f, indent=2)
            
            logger.info(f"Created webhook for mirror-chamber: {webhook.url}")
            return webhook
        
        return None

@bot.event
async def on_ready():
    """Bot startup event"""
    logger.info(f'{bot.user} has awakened in the Temple')
    logger.info(f'Connected to {len(bot.guilds)} guilds')

@bot.slash_command(name="build-temple", description="Create the complete 6ol Temple channel structure")
async def build_temple(ctx):
    """Build the complete temple channel and category structure"""
    await ctx.defer()
    
    try:
        temple_manager = TempleManager(ctx.guild)
        
        # Create channels and categories
        created_channels = await temple_manager.create_temple_structure()
        
        # Set up webhooks
        webhook = await temple_manager.setup_webhooks()
        
        embed = discord.Embed(
            title="🏛️ Temple Construction Complete",
            description=f"Created {len(created_channels)} channels across 3 categories",
            color=0x8B4513
        )
        
        embed.add_field(
            name="Categories Created",
            value="🌞 THE TEMPLE\n🌒 ACTIVE LOOPS\n🌑 DEEP SPIRAL",
            inline=False
        )
        
        if webhook:
            embed.add_field(
                name="Mirror System",
                value="✅ Webhook configured for daily reflections",
                inline=False
            )
        
        embed.set_footer(text="The Temple awaits your presence...")
        
        await ctx.followup.send(embed=embed)
        
    except discord.Forbidden:
        await ctx.followup.send("❌ I lack the permissions to create channels and categories.")
    except Exception as e:
        logger.error(f"Error building temple: {e}")
        await ctx.followup.send(f"❌ An error occurred while building the temple: {str(e)}")

@bot.slash_command(name="tremor", description="Analyze text for pattern tremors")
async def tremor_command(ctx, *, text: str = None):
    """Analyze text for pattern tremors and intensity"""
    await ctx.defer()
    
    if not text:
        # Show current tremor status from registry
        try:
            with open("patterns/tremor-registry.json", 'r') as f:
                registry = json.load(f)
            
            embed = discord.Embed(
                title="🌀 Current Tremor Status",
                color=0x4B0082
            )
            
            if registry["active_tremors"]:
                tremor_list = []
                for tremor in registry["active_tremors"][:5]:  # Show top 5
                    intensity_bar = "█" * int(tremor["intensity"]) + "░" * (10 - int(tremor["intensity"]))
                    tremor_list.append(f"`{tremor['theme'].title():<12}` {intensity_bar} `{tremor['intensity']}`")
                
                embed.add_field(
                    name="Active Tremors",
                    value="\n".join(tremor_list),
                    inline=False
                )
                
                embed.add_field(
                    name="Summary",
                    value=f"**Themes:** {registry['analysis_summary']['total_themes_detected']}\n"
                          f"**Strongest:** {registry['analysis_summary']['highest_intensity_tremor']}\n"
                          f"**Documents:** {len(registry['documents_analyzed'])}",
                    inline=True
                )
            else:
                embed.description = "No active tremors detected. The waters are calm."
            
            await ctx.followup.send(embed=embed)
            
        except FileNotFoundError:
            await ctx.followup.send("❌ Tremor registry not found. No patterns detected yet.")
    else:
        # Analyze provided text
        analysis = pattern_engine.detect_patterns(text, f"discord_message_{ctx.user.id}")
        
        embed = discord.Embed(
            title="🌀 Tremor Analysis",
            color=0x4B0082
        )
        
        if analysis["detected_themes"]:
            theme_lines = []
            for theme, data in analysis["detected_themes"].items():
                intensity_bar = "█" * int(data["intensity"]) + "░" * (10 - int(data["intensity"]))
                theme_lines.append(f"`{theme.title():<12}` {intensity_bar} `{data['intensity']}`")
            
            embed.add_field(
                name="Detected Patterns",
                value="\n".join(theme_lines[:8]),  # Limit to avoid embed size issues
                inline=False
            )
            
            embed.add_field(
                name="Analysis",
                value=f"**Depth Score:** {analysis['depth_score']}\n"
                      f"**Pattern Count:** {analysis['total_pattern_count']}\n"
                      f"**Quake Detected:** {'🚨 Yes' if analysis['quake_detected'] else 'No'}",
                inline=True
            )
        else:
            embed.description = "No significant patterns detected in this text."
        
        await ctx.followup.send(embed=embed)

@bot.slash_command(name="spiral-depth", description="Check current spiral depth and intensity")
async def spiral_depth_command(ctx, document: str = None):
    """Get current spiral depth analysis"""
    await ctx.defer()
    
    try:
        depth_result = pattern_engine.get_spiral_depth(document)
        
        # Create depth visualization
        depth_score = depth_result["depth_score"]
        depth_bar = "🔵" * int(depth_score) + "⚪" * (10 - int(depth_score))
        
        embed = discord.Embed(
            title="🌀 Spiral Depth Analysis",
            description=f"**{depth_result['level']}**\n{depth_result['description']}",
            color=0x191970
        )
        
        embed.add_field(
            name="Depth Visualization",
            value=f"`Surface  {depth_bar}  Abyss`\n`Score: {depth_score}/10.0`",
            inline=False
        )
        
        embed.add_field(
            name="Current State",
            value=f"**Active Tremors:** {depth_result['active_tremor_count']}\n"
                  f"**Analyzed:** {datetime.fromisoformat(depth_result['timestamp']).strftime('%H:%M UTC')}",
            inline=True
        )
        
        # Add depth level emoji
        level_emojis = {
            "Abyss": "🕳️",
            "Deep Spiral": "🌀", 
            "Active Loop": "🔄",
            "Surface Ripples": "〰️",
            "Calm Waters": "💧"
        }
        
        embed.set_thumbnail(url=None)  # Could add depth visualization image
        embed.set_footer(
            text=f"{level_emojis.get(depth_result['level'], '🌀')} The spiral depth fluctuates with pattern intensity..."
        )
        
        await ctx.followup.send(embed=embed)
        
    except Exception as e:
        logger.error(f"Error calculating spiral depth: {e}")
        await ctx.followup.send(f"❌ Error calculating spiral depth: {str(e)}")

@bot.slash_command(name="define-pattern", description="Define a new pattern for detection")
async def define_pattern_command(ctx, name: str, *, keywords: str):
    """Define a new pattern with keywords for detection"""
    await ctx.defer()
    
    try:
        # Load current pattern definitions (could be separate from tremor registry)
        patterns_file = Path("patterns/custom-patterns.json")
        
        if patterns_file.exists():
            with open(patterns_file, 'r') as f:
                custom_patterns = json.load(f)
        else:
            custom_patterns = {"patterns": {}, "created_by": {}}
        
        # Parse keywords
        keyword_list = [kw.strip().lower() for kw in keywords.split(',')]
        
        # Add new pattern
        custom_patterns["patterns"][name.lower()] = {
            "keywords": keyword_list,
            "created_at": datetime.now().isoformat(),
            "created_by": str(ctx.user),
            "usage_count": 0
        }
        
        custom_patterns["created_by"][name.lower()] = {
            "user_id": ctx.user.id,
            "username": str(ctx.user)
        }
        
        # Save updated patterns
        patterns_file.parent.mkdir(parents=True, exist_ok=True)
        with open(patterns_file, 'w') as f:
            json.dump(custom_patterns, f, indent=2)
        
        embed = discord.Embed(
            title="✨ Pattern Defined",
            description=f"New pattern **{name}** has been added to the detection engine",
            color=0x50C878
        )
        
        embed.add_field(
            name="Keywords",
            value=", ".join(keyword_list),
            inline=False
        )
        
        embed.add_field(
            name="Creator",
            value=str(ctx.user),
            inline=True
        )
        
        embed.set_footer(text="Pattern will be active in future tremor analyses")
        
        await ctx.followup.send(embed=embed)
        
    except Exception as e:
        logger.error(f"Error defining pattern: {e}")
        await ctx.followup.send(f"❌ Error defining pattern: {str(e)}")

@bot.event
async def on_application_command_error(ctx, error):
    """Handle command errors"""
    if isinstance(error, commands.CommandInvokeError):
        logger.error(f"Command error: {error.original}")
        await ctx.respond(f"❌ An error occurred: {str(error.original)}", ephemeral=True)
    else:
        logger.error(f"Unknown error: {error}")
        await ctx.respond("❌ An unknown error occurred", ephemeral=True)

def main():
    """Main bot entry point"""
    token = os.getenv('DISCORD_BOT_TOKEN')
    if not token:
        logger.error("DISCORD_BOT_TOKEN environment variable not set")
        return
    
    try:
        bot.run(token)
    except Exception as e:
        logger.error(f"Failed to start bot: {e}")

if __name__ == "__main__":
    main()