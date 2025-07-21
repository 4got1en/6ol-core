# Slash Command Deployment Guide

This guide provides step-by-step instructions for deploying the 6ol Core Discord bot's slash commands, including the new flame role system.

## Prerequisites

### 1. Environment Setup
- Node.js 16+ installed
- npm package manager
- Git access to the repository
- Discord Bot Token
- Discord Application with bot permissions

### 2. Required Permissions
Your bot needs the following Discord permissions:
- `Manage Roles`
- `Send Messages`
- `Use Slash Commands`
- `View Channels`
- `Read Message History`
- `Embed Links`

## Local Development Deployment

### 1. Environment Configuration
Create a `.env` file in the project root:

```bash
# Required
DISCORD_TOKEN=your_bot_token_here

# Optional - for guild-specific deployment (faster)
GUILD_ID=your_test_guild_id_here
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Deploy Commands
The bot automatically registers commands when it starts:

```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

### 4. Verify Deployment
Check the console output for:
```
✅ Successfully reloaded X application (/) commands.
🚀 6ol Core Discord Bot is ready!
```

## Production Deployment

### 1. Codespaces Deployment

#### Setup in GitHub Codespaces:
1. Open the repository in Codespaces
2. Create environment variables:
   ```bash
   echo "DISCORD_TOKEN=your_token" >> .env
   # Optionally add GUILD_ID for testing
   ```
3. Install and start:
   ```bash
   npm install
   npm start
   ```

#### Keep-Alive in Codespaces:
The bot includes a keep-alive loop that pings every 5 minutes to maintain the connection.

### 2. GitHub Actions Deployment

Create `.github/workflows/deploy-bot.yml`:

```yaml
name: Deploy Discord Bot

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Deploy commands
        env:
          DISCORD_TOKEN: ${{ secrets.DISCORD_TOKEN }}
          GUILD_ID: ${{ secrets.GUILD_ID }}
        run: |
          # Register commands only
          node -e "
          require('dotenv').config();
          const { REST, Routes } = require('discord.js');
          const fs = require('fs');
          
          async function deployCommands() {
            const commands = [];
            const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
            
            for (const file of commandFiles) {
              const command = require(\`./commands/\${file}\`);
              commands.push(command.data.toJSON());
            }
            
            const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
            
            if (process.env.GUILD_ID) {
              await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });
            } else {
              await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
            }
            
            console.log('Commands deployed successfully');
          }
          
          deployCommands().catch(console.error);
          "
```

### 3. Required Secrets

Add these secrets to your GitHub repository:
- `DISCORD_TOKEN`: Your bot token
- `CLIENT_ID`: Your Discord application ID
- `GUILD_ID`: (Optional) For guild-specific deployment

## Available Commands

### Core Commands
- `/flame-status` - Display user's current flame and loop progress
- `/assign-role` - Assign flame roles (Admin/Flamebearer only)
- `/setup-roles` - Initialize all flame roles (Admin only)
- `/reset-roles` - Delete all flame roles (Admin/Flamebearer only)

### Existing Commands
- `/ascend` - Ascend to next loop level
- `/help` - Display help information
- `/reflect` - Create reflections
- `/whisper` - Access whisper engine
- `/health` - Bot health check
- `/setup-server` - Setup server structure

## Flame Role System

### Role Hierarchy
1. **Seeker Flame** (Gold) - Level 1
2. **Devoted Flame** (White) - Level 2  
3. **Descender Flame** (Dark Blue) - Level 3
4. **Reclaimer Flame** (Dark Green) - Level 4
5. **Witness Flame** (Purple) - Level 5

### Initial Setup Process
1. Run `/setup-roles` to create all flame roles
2. Use `/assign-role` to assign roles to users
3. Use `/flame-status` to check user progress
4. Use `/reset-roles` if you need to clean up

## Troubleshooting

### Command Not Appearing
- Check bot permissions in Discord
- Verify command registration in console logs
- Try restarting the bot
- For guild commands, wait up to 1 hour for global propagation

### Permission Errors
- Ensure bot has `Manage Roles` permission
- Check role hierarchy (bot role must be above managed roles)
- Verify bot has necessary channel permissions

### Role Creation Failures
- Check bot role position in server hierarchy
- Ensure `Manage Roles` permission is granted
- Verify color codes are valid hex values

### Testing Commands
Use the provided test suite:
```bash
npm test
```

### Logs and Debugging
The bot logs important events:
- Command executions
- Role assignments
- Error conditions
- Keep-alive pings

Monitor console output for troubleshooting information.

## Support

For issues or questions:
1. Check the console logs for error messages
2. Verify all environment variables are set
3. Ensure bot permissions are properly configured
4. Review the GitHub repository issues
5. Test commands in a development guild first