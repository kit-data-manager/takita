FROM mcr.microsoft.com/playwright:v1.44.0-jammy

# Copy only Playwright dependencies first (better caching)
COPY package.json package-lock.json ./

RUN npm ci
RUN npx playwright install --with-deps

# Copy the rest of the Playwright project
COPY . .

# Default command (can be overridden by docker-compose)
CMD ["npx", "playwright", "test", "tests/", "--config", "playwright.config.docker.ts"]