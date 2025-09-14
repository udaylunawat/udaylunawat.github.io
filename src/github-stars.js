// GitHub stars fetcher - moved from inline HTML for better caching
const repoMap = {
  "Automatic-License-Plate-Recognition": "Automatic-License-Plate-Recognition",
  "Covid-19-Radiology": "Covid-19-Radiology",
  "Data-Science-Projects": "Data-Science-Projects"
};

async function fetchRepo(owner, repo) {
  const url = `https://api.github.com/repos/${owner}/${repo}`;
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    return r.json();
  } catch (e) {
    return null;
  }
}

async function updateStars() {
  const owner = "udaylunawat";
  const seen = {};
  for (const key in repoMap) {
    const repo = repoMap[key];
    if (seen[repo]) {
      const data = seen[repo];
      updateDomForKey(key, data);
      continue;
    }
    const data = await fetchRepo(owner, repo);
    seen[repo] = data;
    updateDomForKey(key, data);
  }
}

function updateDomForKey(key, data) {
  const elIdMap = {
    "Automatic-License-Plate-Recognition": "stats-Automatic-License-Plate-Recognition",
    "Covid-19-Radiology": "stats-Covid-19-Radiology",
    "Data-Science-Projects": "stats-Data-Science-Projects"
  };
  const elId = elIdMap[key];
  const el = document.getElementById(elId);
  if (!el) return;
  if (!data) {
    el.textContent = '⭐ — · 🍴 —';
    return;
  }
  const stars = data.stargazers_count ?? 0;
  const forks = data.forks_count ?? 0;
  el.textContent = `⭐ ${stars} · 🍴 ${forks}`;
}

document.addEventListener('DOMContentLoaded', () => {
  updateStars().catch(()=>{}); // Silent failure for GitHub API
});
