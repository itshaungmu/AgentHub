# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.11] - 2026-03-26

### Fixed
- **API Export**: Added `uninstallCommand` to index.js exports for programmatic access

## [0.4.10] - 2026-03-26

### Documentation
- **README Updates**: Added uninstall command to CLI commands table
- **README_CN Updates**: Added uninstall, verify, doctor commands to command list
- Improved documentation completeness for all lifecycle commands

## [0.4.9] - 2026-03-26

### Added
- **Uninstall Command**: `agenthub uninstall <agent-slug>` - Remove installed agents from workspace
  - Deletes .agenthub directory and install record
  - Clear confirmation message with installation history
  - Help text available via `agenthub uninstall --help`

### Testing
- **Uninstall Tests**: Added 3 new tests for uninstall command
  - Uninstall removes installed agent
  - Uninstall fails for non-existent install
  - Uninstall shows help
- Test count increased from 43 to 46 (100% pass rate)

## [0.4.8] - 2026-03-26

### Added
- **Verbose Mode**: Global `--verbose` flag for detailed logging
  - Shows debug information during operations
  - Useful for troubleshooting and understanding operation flow
  - Example: `agenthub pack --verbose --workspace ./my-agent`

### Improvements
- Better debug logging infrastructure
- Enhanced error traceability

## [0.4.7] - 2026-03-26

### Bug Fixes
- **Empty Tags Handling**: Fixed crash when passing empty string to --tags option
- **Type Safety**: Added proper type checking for string options

### Testing
- **Edge Case Tests**: Added 15 new tests for robustness
  - Missing workspace/config handling
  - Non-existent agent operations
  - Empty/invalid input handling
  - Long names and special characters
- Test count increased from 28 to 43 (100% pass rate)

## [0.4.6] - 2026-03-26

### Bug Fixes
- **Empty Tags Handling**: Fixed crash when passing empty string to --tags option
- **Type Safety**: Added proper type checking for string options

### Testing
- **Edge Case Tests**: Added 15 new tests for error handling and edge cases
  - Missing workspace/config handling
  - Non-existent agent operations
  - Empty/invalid input handling
  - Long names and special characters
- Test count increased from 28 to 43 (100% pass rate)

### Quality
- Improved error messages and recovery
- Better handling of invalid inputs

## [0.4.5] - 2026-03-26

### UI Improvements
- **Featured Badge**: Featured agents now display a ⭐ badge in Web UI
  - Featured cards have a subtle gradient background
  - Featured cards have enhanced hover effects
  - Visual distinction for quality/verified agents

### CSS Enhancements
- Added `.agent-card-featured` class for featured styling
- Added `.featured-badge` component

## [0.4.4] - 2026-03-26

### Added
- **Featured Flag**: `--featured` option for pack command to mark quality agents
  - Agents marked as featured get highlighted in Web UI
  - Useful for promoting verified/official agents

### Testing
- **Featured Flag Test**: Added test for --featured option
- Test count increased from 27 to 28 (100% pass rate)

## [0.4.3] - 2026-03-26

### Added
- **JSON Output Support**: `--json` flag for machine-readable output
  - `agenthub list --json` - List installed agents as JSON
  - `agenthub search "query" --json` - Search results as JSON
  - `agenthub info <agent> --json` - Agent details as JSON
  - Useful for scripting and CI/CD integration

### Improved
- Better command help documentation with all options listed

## [0.4.2] - 2026-03-26

### Documentation
- **Enhanced API Documentation**: Added comprehensive HTTP API reference
  - Added health check endpoint
  - Added download endpoint
  - Added ranking endpoint
  - Added publish/upload endpoints
  - Improved examples with curl commands

## [0.4.1] - 2026-03-26

### Added
- **Pack Name Option**: `--name` option for pack command to specify custom agent name
  - Allows setting a friendly name different from directory name
  - Automatically generates slug from the name
  - Example: `agenthub pack --name "Code Helper"`

### Testing
- **Name Option Test**: Added test for custom name in pack command
- Test count increased from 26 to 27 (100% pass rate)

## [0.4.0] - 2026-03-26

### Documentation
- **README Updates**: Updated CLI command documentation
  - Added `doctor` command to command list
  - Added `--version` option example for pack command
  - Improved pack command description

### Improvements
- Better documentation alignment with actual CLI capabilities
- Clearer versioning workflow examples

