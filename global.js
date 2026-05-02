console.log('IT\u2019S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export async function fetchJSON(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
    throw error;
  }
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  if (!containerElement) return;

  containerElement.innerHTML = '';

  const tag = /^h[1-6]$/i.test(headingLevel)
    ? String(headingLevel).toLowerCase()
    : 'h2';

  if (!Array.isArray(projects) || projects.length === 0) {
    containerElement.innerHTML = '<p>No projects to display yet.</p>';
    return;
  }

  for (const project of projects) {
    const title = project.title ?? 'Untitled';
    const image =
      typeof project.image === 'string' && /^https?:\/\//.test(project.image)
        ? project.image
        : 'https://vis-society.github.io/labs/2/images/empty.svg';
    const description = project.description ?? '';
    const year = project.year != null ? String(project.year) : '';
    const yearLine = year
      ? `<p class="project-year-line"><time datetime="${escapeHtml(year)}">${escapeHtml(year)}</time></p>`
      : '';

    const article = document.createElement('article');
    article.innerHTML = `
    <${tag}>${escapeHtml(title)}</${tag}>
    <img src="${escapeHtml(image)}" alt="${escapeHtml(title)}">
    <div class="project-body">
      <p>${escapeHtml(description)}</p>
      ${yearLine}
    </div>
  `;
    containerElement.appendChild(article);
  }
}

export async function fetchGithubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}

/** GitHub Pages project URL segment (repository name). Change if your repo is not "portfolio". */
const REPO_SLUG = 'portfolio';

const BASE_PATH =
  location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? '/'
    : `/${REPO_SLUG}/`;

function normalizePathname(pathname) {
  let p = pathname;
  if (p.endsWith('/index.html')) {
    p = p.slice(0, -'/index.html'.length);
  }
  if (p.endsWith('/') && p.length > 1) {
    p = p.slice(0, -1);
  }
  return p || '/';
}

const pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact' },
  { url: 'cv/', title: 'CV' },
  { url: 'https://github.com/K-Pat', title: 'GitHub' },
];

const nav = document.createElement('nav');
document.body.prepend(nav);

for (const p of pages) {
  let url = p.url;
  url = !url.startsWith('http') ? BASE_PATH + url : url;

  const a = document.createElement('a');
  a.href = url;
  a.textContent = p.title;
  a.classList.toggle(
    'current',
    a.host === location.host &&
      normalizePathname(a.pathname) === normalizePathname(location.pathname),
  );
  if (a.host !== location.host) {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  }
  nav.append(a);
}

document.body.insertAdjacentHTML(
  'afterbegin',
  `<label class="color-scheme">
		Theme:
		<select>
			<option value="light dark">Automatic</option>
			<option value="light">Light</option>
			<option value="dark">Dark</option>
		</select>
	</label>`,
);

const select = document.querySelector('.color-scheme select');

function setColorScheme(scheme) {
  document.documentElement.style.setProperty('color-scheme', scheme);
}

if ('colorScheme' in localStorage) {
  setColorScheme(localStorage.colorScheme);
  select.value = localStorage.colorScheme;
}

select.addEventListener('input', (event) => {
  setColorScheme(event.target.value);
  localStorage.colorScheme = event.target.value;
});

const form = document.querySelector('form[action^="mailto:"]');
form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const parts = [];
  for (const [name, value] of data) {
    parts.push(`${encodeURIComponent(name)}=${encodeURIComponent(value)}`);
  }
  const url = `${form.action}?${parts.join('&')}`;
  location.href = url;
});
