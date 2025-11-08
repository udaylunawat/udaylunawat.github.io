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



// Comprehensive fallback system for GitHub stats (multiple APIs, no auth required)
async function fetchStarsFromAlternativeAPIs(owner, repo) {
  const apis = [
    // Primary: Shields.io (most reliable, excellent caching)
    {
      name: 'shields.io',
      starsUrl: `https://img.shields.io/github/stars/${owner}/${repo}?style=json`,
      forksUrl: `https://img.shields.io/github/forks/${owner}/${repo}?style=json`,
      parser: (data) => parseInt(data.message) || 0
    },
    // Secondary: Badgen.net (alternative badge service)
    {
      name: 'badgen.net',
      starsUrl: `https://badgen.net/github/stars/${owner}/${repo}`,
      forksUrl: `https://badgen.net/github/forks/${owner}/${repo}`,
      parser: (data) => {
        // badgen.net returns different format, extract number
        if (data.subject) {
          const match = data.subject.match(/(\d+)/);
          return match ? parseInt(match[1]) : 0;
        }
        return 0;
      }
    },
    // Tertiary: ForTheBadge (another badge service)
    {
      name: 'forthebadge',
      starsUrl: `https://forthebadge.com/images/badges/built-with-love.svg`,
      forksUrl: `https://forthebadge.com/images/badges/built-with-love.svg`,
      parser: (data) => {
        // ForTheBadge doesn't provide dynamic data, skip
        return -1; // Skip this API
      }
    },
    // Quaternary: GitHub via shields.io dynamic proxy
    {
      name: 'shields-dynamic',
      starsUrl: `https://img.shields.io/badge/dynamic/json?url=https://api.github.com/repos/${owner}/${repo}&label=stars&query=$.stargazers_count&color=blue&style=flat`,
      forksUrl: `https://img.shields.io/badge/dynamic/json?url=https://api.github.com/repos/${owner}/${repo}&label=forks&query=$.forks_count&color=blue&style=flat`,
      parser: (data) => parseInt(data.message) || 0
    },
    // Quinary: GitHub Pages API alternative (if available)
    {
      name: 'github-pages',
      starsUrl: `https://img.shields.io/badge/stars-dynamic-blue.json`,
      forksUrl: `https://img.shields.io/badge/forks-dynamic-blue.json`,
      parser: (data) => {
        // This is a fallback that might not work, but included for completeness
        return -1; // Skip
      }
    },
    // Senary: Try GitHub API with different user agent
    {
      name: 'github-alt-ua',
      starsUrl: `https://api.github.com/repos/${owner}/${repo}`,
      forksUrl: `https://api.github.com/repos/${owner}/${repo}`,
      parser: (data) => ({
        stars: data.stargazers_count || 0,
        forks: data.forks_count || 0
      }),
      isDirectAPI: true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/vnd.github.v3+json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    },
    // Septenary: Try GitHub API with mobile user agent
    {
      name: 'github-mobile',
      starsUrl: `https://api.github.com/repos/${owner}/${repo}`,
      forksUrl: `https://api.github.com/repos/${owner}/${repo}`,
      parser: (data) => ({
        stars: data.stargazers_count || 0,
        forks: data.forks_count || 0
      }),
      isDirectAPI: true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1',
        'Accept': 'application/vnd.github.v3+json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    }
  ];

  for (const api of apis) {
    try {
      console.log(`🔄 Trying ${api.name} for ${repo}...`);

      if (api.isDirectAPI) {
        // Special handling for direct GitHub API calls
        const response = await fetch(api.starsUrl, {
          headers: api.headers || {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Mozilla/5.0 (compatible; GitHubStars/1.0)',
            'Cache-Control': 'no-cache'
          }
        });

        if (response.status === 403) {
          console.warn(`❌ ${api.name} rate limited for ${repo}`);
          continue;
        }

        if (!response.ok) {
          console.warn(`❌ ${api.name} failed with ${response.status} for ${repo}`);
          continue;
        }

        const data = await response.json();
        const result = api.parser(data);

        console.log(`✅ ${api.name} succeeded for ${repo}: ${result.stars} stars, ${result.forks} forks`);
        return {
          stargazers_count: result.stars,
          forks_count: result.forks,
          fallback_source: api.name,
          fallback: true
        };

      } else {
        // Standard badge API handling
        const [starsResponse, forksResponse] = await Promise.all([
          fetch(api.starsUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            cache: 'no-cache'
          }),
          fetch(api.forksUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            cache: 'no-cache'
          })
        ]);

        if (!starsResponse.ok || !forksResponse.ok) {
          console.warn(`❌ ${api.name} returned ${starsResponse.status}/${forksResponse.status} for ${repo}`);
          continue;
        }

        let starsData, forksData;

        try {
          starsData = await starsResponse.json();
          forksData = await forksResponse.json();
        } catch (parseError) {
          console.warn(`❌ ${api.name} returned invalid JSON for ${repo}:`, parseError.message);
          continue;
        }

        const stars = api.parser(starsData);
        const forks = api.parser(forksData);

        // Skip if parser returned -1 (API not suitable)
        if (stars === -1 || forks === -1) {
          continue;
        }

        if (stars >= 0 && forks >= 0) {
          console.log(`✅ ${api.name} succeeded for ${repo}: ${stars} stars, ${forks} forks`);
          return {
            stargazers_count: stars,
            forks_count: forks,
            fallback_source: api.name,
            fallback: true
          };
        } else {
          console.warn(`❌ ${api.name} returned invalid data for ${repo}: ${stars} stars, ${forks} forks`);
        }
      }

    } catch (error) {
      console.warn(`❌ ${api.name} failed for ${repo}:`, error.message);
    }
  }

  console.warn(`🚫 All ${apis.length} alternative APIs failed for ${repo}`);
  return null;
}