## [0.3.9] - 2026-03-26

### Added
- **Pack Version Option**: `--version` option for pack command to specify bundle version
  - Now supports custom versioning: `agenthub pack --version 2.5.0`
  - Default version remains 1.0.0 if not specified

### Testing
- **Version Option Test**: Added test for custom version in pack command
- Test count increased from 25 to 26 (100% pass rate)

## [0.3.8] - 2026-03-26

### UX Improvements
- **Enhanced Error Suggestions**: More comprehensive error detection and actionable advice
  - Added suggestions for "agent not found" errors
  - Added suggestions for "validation" errors
  - Added suggestions for "version" errors
  - Added doctor command recommendation for troubleshooting
- **FAQ Enhancement**: Added doctor command troubleshooting section

### Documentation
- Updated docs/faq.md with doctor command usage and scenarios

## [0.3.7] - 2026-03-26

### Testing
- **Query Commands Tests**: Added comprehensive test coverage for search, info, stats, versions
  - search command lists agents from local registry
  - search command filters by query
  - info command shows agent details
  - stats command shows agent statistics
  - versions command lists available versions
  - query commands show help
  - stats command fails for non-existent agent
- Test count increased from 18 to 25 (100% pass rate)

### Quality Improvements
- All CLI query commands now have dedicated test coverage
- Improved test isolation and cleanup

## [0.3.6] - 2026-03-26

### Testing
- **Doctor Command Tests**: Added comprehensive test coverage for `agenthub doctor`
  - Basic diagnostic check test
  - Help output test
  - Full diagnostic with test suite test
- Test count increased from 15 to 18 (100% pass rate)

### Quality Improvements
- All CLI commands now have test coverage
- Improved test organization

## [0.3.5] - 2026-03-26

### Documentation
- **Enhanced Sample Agent Documentation**: Comprehensive README updates for all sample agents
  - code-review-assistant: Added more usage examples, best practices, installation options
  - team-knowledge-assistant: Added knowledge management scenarios, team usage guidelines
  - product-doc-writer: Added API documentation examples, style guide, optimization tips

### Content Improvements
- Each sample agent now includes:
  - Use case descriptions with scenario tables
  - Multiple installation methods (remote and local)
  - Detailed usage examples with expected outputs
  - Technical requirements
  - Version history tables

## [0.3.4] - 2026-03-26

### Added
- **Doctor Command**: `agenthub doctor` - Diagnose AgentHub installation and environment issues
  - Check Node.js version compatibility
  - Verify AgentHub package installation
  - Test CLI executable
  - Verify sample agents availability
  - Check documentation completeness
  - Test network connectivity to remote server

### UX Improvements
- New diagnostic tool helps users troubleshoot installation issues
- Clear actionable suggestions when problems are detected

## [0.3.3] - 2026-03-26

### Documentation
- **Quality Report v0.3.2**: Updated quality assessment with 90-day PRD completion status
- Overall quality score: 8.8/10 (improved from 8.6/10)
- All 4 milestones (M1-M4) completed

### Summary
90 天 PRD 里程碑全部完成，产品已具备发布质量

## [0.3.2] - 2026-03-26

### Community
- **GitHub Issue Templates**: Add bug report, feature request, and feedback templates
- Issue template config with links to docs and discussions

### Documentation
- Complete M1-C3 milestone: All community entry points ready

## [0.3.1] - 2026-03-26

### UX Improvements
- **Smart Error Suggestions**: Automatically detect common error types and provide actionable advice
- **Debug Logger**: Add `src/lib/debug.js` for performance tracing
- Enable debug mode with `AGENTHUB_DEBUG=true`

### Error Detection
- File not found → Check path suggestions
- Permission denied → Sudo advice
- Network issues → Connection check tips

## [0.3.0] - 2026-03-26

### Milestone
🎉 **90 天 PRD 里程碑完成**

### Documentation
- **Quality Report v0.2.9**: Complete product quality assessment
- Overall quality score: 8.6/10
- All 15 tests passing (100%)
- 3 official sample agents verified

### Recommendation
Product is ready for external promotion

## [0.2.9] - 2026-03-26

### Documentation
- **Release Content Package**: Complete Week 1 distribution content
- Include title options, body templates, and checklists
- Add FAQ presets for external promotion

## [0.2.8] - 2026-03-26

