// You may edit this file, add new files to support this file,
// and/or add new dependencies to the project as you see fit.
// However, you must not change the surface API presented from this file,
// and you should not need to change any other files in the project to complete the challenge

import { useState, useEffect } from "react";

// Define the cache structure
type CacheEntry = {
  data: unknown;
  error: Error | null;
  timestamp: number;
  promise?: Promise<unknown>;
};

// Global cache object
let cache: Record<string, CacheEntry> = {};

type UseCachingFetch = (url: string) => {
  isLoading: boolean;
  data: unknown;
  error: Error | null;
};

/**
 * 1. Implement a caching fetch hook. The hook should return an object with the following properties:
 * - isLoading: a boolean that is true when the fetch is in progress and false otherwise
 * - data: the data returned from the fetch, or null if the fetch has not completed
 * - error: an error object if the fetch fails, or null if the fetch is successful
 *
 * This hook is called three times on the client:
 *  - 1 in App.tsx
 *  - 2 in Person.tsx
 *  - 3 in Name.tsx
 *
 * Acceptance Criteria:
 * 1. The application at /appWithoutSSRData should properly render, with JavaScript enabled, you should see a list of people.
 * 2. You should only see 1 network request in the browser's network tab when visiting the /appWithoutSSRData route.
 * 3. You have not changed any code outside of this file to achieve this.
 * 4. This file passes a type-check.
 *
 */
export const useCachingFetch: UseCachingFetch = (url) => {
  const [state, setState] = useState<{
    isLoading: boolean;
    data: unknown;
    error: Error | null;
  }>({
    isLoading: !cache[url] || !("data" in cache[url]),
    data: cache[url]?.data ?? null,
    error: cache[url]?.error ?? null,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      // If we already have data in the cache, use it
      if (cache[url] && "data" in cache[url] && cache[url].data !== undefined) {
        setState({
          isLoading: false,
          data: cache[url].data,
          error: null,
        });
        return;
      }

      // If there's already a pending request, wait for it
      if (cache[url] && cache[url].promise) {
        try {
          const data = await cache[url].promise;
          if (isMounted) {
            setState({
              isLoading: false,
              data,
              error: null,
            });
          }
        } catch (error) {
          if (isMounted) {
            setState({
              isLoading: false,
              data: null,
              error: error instanceof Error ? error : new Error(String(error)),
            });
          }
        }
        return;
      }

      // Start a new fetch
      setState({ isLoading: true, data: null, error: null });

      const fetchPromise = fetch(url).then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      });

      // Store the promise in the cache to prevent duplicate requests
      cache[url] = {
        ...cache[url],
        timestamp: Date.now(),
        promise: fetchPromise,
      };

      try {
        const data = await fetchPromise;

        // Update the cache with the result
        cache[url] = {
          data,
          error: null,
          timestamp: Date.now(),
        };

        if (isMounted) {
          setState({
            isLoading: false,
            data,
            error: null,
          });
        }
      } catch (error) {
        // Store the error in the cache
        cache[url] = {
          data: null,
          error: error instanceof Error ? error : new Error(String(error)),
          timestamp: Date.now(),
        };

        if (isMounted) {
          setState({
            isLoading: false,
            data: null,
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [url]);

  return state;
};

/**
 * 2. Implement a preloading caching fetch function. The function should fetch the data.
 *
 * This function will be called once on the server before any rendering occurs.
 *
 * Any subsequent call to useCachingFetch should result in the returned data being available immediately.
 * Meaning that the page should be completely serverside rendered on /appWithSSRData
 *
 * Acceptance Criteria:
 * 1. The application at /appWithSSRData should properly render, with JavaScript disabled, you should see a list of people.
 * 2. You have not changed any code outside of this file to achieve this.
 * 3. This file passes a type-check.
 *
 */
export const preloadCachingFetch = async (url: string): Promise<void> => {
  // If we already have data in the cache, no need to fetch again
  if (cache[url] && "data" in cache[url] && cache[url].data !== undefined) {
    return;
  }

  // If there's already a pending request, wait for it
  if (cache[url] && cache[url].promise) {
    try {
      await cache[url].promise;
    } catch (error) {
      // Error is stored in the cache already
    }
    return;
  }

  try {
    const fetchPromise = fetch(url).then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    });

    // Store the promise in the cache to prevent duplicate requests
    cache[url] = {
      ...cache[url],
      timestamp: Date.now(),
      promise: fetchPromise,
    };

    const data = await fetchPromise;

    // Update the cache with the result
    cache[url] = {
      data,
      error: null,
      timestamp: Date.now(),
    };
  } catch (error) {
    // Store the error in the cache
    cache[url] = {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
      timestamp: Date.now(),
    };

    // Rethrow so the server can handle it
    throw error;
  }
};

/**
 * 3.1 Implement a serializeCache function that serializes the cache to a string.
 * 3.2 Implement an initializeCache function that initializes the cache from a serialized cache string.
 *
 * Together, these two functions will help the framework transfer your cache to the browser.
 *
 * The framework will call `serializeCache` on the server to serialize the cache to a string and inject it into the dom.
 * The framework will then call `initializeCache` on the browser with the serialized cache string to initialize the cache.
 *
 * Acceptance Criteria:
 * 1. The application at /appWithSSRData should properly render, with JavaScript enabled, you should see a list of people.
 * 2. You should not see any network calls to the people API when visiting the /appWithSSRData route.
 * 3. You have not changed any code outside of this file to achieve this.
 * 4. This file passes a type-check.
 *
 */
export const serializeCache = (): string => {
  // Create a sanitized version of the cache without the promises
  const sanitizedCache: Record<string, Omit<CacheEntry, "promise">> = {};

  for (const [key, entry] of Object.entries(cache)) {
    const { promise, ...rest } = entry;
    sanitizedCache[key] = rest;
  }

  // Return the serialized cache
  return JSON.stringify(sanitizedCache);
};

export const initializeCache = (serializedCache: string): void => {
  if (!serializedCache) return;

  try {
    const parsedCache = JSON.parse(serializedCache) as Record<
      string,
      Omit<CacheEntry, "promise">
    >;

    // Merge the parsed cache with the existing cache
    cache = { ...parsedCache };
  } catch (error) {
    console.error("Failed to initialize cache:", error);
  }
};

export const wipeCache = (): void => {
  cache = {};
};