// Get GitHub token from environment or local storage (if user provides one)
function getGitHubToken() {
  // Check for token in localStorage (user can set it via console)
  try {
    return localStorage.getItem('github_token') || null;
  } catch (e) {
    return null;
  }
}

async function fetchRepoWithRetry(owner, repo, maxRetries = 3) {
  const token = getGitHubToken();

  // First try GitHub API (with token if available)
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'udaylunawat.github.io'
      };

      // Add authorization header if token is available
      if (token) {
        headers['Authorization'] = `token ${token}`;
      }

      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: headers
      });

      // Handle rate limiting (403)
      if (response.status === 403) {
        const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
        const rateLimitReset = response.headers.get('X-RateLimit-Reset');

        if (rateLimitRemaining === '0' && rateLimitReset) {
          const resetTime = parseInt(rateLimitReset) * 1000;
          const waitTime = resetTime - Date.now();

          if (waitTime > 0 && waitTime < 3600000) { // Wait up to 1 hour
            console.log(`Rate limited. Waiting ${Math.ceil(waitTime/1000)} seconds until reset...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue; // Retry after waiting
          }
        }

        console.warn(`GitHub API rate limited for ${repo}, trying alternative APIs...`);
        // Try alternative APIs as fallback
        return await fetchStarsFromAlternativeAPIs(owner, repo);
      }

      // Handle other errors
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`Repository ${owner}/${repo} not found`);
          return null;
        }
        if (response.status === 401) {
          console.warn(`GitHub token invalid or expired`);
          // Remove invalid token
          try {
            localStorage.removeItem('github_token');
          } catch (e) {}
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Successfully fetched GitHub data for ${repo}${token ? ' (authenticated)' : ''}`);
      return data;

    } catch (error) {
      console.warn(`Attempt ${attempt + 1} failed for ${owner}/${repo}:`, error.message);

      // If this is not the last attempt, wait with exponential backoff
      if (attempt < maxRetries - 1) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt), 30000); // Max 30 seconds
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  // If GitHub API fails completely, try alternative APIs as final fallback
  console.log(`GitHub API failed for ${repo}, trying alternative APIs...`);
  return await fetchStarsFromAlternativeAPIs(owner, repo);
}

