# Contributing to Lightning ⚡

Thank you for your interest in contributing to Lightning! This guide will help you get started with contributing to this League of Legends companion app.

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Rust** (latest stable) - [Install via rustup](https://rustup.rs/)
- **Git** - [Download here](https://git-scm.com/)
- **Tauri Prerequisites** - Follow the [Tauri setup guide](https://tauri.app/v1/guides/getting-started/prerequisites) for your platform

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork locally:**

   ```bash
   git clone https://github.com/YOUR_USERNAME/Lightning.git
   cd Lightning
   ```

3. **Add the upstream remote:**

   ```bash
   git remote add upstream https://github.com/TheGrieferKnight/Lightning.git
   ```

4. **Install dependencies:**

   ```bash
   npm install
   ```

5. **Start the development server:**

   ```bash
   npm run tauri dev
   ```

## 🏗️ Project Structure

```
Lightning/
├── src/                            # React frontend source
│   ├── components/                 # Reusable React components
│   ├── pages/                      # Page components
│   ├── hooks/                      # Custom React hooks
│   ├── services/                   # API service layer
│   ├── utils/                      # Utility functions
│   ├── types/                      # TypeScript type definitions
│   ├── data/                       # Static data and mock data
│   ├── styles/                     # Tailwind CSS
├── src-tauri/                      # Rust backend source
│   ├── src/                        # Rust source files
│   ├── Cargo.toml                  # Rust dependencies
│   ├── tauri.conf.json             # Tauri configuration
│   └── build.rs                    # Build script
├── .gitignore                      # Git ignore rules
├── package.json                    # Node.js dependencies
├── tsconfig.json                   # TypeScript configuration
└── README.md                       # Project documentation
```

## 🛠️ Tech Stack

- **Frontend:** React 19 (Canary) with React Compiler + Vite + Tailwind CSS
- **Backend:** Rust + Tauri v2
- **APIs:** Riot Games API
- **Build System:** Vite + Tauri CLI

## 📝 How to Contribute

### 1. Choose What to Work On

- Check the [Issues](https://github.com/TheGrieferKnight/Lightning/issues) page for open issues
- Look for issues labeled `good first issue` if you're new to the project
- Feel free to propose new features by opening an issue for discussion

### 2. Create a Branch

```bash
# Make sure you're on the main branch
git checkout main

# Pull the latest changes
git pull upstream main

# Create a new branch for your feature/fix
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 3. Make Your Changes

- Write clean, readable code that follows the existing style
- Add comments for complex logic
- Ensure your code works with React 19 Canary and the React Compiler
- Test your changes thoroughly

### 4. Commit Your Changes

```bash
# Stage your changes
git add .

# Commit with a descriptive message
git commit -m "feat: add summoner spell cooldown notifications"
# or
git commit -m "fix: resolve dashboard loading issue"
```

**Commit Message Convention:**

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

### 5. Push and Create a Pull Request

```bash
# Push your branch to your fork
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:

- A clear title describing your changes
- A detailed description of what you've changed and why
- Screenshots if your changes affect the UI
- Reference any related issues

## 🎨 Code Style Guidelines

### React/TypeScript

- Use functional components with hooks
- Leverage React 19 features like the new React Compiler optimizations
- Use TypeScript for type safety
- Follow the existing component structure and naming conventions
- Use Tailwind CSS classes for styling

### Rust

- Follow standard Rust formatting (use `cargo fmt`)
- Use `cargo clippy` to catch common issues
- Add appropriate error handling
- Document public functions and modules

### General

- Keep functions small and focused
- Use meaningful variable and function names
- Remove console.logs before committing
- Ensure your code doesn't introduce new warnings

## 🧪 Testing

Before submitting your PR:

```bash
# Run the app in development mode
npm run tauri dev

# Build the app to ensure it compiles
npm run tauri build

# Run any available tests
npm test

# Check Rust code
cd src-tauri
cargo fmt
cargo clippy
```

## 🐛 Reporting Bugs

When reporting bugs, please include:

1. **Steps to reproduce** the issue
2. **Expected behavior** vs **actual behavior**
3. **Screenshots** if applicable
4. **System information** (OS, app version)
5. **Console logs** if there are any errors

## 💡 Suggesting Features

Before suggesting a new feature:

1. Check if it's already been requested in the issues
2. Consider if it fits the project's goals (ad-free LoL companion)
3. Think about how it would work with the Riot Games API
4. Open an issue with a detailed description of the feature

## 🔄 Keeping Your Fork Updated

```bash
# Fetch the latest changes from upstream
git fetch upstream

# Switch to your main branch
git checkout main

# Merge upstream changes
git merge upstream/main

# Push updates to your fork
git push origin main
```

## 📞 Getting Help

- **Questions about development?** Open a discussion on GitHub
- **Stuck on setup?** Check the main README or open an issue
- **Want to chat?** Feel free to reach out in the issues

## 🙏 Recognition

All contributors will be recognized in the project. Thank you for helping make Lightning better!

---

**Note:** This project is currently developed solo by me, [@TheGrieferKnight](https://github.com/TheGrieferKnight), but contributions from the community are welcomed and appreciated!
