# Caching Fetch Framework

This project provides a framework for rendering React applications with a caching fetch implementation that works both client-side and server-side.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

### Installation

```bash
npm install
```

### Running the Development Server

```bash
npm start
```

Visit [http://localhost:3000](http://localhost:3000) to see the application running.

## Project Structure

- `/caching-fetch-library` - Contains the caching fetch implementation
- `/framework` - Contains the server, client runtime, and MSW mock server
- `/app` - Contains the application that uses the framework and caching fetch library

## Features

- **Server-Side Rendering (SSR)** - The application can be rendered on the server with pre-loaded data
- **Client-Side Navigation** - The application can navigate between pages without a full page reload
- **Caching Fetch Library** - A library for caching fetch requests, both on the client and server
- **Mock Server** - An MSW mock server for running the application without a network connection

## Caching Fetch Library

The caching fetch library provides two main functions:

- `useCachingFetch` - A React hook for fetching and caching data in components
- `preloadCachingFetch` - A function for preloading data during server-side rendering

### Usage

```jsx
// Client-side component
import { useCachingFetch } from './caching-fetch-library';

function MyComponent() {
  const [data, loading, error] = useCachingFetch('/api/data');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{JSON.stringify(data)}</div>;
}

// Server-side rendering
import { preloadCachingFetch } from './caching-fetch-library';

async function renderServerSide() {
  const data = await preloadCachingFetch('/api/data');
  // Render the application with the preloaded data
}
```

## Configuration Choices

### TypeScript Configuration

This project uses TypeScript with strict type checking enabled to ensure code quality and catch errors early. The `tsconfig.json` file is configured with:

- `strict: true` - Enables all strict type checking options
- `esModuleInterop: true` - Allows for cleaner imports from CommonJS modules
- `jsx: react-jsx` - Uses the new JSX transform from React 17+

### ESLint and Prettier

I've added ESLint and Prettier for code quality and consistent formatting:

```bash
npm install --save-dev eslint prettier eslint-config-prettier eslint-plugin-react eslint-plugin-react-hooks @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

Configuration files:
- `.eslintrc.js` - Contains ESLint rules
- `.prettierrc` - Contains Prettier formatting rules

### Testing Configuration

Added Jest and React Testing Library for unit and integration testing:

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

### CI/CD Pipeline

Added GitHub Actions workflow for continuous integration:

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16.x'
    - run: npm ci
    - run: npm run build
    - run: npm test
```

## Deployment

This application can be deployed to various platforms. Here's an example for deploying to Vercel:

1. Install the Vercel CLI: `npm install -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts to deploy the application

## Known Issues and Next Steps

### Known Issues

- The caching mechanism does not have an expiration policy
- Error handling could be more robust
- No proper retry mechanism for failed requests

### Next Steps

- Add cache expiration and invalidation strategies
- Implement request deduplication for concurrent requests to the same URL
- Add proper error boundaries to handle fetch failures gracefully
- Add comprehensive test coverage
- Add offline support using service workers
- Implement a more sophisticated state management solution for larger applications
- Add proper documentation for the API using JSDoc or TypeDoc

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.