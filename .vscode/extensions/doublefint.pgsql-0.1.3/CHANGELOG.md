# Change Log
All notable changes to the "vscode-pgsql" extension will be documented in this file.

## [Unreleased]

## 0.1.3
### Added
- Few keywords for syntax

## 0.1.2
### Added
- few types to completion dictionary

## 0.1.1
### Added
- option to enable/disable code completion, reload required
- option to enable/disable signature help, reload required

## 0.1.0
### Changed
- Signature loaded from Postgres 9.5
### Fixed
- Signature completion for multiline scenario
- Restore snippets

## 0.0.9
### Fixed
- Signature completion

## 0.0.8
### Added
- Run only selected text in large pgsql files - just select and press Ctrl+F5
    or execute whole file if you don't have selection
- Create temporary file instead autosave changed pgsql file before execution

## 0.0.7
### Added
- run pgsql files - press Ctrl+F5 
- autosave changed pgsql file before run

### Changed
- change [Create Function](http://rob.conery.io/2015/02/21/its-time-to-get-over-that-stored-procedure-aversion-you-have/) snippet 

## 0.0.2
### Added
- connection config with port and password
- stderr output ( thanks for [khushboo shah](https://marketplace.visualstudio.com/items?itemName=JPTarquino.postgresql) )

### Changed
- renamed to *pgsql*