// GitHub stars fetcher with rate limit handling and caching
// Dynamically loads repository mappings from project HTML files
let repoMap = {};

// Cache for API responses (24 hour expiry)
const CACHE_KEY = 'github-stars-cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

function getCache() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data = JSON.parse(cached);
    if (Date.now() - data.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data.repos;
  } catch (e) {
    return null;
  }
}

function setCache(repos) {
  try {
    const data = {
      repos,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (e) {
    // Ignore localStorage errors
  }
}

// Extract GitHub repository name from URL
function extractRepoName(githubUrl) {
  try {
    const url = new URL(githubUrl);
    if (url.hostname === 'github.com') {
      const pathParts = url.pathname.split('/').filter(part => part);
      if (pathParts.length >= 2) {
        return pathParts[1]; // Repository name is the second part
      }
    }
  } catch (e) {
    // Invalid URL
  }
  return null;
}

// Load repository mappings from project HTML files
async function loadRepoMappings() {
  try {
    // First load projects.json to get project IDs
    const projectsResponse = await fetch('./projects.json');
    if (!projectsResponse.ok) {
      console.warn('Could not load projects.json');
      return;
    }

    const projectsData = await projectsResponse.json();
    const projects = projectsData.projects || [];

    // Load each project HTML file and extract GitHub links
    const repoPromises = projects.map(async (project) => {
      try {
        const htmlResponse = await fetch(`./projects/${project.id}.html`);
        if (!htmlResponse.ok) {
          console.warn(`Could not load ${project.id}.html`);
          return;
        }

        const htmlText = await htmlResponse.text();

        // Extract GitHub repository URL from HTML
        const githubMatch = htmlText.match(/href="([^"]*github\.com\/[^"]*)"/i);
        if (githubMatch) {
          const repoName = extractRepoName(githubMatch[1]);
          if (repoName) {
            // Map project ID to repository name for DOM element lookup
            repoMap[project.id] = repoName;
          }
        }
      } catch (error) {
        console.warn(`Error loading ${project.id}.html:`, error);
      }
    });

    await Promise.all(repoPromises);
    console.log('Loaded repository mappings:', repoMap);

  } catch (error) {
    console.error('Failed to load repository mappings:', error);
    // Fallback to hardcoded mappings if dynamic loading fails
    repoMap = {
      "Automatic-License-Plate-Recognition": "Automatic-License-Plate-Recognition",
      "Covid-19-Radiology": "Covid-19-Radiology",
      "Data-Science-Projects": "Data-Science-Projects"
    };
  }
}



async function fetchRepoWithRetry(owner, repo, maxRetries = 3) {
  const url = `https://api.github.com/repos/${owner}/${repo}`;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          // Add User-Agent to avoid 403 errors
          'User-Agent': 'udaylunawat.github.io'
        }
      });

      // Handle rate limiting (403)
      if (response.status === 403) {
        const resetTime = response.headers.get('X-RateLimit-Reset');
        if (resetTime) {
          const waitTime = (parseInt(resetTime) * 1000 - Date.now()) + 1000; // Add 1 second buffer
          if (waitTime > 0 && waitTime < 3600000) { // Wait up to 1 hour
            console.log(`Rate limited. Waiting ${Math.ceil(waitTime/1000)} seconds...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue; // Retry after waiting
          }
        }
        // If no reset time or too long to wait, return cached data or null
        return null;
      }

      // Handle other errors
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`Repository ${owner}/${repo} not found`);
          return null;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();

    } catch (error) {
      console.warn(`Attempt ${attempt + 1} failed for ${owner}/${repo}:`, error.message);

      // If this is not the last attempt, wait with exponential backoff
      if (attempt < maxRetries - 1) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt), 30000); // Max 30 seconds
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  return null; // All retries failed
}

async function updateStars() {
  const owner = "udaylunawat";

  // Try to load from cache first
  let cachedRepos = getCache();
  if (cachedRepos) {
    console.log('Using cached GitHub data');
    // Update DOM with cached data immediately
    for (const key in repoMap) {
      const repo = repoMap[key];
      if (cachedRepos[repo]) {
        updateDomForKey(key, cachedRepos[repo]);
      }
    }
  }

  // Fetch fresh data
  const freshRepos = {};
  const promises = [];

  for (const key in repoMap) {
    const repo = repoMap[key];
    promises.push(
      fetchRepoWithRetry(owner, repo).then(data => {
        freshRepos[repo] = data;
        updateDomForKey(key, data);
      })
    );
  }

  try {
    await Promise.all(promises);

    // Cache the fresh data
    if (Object.keys(freshRepos).length > 0) {
      setCache(freshRepos);
    }
  } catch (error) {
    console.error('Failed to update some GitHub stats:', error);
    // Keep cached data if available
  }
}

function updateDomForKey(key, data) {
  // Generate element ID from key (project ID)
  const elId = `stats-${key}`;
  const el = document.getElementById(elId);
  if (!el) {
    console.warn(`Element ${elId} not found for project ${key}`);
    return;
  }

  if (!data) {
    // Show loading state or fallback
    el.textContent = '⭐ — · 🍴 —';
    el.title = 'Unable to load GitHub stats';
    return;
  }

  const stars = data.stargazers_count ?? 0;
  const forks = data.forks_count ?? 0;
  el.textContent = `⭐ ${stars} · 🍴 ${forks}`;
  el.title = `${stars} stars, ${forks} forks on GitHub`;
  console.log(`Updated ${elId} with ${stars} stars, ${forks} forks`);
}

// Wait for content loader to finish before initializing GitHub stars
function waitForContentLoader() {
  return new Promise((resolve) => {
    // Check if content loader has already finished
    if (window.contentLoaderInitialized) {
      resolve();
      return;
    }

    // Listen for custom event from content loader
    document.addEventListener('contentLoaderReady', () => {
      resolve();
    });

    // Fallback: wait a bit and check again
    setTimeout(() => {
      if (window.contentLoaderInitialized) {
        resolve();
      } else {
        console.warn('Content loader not ready, proceeding anyway');
        resolve();
      }
    }, 2000);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Wait for content loader to finish populating the DOM
    await waitForContentLoader();

    // First load repository mappings from project HTML files
    await loadRepoMappings();

    // Then update stars with the loaded mappings
    await updateStars();
  } catch (error) {
    console.error('GitHub stars initialization failed:', error);
  }
});
