# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [TBD]

### Added

### Changed

### Fixed
- Fix concurrency issue on quickly loading multiple editor tabs leading to annotations ending up in the wrong page (EditorService doesn't store currentPage as stored variable in the SessionScope anymore).

### Security

## [1.0.0] - 2024-10-25

### Added

### Changed
- Rest API call to create annotation now returns HTTP 500 on more errors (annotationserver non success codes, i.e. container not existing).
- Unified pseudonym input field on all pages
- Bump to bootstrap 5 with slight changes to look of UI elements. Breaking change: read-only elements currently look editable in annotation forms (until incompatible jsonforms lib is removed)
- Removal of custom modal implementations

### Fixed
- Fix repeated prompt for user name on editor window
- Fix movement with ctrl key to prevent unintended image moving

### Security