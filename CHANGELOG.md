# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
While status above is 'unreleased', you may and should add all major changes of your feature branch if merge-ready for development. Final list may be tweaked on release branch. Checking changelog is mandatory on merge review.

### Added

### Changed
- Rest API call to create annotation now returns HTTP 500 on more errors (annotationserver non success codes, i.e. container not existing).

### Fixed
- Fix repeated prompt for user name on editor window
### Security