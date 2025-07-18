# [⬅️ Back to Start](./README.md)
# Contributing to 6ol Core

Thank you for your interest in contributing to the 6ol Core system! This guide will help you get started, understand the workflow, and follow best practices.


## Getting Started

1. **Fork the repository** and clone your fork locally.
2. **Install dependencies:**
  ```bash
  npm install
  ```
3. **Set up your environment:**
   - Copy `.env.example` to `.env` and fill in required tokens/IDs:
     - `DISCORD_TOKEN`: Your Discord bot token
     - `CLIENT_ID`: Your Discord application client ID
     - `GUILD_ID`: (Optional) Your Discord server ID for development
     - `VAULT_PUSH_TOKEN`: Your GitHub token for vault journaling
   - Edit `config/bot-config.json` for your test server if needed.
   - **Validate your environment:**
     ```bash
     node scripts/validate-env.js
     ```
     This will check for all required environment variables.

## Development Workflow

- **Create a new branch** for each feature or fix:
  ```bash
  git checkout -b feature/your-feature-name
  ```
- **Write clear, well-documented code.**
- **Add or update tests** in the `tests/` directory.
- **Run tests locally:**
  ```bash
  npm test
  ```
- **Commit and push** your changes.
- **Open a Pull Request** to the `main` branch with a clear description.

## Coding Standards

- Use consistent formatting (see `.editorconfig` if present).
- Prefer async/await and handle errors gracefully.
- Keep configuration and secrets out of code (use `.env` and config files).
- Write descriptive commit messages.

## Pull Request Checklist

- [ ] Code builds and passes all tests
- [ ] Documentation is updated if needed
- [ ] No sensitive data committed
- [ ] PR description explains the change

## Communication

- Use GitHub Issues for bugs, feature requests, and questions.
- Be respectful and collaborative—this is a community project!

---

For any questions, open an issue or contact a maintainer.
