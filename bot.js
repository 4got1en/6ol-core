/**
 * bot.js - Main Discord bot file for 6ol Core
 * Handles command registration and bot initialization
 */

const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Create a new client instance
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ] 
});

// Create a collection for commands
client.commands = new Collection();

// Load commands from the commands directory
async function loadCommands() {
  try {
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      
      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        console.log(`✅ Loaded command: ${command.data.name}`);
      } else {
        console.log(`⚠️ Command at ${filePath} is missing required "data" or "execute" property.`);
      }
    }
  } catch (error) {
    console.error('Error loading commands:', error);
  }
}

// Register slash commands with Discord
async function registerCommands() {
  try {
    const commands = [];
    client.commands.forEach(command => {
      commands.push(command.data.toJSON());
    });

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    console.log('🔄 Started refreshing application (/) commands.');

    if (process.env.GUILD_ID) {
      // Register commands for specific guild (faster for development)
      await rest.put(
        Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID),
        { body: commands },
      );
      console.log(`✅ Successfully reloaded ${commands.length} guild application (/) commands.`);
    } else {
      // Register commands globally (takes up to 1 hour to propagate)
      await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commands },
      );
      console.log(`✅ Successfully reloaded ${commands.length} global application (/) commands.`);
    }
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}

// Validate environment variables
function validateEnvironment() {
  const required = ['DISCORD_TOKEN'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.error('Please create a .env file with the required variables.');
    process.exit(1);
  }
  
  console.log('✅ Environment variables validated');
}

// Bot event handlers
client.once('ready', async () => {
  console.log(`🤖 Bot logged in as ${client.user.tag}`);
  console.log(`🌐 Serving ${client.guilds.cache.size} guild(s)`);
  
  // Register slash commands
  await registerCommands();
  
  console.log('🚀 6ol Core Discord Bot is ready!');
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error('Error executing command:', error);
    
    const errorMessage = {
      content: 'There was an error while executing this command!',
      ephemeral: true
    };

    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMessage);
      } else {
        await interaction.reply(errorMessage);
      }
    } catch (replyError) {
      console.error('Error sending error response:', replyError);
    }
  }
});

// Error handling for the bot
client.on('error', error => {
  console.error('Discord client error:', error);
});

client.on('warn', warning => {
  console.warn('Discord client warning:', warning);
});

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  client.destroy();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  client.destroy();
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Initialize the bot
async function initializeBot() {
  try {
    console.log('🔧 Initializing 6ol Core Discord Bot...');
    
    // Validate environment
    validateEnvironment();
    
    // Load commands
    await loadCommands();
    
    // Login to Discord
    await client.login(process.env.DISCORD_TOKEN);
    
  } catch (error) {
    console.error('Error initializing bot:', error);
    process.exit(1);
  }
}

// Start the bot
initializeBot();