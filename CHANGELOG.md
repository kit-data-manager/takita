# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0]

### Added

- New major feature: indexing and annotating text data in TEI xml format. XPathSelector and TextQuoteSelector are now supported in addition to SVGSelectors
- New actuator: health (`/actuator/health`)
- New actuator: update or rebuild the search index via HTTP POST request (`/actuator/searchIndex`)
- New dashboard: annotation table, listing all annotations
- New dashboard: annotation dashboard with statistics about annotation activity
- Basic extraction of metadata commonly found in teiHeader structure
- Authentication / AAI (Keycloak) support
- ExistDB can now be used as an optional data service to retrieve XML content from there instead of directly from the base-repo.
- !TODO! SKOSMOS / Thesaurus
- API and Routing: `/editor_rest/content/{pageId}/{fileName}` serves the xml content to be annotated
- API and Routing: annotations can now be updated by providing WADM payload (PUT `/editor_rest/annotations/{id}` with Content-Type `application/ld+json`)
- API and Routing: custom templates can now be added and will be routed under (`/addon/<template>`)
- API and Routing: POST to `/annodash/data` responds with json query result to SPARQL payload
- Additional application.properties (!TODO!)

### Changed
- Dockerization: we now ship a docker compose stack that includes all components necessary to set up tAKITA (in addition to the basic setup with tAKITA and elastic only).
- "Show Annotations" table now shows all annotations available on a page / document part (only displayed image annotations without specific selector before)
- Frontend now utilizes npm. The necessary steps to install and build are included in the gradle build chain.

### Fixed
- Fix concurrency issue on quickly loading multiple editor tabs leading to annotations ending up in the wrong page (EditorService doesn't store currentPage as stored variable in the SessionScope anymore).
- Fix opening the document navigation in editor screen shifts content slightly to the left due to horizontal scroll bar
### Security

### Dependencies

## [1.0.0] - 2024-10-25

### Added
- basic e2e-Testing with hurl and docker

### Changed
- Rest API call to create annotation now returns HTTP 500 on more errors (annotationserver non success codes, i.e. container not existing).
- Unified pseudonym input field on all pages
- Bump to bootstrap 5 with slight changes to look of UI elements. Breaking change: read-only elements currently look editable in annotation forms (until incompatible jsonforms lib is removed)
- Removal of custom modal implementations

### Fixed
- Fix repeated prompt for user name on editor window
- Fix movement with ctrl key to prevent unintended image moving

### Security