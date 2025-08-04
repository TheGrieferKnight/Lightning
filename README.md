# ⚡ Lightning - League of Legends Companion

> A clean, ad-free League of Legends companion app built with modern web technologies and native performance.

> **🚧 Early Development Notice:** This project is in active development. Core features are being implemented and the app is not yet ready for general use. Star the repo to follow progress!

**Dashboard Mockup**

![Lightning App Screenshot](screenshots/main-dashboard.png)

**Summoner Spell Tracking Overlay**

![Lightning Spell Tracker Screenshot](screenshots/spell-tracker.png)

<!-- Add actual screenshots when available -->

## ✨ Features

> **Note:** This project is in active development. Many features are planned but not yet implemented.

### 🚧 In Development

- **🎯 Comprehensive Dashboard**
  - Detailed match history with performance analytics _(in progress)_
  - Champion mastery rankings and statistics _(planned)_
  - Win rate analysis across different time periods _(planned)_
  - Advanced gameplay statistics and trends _(planned)_

### ✅ Core Features

- **🚫 Ad-Free Experience** - Focus on gameplay, not distractions
- **⚡ Native Performance** - Built with Tauri for lightning-fast responsiveness
- **🏗️ Modern Tech Stack** - React 19 with Compiler optimizations
- **🔐 Secure API Integration** - Riot Games API access through secure Vercel proxy
- **⏱️ Live Summoner Spell Tracking** - Real-time cooldown monitoring during matches

<!-- As you complete features, move them here from "In Development" section above -->

## 🚀 Quick Start

### Download Pre-built Release

1. Navigate to the [Releases](https://github.com/TheGrieferKnight/Lightning/releases) page
2. Download the latest installer for your platform:
   - Windows: `.msi` installer
   - macOS & Linux: Coming soon

### Build from Source

**Prerequisites:**

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Rust](https://rustup.rs/) (latest stable)
- [Tauri prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites) for your platform

**Installation:**

```bash
# Clone the repository
git clone https://github.com/TheGrieferKnight/Lightning.git
cd Lightning

# Install dependencies
npm install

# Build for production
npm run tauri build
```

## 🛠️ Development

```bash
# Run in development mode with hot reload
npm run tauri dev

# Run frontend only (for UI development)
npm run dev

# Build frontend assets
npm run build

# Run tests
npm test
```

## 🏗️ Tech Stack

- **Frontend:** React 19 (Canary) with React Compiler + Vite + Tailwind CSS
- **Backend:** Rust + Tauri v2
- **APIs:** Riot Games API
- **Build System:** Vite + Tauri CLI

## 📋 System Requirements

- **Windows:** Windows 10 version 1903 or higher
- **macOS:** macOS 10.15 or higher _(coming soon)_
- **Linux:** Various distributions supported _(coming soon)_

## 🤝 Contributing

Contributions are welcome! This project is currently developed solo, but community contributions help make Lightning better.

Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- Setting up the development environment
- Code style guidelines
- How to submit pull requests
- Working with React 19 Canary and the React Compiler

**Quick contribution steps:**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.

## ⚠️ Legal Notice

Lightning is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games and all associated properties are trademarks or registered trademarks of Riot Games, Inc.

## 🐛 Known Issues

We're aware of the following issues and are working on fixes:

- **Issue 1** - Enemies in the Summoner Spell Tracking Overlay are not sorted by role. This issue is of lower priority since there is no official way to get the correct positions and it doesn't break the application.
- **Issue 2** - Summoner Spell Tracking from previous game stays until you enter the next match. Another low priority issues as it doesn't cause any problems.

> Found a new bug? Please [report it here](https://github.com/TheGrieferKnight/Lightning/issues) with detailed steps to reproduce.

## 🐛 Issues & Support

Found a bug or have a feature request? Please [open an issue](https://github.com/TheGrieferKnight/Lightning/issues).

## 🗺️ Roadmap

### 🔄 Current Focus

- [ ] Core dashboard implementation
- [ ] Match history integration with Riot API
- [ ] Basic champion mastery display

### 🎯 Upcoming Features

- [ ] Real-time match statistics
- [ ] Win rate analytics and trends
- [ ] Advanced gameplay insights

### 🚀 Future Plans

- [ ] macOS and Linux releases
- [ ] Team composition analysis
- [ ] Build recommendations
- [ ] Tournament mode tracking

---

**⭐ If you find Lightning useful, please consider giving it a star!**
