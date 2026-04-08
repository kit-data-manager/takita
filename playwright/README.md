# Playwright Developer Documentation

Playwright allows to write end-to-end tests for UI as if a user would be navigate and click through the application.
Playwright tests are an addition to unit tests and integration tests, not a replacement.

In this project you can use playwright to run tests
1. from within the docker stack (e2e profile)
1. against docker stack from perspective of the host system
1. against your local native tAKITA setup

Playwright is configured for such flexibility. Depending on your usage scenario you may need to adapt the configuration.

## Installation

If you want to use playwright locally (option 2. and 3. above), you can install it with the following steps

### Prerequesites

- Node.js
- npm

### Steps

```bash
cd playwright
npm ci
npx playwright install #install system browsers
```

## Usage

### Local development

To run playwright against the docker compose stack, make sure the stack is running.

```
npx playwright test tests/
```

To use it with any other local tAKITA, you may need to change the baseURL in `playwright.config.ts`
(or provide your own config).

Playwright will write an html report to `./reports` and some screenshots to `./screenshots`

### Other

Additionally, two config files are provided: 

`playwright.config.docker.ts` is used when running playwright
as part of the docker compose stack (including CI):

```
docker compose --profile=e2e up -d
```

`playwright.config.demo.ts` can be used to create artifacts such as videos or screenshots from running the tests
(for example for demonstration purposes or to compare tAKITA versions)

```
npx playwright test tests/ -c playwright.config.demo.ts
```

Videos will be written to `./test-results`

## Developing Tests

- do not use absolute URLs in your test. Instead, utilize the 'baseURL' configuration
- Aim for side effect free tests whenever possible (this may, for example, not be possible in regard to the user db)
  - modify only your own creations
  - delete your own creations
  - keep tests independent
- Avoid relying on details that are subject to change (i.e. automated identifiers)

## References

- [Official Docs – Browsers](https://playwright.dev/docs/browsers)
- [Configuration – use options](https://playwright.dev/docs/test-use-options)
- [Docker Guide](https://playwright.dev/docs/docker)
- [Writing Tests](https://playwright.dev/docs/writing-tests)