### Documentation
- **Weekly Metrics Dashboard**: Comprehensive tracking template for growth and product KPIs
- Includes 90-day goal tracking and milestone monitoring

## [0.2.7] - 2026-03-26

### Documentation
- **CONTRIBUTING.md**: Complete rewrite with project structure and development guide
- Fixed GitHub repository URLs throughout documentation
- Added commit conventions and code style guidelines

## [0.2.6] - 2026-03-26

### Added
- **Growth Plan**: 4-week external distribution plan with content templates
- **Feedback System**: Comprehensive feedback form and GitHub Issue template

### Documentation
- docs/growth-plan.md: External distribution strategy
- docs/feedback-form.md: User feedback collection template
- .github/ISSUE_TEMPLATE/feedback.md: GitHub Issue template

## [0.2.5] - 2026-03-26

### Documentation
- **FAQ Page**: Comprehensive FAQ covering installation, usage, and troubleshooting
- Updated README with FAQ link

## [0.2.4] - 2026-03-26

### Documentation
- **Team Distribution Guide**: Complete tutorial for team leaders to standardize agent distribution
- **Quick Start 3 Steps**: 10-minute onboarding guide for new users
- Added documentation links in README

### Changed
- Improved README structure with tutorial section

## [0.2.3] - 2026-03-26

### Added
- **Team Knowledge Assistant Sample**: New sample agent for team knowledge Q&A
- **Product Documentation Writer Sample**: New sample agent for creating product docs
- **3 Official Sample Agents**: Now includes code-review, knowledge-assistant, and doc-writer

### Documentation
- Each sample agent includes complete workspace files and README
- Sample agents demonstrate different use cases (code review, knowledge management, documentation)

## [0.2.2] - 2026-03-25

### Added
- **Official Sample Agent**: Added `code-review-assistant` sample agent in `/samples` directory
- **Sample Agent Tutorial**: New "试用样板 Agent" section in README for quick onboarding

### Documentation
- Complete quick start tutorial with step-by-step sample agent workflow
- Sample agent includes AGENTS.md, SOUL.md, USER.md, IDENTITY.md, TOOLS.md

## [0.2.1] - 2026-03-25

### Changed
- **Enhanced verify command**: Colorized output with detailed health checks and actionable suggestions
- **Enhanced update/rollback commands**: Better formatted output with version change information and follow-up hints
- **Improved Chinese localization**: All lifecycle commands now have fully Chinese output

## [0.2.0] - 2026-03-25

### Added
- **OpenClaw-first positioning**: Clear product positioning focused on OpenClaw Agent distribution
- **Improved documentation**: README restructured with 3-step quick start guide
- **Target user clarification**: Added "适合谁/不适合谁" section to README

### Changed
- **README overhaul**: Translated to Chinese, emphasizing OpenClaw Agent distribution workflow
- **Fixed repository URLs**: All links now point to correct GitHub repository (itshaungmu/AgentHub)
- **Added npm badge**: Package version now visible in README header

### Documentation
- Updated CHANGELOG with complete version history
- Fixed GitHub comparison links in CHANGELOG

## [0.1.8] - 2026-03-25

### Added
- Colorized CLI output for better user experience

## [0.1.7] - 2026-03-25

### Changed
- Refactored code for better maintainability
- Extracted `requireArg` helper in CLI
- Extracted `sortByDownloadsAndTime` utility
- Centralized agentSpec parsing with `parseSpec`
- Extracted shared version utilities and management logic

### Removed
- Unused `skill-md.js` file
- Unused `download-stats.js` file

## [0.1.6] - 2026-03-24

### Added
- Remote update/rollback workflow support
- Install verification command (`verify`)
- Remote browse commands support
- Lifecycle commands exposed in CLI
- Install record tracking

### Fixed
- Network request fallback to curl
- Improved remote install error messages
- Allow install without `--target-workspace` (defaults to current directory)

## [0.1.5] - 2026-03-23

### Added
- Remote server install support
- Resilient remote install fetch with Node http fallback

### Fixed
- Download count not incrementing on remote install
- Support both short name and URI format for install command

## [0.1.1] - 2026-03-22

### Fixed
- Install UX improvements: shebang + remote server install support

## [0.1.0] - 2026-03-20