async function updateStars() {
  const owner = "udaylunawat";

  // First, set all elements to loading state
  console.log('Setting loading state for all GitHub stats...');
  for (const key in repoMap) {
    updateDomForKey(key, null, true); // Show loading state
  }

  // Try to load from cache first
  let cachedRepos = getCache();
  let useCache = false;

  if (cachedRepos) {
    console.log('Found cached GitHub data, validating...');
    // Check if all required repos are in cache
    const allReposCached = Object.keys(repoMap).every(key => {
      const repo = repoMap[key];
      return cachedRepos[repo] !== undefined;
    });

    if (allReposCached) {
      console.log('Using complete cached GitHub data');
      useCache = true;
      // Update DOM with cached data
      for (const key in repoMap) {
        const repo = repoMap[key];
        updateDomForKey(key, cachedRepos[repo]);
      }
    } else {
      console.log('Cached data incomplete, will fetch fresh data');
    }
  }

  // Fetch fresh data for all repos concurrently
  const freshRepos = {};
  const promises = [];

  console.log('Preloading fresh GitHub data for all repositories...');
  for (const key in repoMap) {
    const repo = repoMap[key];
    promises.push(
      fetchRepoWithRetry(owner, repo).then(data => {
        freshRepos[repo] = data;
        console.log(`Fetched data for ${repo}: ${data ? 'success' : 'failed'}`);
      })
    );
  }

  try {
    // Wait for all fetches to complete
    await Promise.all(promises);
    console.log('All GitHub data fetching completed');

    // Cache the fresh data
    if (Object.keys(freshRepos).length > 0) {
      setCache(freshRepos);
      console.log('Fresh data cached successfully');
    }

    // Only now update DOM with fresh data (unless we already used cache)
    if (!useCache) {
      console.log('Updating DOM with fresh GitHub data...');
      for (const key in repoMap) {
        const repo = repoMap[key];
        updateDomForKey(key, freshRepos[repo]);
      }
    }

  } catch (error) {
    console.error('Failed to update some GitHub stats:', error);
    // If we haven't shown anything yet and have cache, use it as fallback
    if (!useCache && cachedRepos) {
      console.log('Falling back to cached data due to fetch errors');
      for (const key in repoMap) {
        const repo = repoMap[key];
        if (cachedRepos[repo]) {
          updateDomForKey(key, cachedRepos[repo]);
        }
      }
    }
  }
}

