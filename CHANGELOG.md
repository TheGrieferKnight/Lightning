## [unreleased]

### 🚀 Features

- Data is now cached, loaded from cache first and only refetched after specific intervals. Saved locally for now
- SidebarNav and mock pages added
- Matches in history can now be expanded

### 🐛 Bug Fixes

- Summoner Spells will now actually be the ones from the enemy team, prev your team every time
- Workflow navigates to src-tauri directory and should work now
- Cargo commands now contain manifest path
- Added correct name for Wukong : MonkeyKing

### 💼 Other

- Summoner Spells Overlay uses correct paths now

### 🚜 Refactor

- The different Data Objects used by the Riot API are now complete
- Various idiomatic improvements to data_dragon.rs
- Various idiomatic improvements and added tracing for better logging
- More idiomatic improvments

### ⚙️ Miscellaneous Tasks

- Various clippy warning and typescript warnings fixed so it now can be build
- Automatic linting & formating on push and on pull request
