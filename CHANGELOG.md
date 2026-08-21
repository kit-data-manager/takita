# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0-SNAPSHOT]

### Added

### Changed
- Docker image improvements (smaller, jre based image)

### Fixed

- Fix: searching for numerical or empty terms in document dashboard throws error instead of returning matching results

### Security

### Dependencies

## [2.0.0]

### Added

- New major feature: indexing and annotating text data in TEI xml format. XPathSelector and TextQuoteSelector are now supported in addition to SVGSelectors
- New actuator: health (`/actuator/health`)
- New actuator: update or rebuild the search index via HTTP POST request (`/actuator/searchIndex`)
- New dashboard: annotation table, listing all annotations
- New dashboard: annotation dashboard with statistics about annotation activity
- Basic extraction of metadata commonly found in teiHeader structure to be displayed in editor header.
- ExistDB can now be used as an optional data service to retrieve XML content from there instead of directly from the base-repo.
- API and Routing: `/editor_rest/content/{pageId}/{fileName}` serves the xml content to be annotated
- API and Routing: annotations can now be updated by providing WADM payload (PUT `/editor_rest/annotations/{id}` with Content-Type `application/ld+json`)
- API and Routing: custom templates can now be added and will be routed under (`/addon/<template>`)
- API and Routing: POST to `/annodash/data` responds with json query result to SPARQL payload
- UI: Configurable feedback link button (application property `takita.feedbackLink`)

### Changed
- Minimal java version changed from 17 to 21
- Native build now additionally requires node.js
- Dockerization: we now ship a docker compose stack that includes all components necessary to set up tAKITA (in addition to the basic setup with tAKITA and elastic only).
- "Show Annotations" table now shows all annotations available on a page / document part (only displayed image annotations without specific selector before)
- Frontend now utilizes npm. The necessary steps to install and build are included in the gradle build chain.
- Rendering of annotation marker (incl. color of image shape and text highlights) is now fully done by the frontend
- takita default container (as fallback) in WAP server can now be customized via application property `annotationStore.defaultContainer`
- takita can now be configured to be accessed under context path URL via application property `server.servlet.context-path`
- Thumbnails for document navigation in editors are now loaded lazily
- nicer multilingual tooltips in editors

### Fixed
- Fix: concurrency issue on quickly loading multiple editor tabs leading to annotations ending up in the wrong page (EditorService doesn't store currentPage as stored variable in the SessionScope anymore).
- Fix: creation of an additional annotation body on modification of annotation shape
- Fix: updating an image annotation may lead to wrapping of selector value in multiple `<svg></svg>` elements
- Fix: annotation container name may miss first character in comparison to repo publisher field content
- Fix: after creating a page annotation for an image other annotations cannot be selected or edited (mode not reset to view)
- Fix: opening the document navigation in editor screen shifts content slightly to the left due to horizontal scroll bar
- Fix: scrolling does not work properly on some books in the document overview table
- Fix: duplication of thumbnails in document overview table

### Security
- Authentication / AAI (Keycloak) support

### Dependencies
- Spring Boot to 3.5.11
- Spring Doc to 2.8.16
- com.google.code.gson:gson:2.13.2
- jakarta.json:jakarta.json-api:2.1.3

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