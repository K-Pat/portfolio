import { fetchJSON, renderProjects, fetchGithubData } from './global.js';

const projectsContainer = document.querySelector('.projects');

let projects = [];
try {
  projects = await fetchJSON('./lib/projects.json');
} catch (error) {
  console.error('Could not load projects.json:', error);
}

const latestProjects = projects.slice(0, 3);
renderProjects(latestProjects, projectsContainer, 'h2');

const profileStats = document.querySelector('#profile-stats');
try {
  const githubData = await fetchGithubData('K-Pat');
  if (profileStats) {
    profileStats.innerHTML = `
        <dl>
          <dt>Public Repos</dt><dd>${githubData.public_repos}</dd>
          <dt>Public Gists</dt><dd>${githubData.public_gists}</dd>
          <dt>Followers</dt><dd>${githubData.followers}</dd>
          <dt>Following</dt><dd>${githubData.following}</dd>
        </dl>
    `;
  }
} catch (error) {
  console.error('GitHub API error:', error);
  if (profileStats) {
    profileStats.innerHTML =
      '<p>GitHub stats could not be loaded (network or rate limit).</p>';
  }
}