### Added
- Initial release of AgentHub
- `pack` command - Pack OpenClaw workspace into Agent Bundle
- `publish` command - Publish bundle to local registry
- `publish-remote` command - Publish bundle to remote HTTP server
- `search` command - Search agents in registry
- `info` command - View agent details
- `install` command - Install agent to target workspace
- `list` command - List installed agents in workspace
- `versions` command - View agent version history
- `update` command - Update agent to latest version
- `rollback` command - Rollback agent to specified version
- `stats` command - View agent statistics
- `serve` command - Start HTTP server with Web UI and API
- Support for layered memory (public/portable/private)
- HTTP API for remote operations
- Dark-themed Web UI with i18n support (EN/中文)
- Complete test coverage

### Documentation
- README with quick start guide
- CONTRIBUTING guide
- MIT License

[0.4.11]: https://github.com/itshaungmu/AgentHub/compare/v0.4.10...v0.4.11
[0.4.10]: https://github.com/itshaungmu/AgentHub/compare/v0.4.9...v0.4.10
[0.4.9]: https://github.com/itshaungmu/AgentHub/compare/v0.4.8...v0.4.9
[0.4.8]: https://github.com/itshaungmu/AgentHub/compare/v0.4.7...v0.4.8
[0.4.7]: https://github.com/itshaungmu/AgentHub/compare/v0.4.6...v0.4.7
[0.4.6]: https://github.com/itshaungmu/AgentHub/compare/v0.4.5...v0.4.6
[0.4.5]: https://github.com/itshaungmu/AgentHub/compare/v0.4.4...v0.4.5
[0.4.4]: https://github.com/itshaungmu/AgentHub/compare/v0.4.3...v0.4.4
[0.4.3]: https://github.com/itshaungmu/AgentHub/compare/v0.4.2...v0.4.3
[0.4.1]: https://github.com/itshaungmu/AgentHub/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/itshaungmu/AgentHub/compare/v0.3.9...v0.4.0
[0.3.9]: https://github.com/itshaungmu/AgentHub/compare/v0.3.8...v0.3.9
[0.3.8]: https://github.com/itshaungmu/AgentHub/compare/v0.3.7...v0.3.8
[0.3.7]: https://github.com/itshaungmu/AgentHub/compare/v0.3.6...v0.3.7
[0.3.6]: https://github.com/itshaungmu/AgentHub/compare/v0.3.5...v0.3.6
[0.3.5]: https://github.com/itshaungmu/AgentHub/compare/v0.3.4...v0.3.5
[0.3.4]: https://github.com/itshaungmu/AgentHub/compare/v0.3.3...v0.3.4
[0.3.3]: https://github.com/itshaungmu/AgentHub/compare/v0.3.2...v0.3.3
[0.3.2]: https://github.com/itshaungmu/AgentHub/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/itshaungmu/AgentHub/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/itshaungmu/AgentHub/compare/v0.2.9...v0.3.0
[0.2.9]: https://github.com/itshaungmu/AgentHub/compare/v0.2.8...v0.2.9
[0.2.8]: https://github.com/itshaungmu/AgentHub/compare/v0.2.7...v0.2.8
[0.2.7]: https://github.com/itshaungmu/AgentHub/compare/v0.2.6...v0.2.7
[0.2.6]: https://github.com/itshaungmu/AgentHub/compare/v0.2.5...v0.2.6
[0.2.5]: https://github.com/itshaungmu/AgentHub/compare/v0.2.4...v0.2.5
[0.2.4]: https://github.com/itshaungmu/AgentHub/compare/v0.2.3...v0.2.4
[0.2.3]: https://github.com/itshaungmu/AgentHub/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/itshaungmu/AgentHub/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/itshaungmu/AgentHub/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/itshaungmu/AgentHub/compare/v0.1.8...v0.2.0
[0.1.8]: https://github.com/itshaungmu/AgentHub/compare/v0.1.7...v0.1.8
[0.1.7]: https://github.com/itshaungmu/AgentHub/compare/v0.1.6...v0.1.7
[0.1.6]: https://github.com/itshaungmu/AgentHub/compare/v0.1.5...v0.1.6
[0.1.5]: https://github.com/itshaungmu/AgentHub/compare/v0.1.1...v0.1.5
[0.1.1]: https://github.com/itshaungmu/AgentHub/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/itshaungmu/AgentHub/releases/tag/v0.1.0