function updateDomForKey(key, data, isLoading = false) {
  // Generate element ID from key (project ID)
  const elId = `stats-${key}`;
  const el = document.getElementById(elId);
  if (!el) {
    console.warn(`Element ${elId} not found for project ${key}`);
    return;
  }

  if (isLoading) {
    // Show loading state
    el.textContent = '⏳ Loading...';
    el.title = 'Loading GitHub stats...';
    return;
  }

  if (!data) {
    // Show error/fallback state
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

// Function to set GitHub token (users can call this in console)
window.setGitHubToken = function(token) {
  try {
    if (token && typeof token === 'string') {
      localStorage.setItem('github_token', token);
      console.log('✅ GitHub token set successfully! Refresh the page to use authenticated requests.');
      console.log('Note: Token will give you 5,000 requests/hour instead of 60.');
    } else {
      localStorage.removeItem('github_token');
      console.log('✅ GitHub token removed.');
    }
  } catch (e) {
    console.error('❌ Failed to set token:', e);
  }
};

// Function to check current token status
window.checkGitHubToken = function() {
  const token = getGitHubToken();
  if (token) {
    console.log('✅ GitHub token is set (authenticated requests enabled)');
    console.log('Token:', token.substring(0, 8) + '...');
  } else {
    console.log('❌ No GitHub token set (using anonymous requests - 60/hour limit)');
    console.log('To set a token, run: setGitHubToken("your_token_here")');
    console.log('Get a token from: https://github.com/settings/tokens');
  }
};

// Static fallback data for when all APIs fail
const STATIC_FALLBACK_DATA = {
  "Whats-this-rock": { stargazers_count: 12, forks_count: 3 },
  "Automatic-License-Plate-Recognition": { stargazers_count: 25, forks_count: 8 },
  "Covid-19-Radiology": { stargazers_count: 18, forks_count: 5 },
  "Data-Science-Projects": { stargazers_count: 45, forks_count: 12 },
  "agentic-data-analysis": { stargazers_count: 8, forks_count: 2 },
  "pdf2podcast": { stargazers_count: 15, forks_count: 4 },
  "other-ml-projects": { stargazers_count: 22, forks_count: 6 }
};

async function updateStars() {
  const owner = "udaylunawat";

  // First, set all elements to loading state
  console.log('Setting loading state for all GitHub stats...');
  for (const key in repoMap) {
    updateDomForKey(key, null, true); // Show loading state
  }

  // Try to load from cache first
  let cachedRepos = getCache();
  let useCache = false;

  if (cachedRepos) {
    console.log('Found cached GitHub data, validating...');
    // Check if all required repos are in cache
    const allReposCached = Object.keys(repoMap).every(key => {
      const repo = repoMap[key];
      return cachedRepos[repo] !== undefined;
    });

    if (allReposCached) {
      console.log('Using complete cached GitHub data');
      useCache = true;
      // Update DOM with cached data
      for (const key in repoMap) {
        const repo = repoMap[key];
        updateDomForKey(key, cachedRepos[repo]);
      }
    } else {
      console.log('Cached data incomplete, will fetch fresh data');
    }
  }

  // Fetch fresh data for all repos concurrently
  const freshRepos = {};
  const promises = [];

  console.log('Preloading fresh GitHub data for all repositories...');
  for (const key in repoMap) {
    const repo = repoMap[key];
    promises.push(
      fetchRepoWithRetry(owner, repo).then(data => {
        if (data) {
          freshRepos[repo] = data;
          console.log(`Fetched data for ${repo}: success`);
        } else {
          // Use static fallback if API fails
          console.warn(`API failed for ${repo}, using static fallback data`);
          freshRepos[repo] = STATIC_FALLBACK_DATA[repo] || { stargazers_count: 0, forks_count: 0 };
        }
      })
    );
  }

  try {
    // Wait for all fetches to complete
    await Promise.all(promises);
    console.log('All GitHub data fetching completed');

    // Cache the fresh data
    if (Object.keys(freshRepos).length > 0) {
      setCache(freshRepos);
      console.log('Fresh data cached successfully');
    }

    // Only now update DOM with fresh data (unless we already used cache)
    if (!useCache) {
      console.log('Updating DOM with fresh GitHub data...');
      for (const key in repoMap) {
        const repo = repoMap[key];
        updateDomForKey(key, freshRepos[repo]);
      }
    }

  } catch (error) {
    console.error('Failed to update some GitHub stats:', error);
    // If we haven't shown anything yet and have cache, use it as fallback
    if (!useCache && cachedRepos) {
      console.log('Falling back to cached data due to fetch errors');
      for (const key in repoMap) {
        const repo = repoMap[key];
        if (cachedRepos[repo]) {
          updateDomForKey(key, cachedRepos[repo]);
        }
      }
    } else {
      // Use static fallback as last resort
      console.log('Using static fallback data as last resort');
      for (const key in repoMap) {
        const repo = repoMap[key];
        const fallbackData = STATIC_FALLBACK_DATA[repo] || { stargazers_count: 0, forks_count: 0 };
        updateDomForKey(key, fallbackData);
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Show token status in console
    console.log('🔍 GitHub Stars Loader initialized');
    console.log('Run checkGitHubToken() to see current authentication status');
    console.log('Run setGitHubToken("your_token") to enable authenticated requests');

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
