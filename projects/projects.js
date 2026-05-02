import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

const projectsContainer = document.querySelector('.projects');
const searchInput = document.querySelector('.searchBar');

let allProjects = [];
try {
  allProjects = await fetchJSON('../lib/projects.json');
} catch (error) {
  console.error('Could not load projects.json:', error);
}

let query = '';
/** Year string matching `pie` slice labels, or `null` when nothing is selected. */
let selectedYear = null;

const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
const colors = d3.scaleOrdinal(d3.schemeTableau10);

function filterBySearch(projects, q) {
  const needle = q.trim().toLowerCase();
  if (!needle) return projects;
  return projects.filter((project) => {
    const values = Object.values(project).join('\n').toLowerCase();
    return values.includes(needle);
  });
}

function getSearchFiltered() {
  return filterBySearch(allProjects, query);
}

function getDisplayedProjects() {
  const searched = getSearchFiltered();
  if (!selectedYear) return searched;
  return searched.filter((p) => String(p.year) === selectedYear);
}

function renderPieChart(projectsForPie) {
  const svg = d3.select('#projects-pie-plot');
  const legend = d3.select('.legend');

  svg.selectAll('path').remove();
  legend.selectAll('li').remove();

  if (!projectsForPie.length) {
    return;
  }

  const rolledData = d3
    .rollups(
      projectsForPie,
      (v) => v.length,
      (d) => d.year,
    )
    .sort((a, b) => String(a[0]).localeCompare(String(b[0])));

  const data = rolledData.map(([year, count]) => ({
    value: count,
    label: String(year),
  }));

  const sliceGenerator = d3.pie().value((d) => d.value);
  const arcData = sliceGenerator(data);
  const arcs = arcData.map((d) => arcGenerator(d));

  arcs.forEach((arc, i) => {
    const year = data[i].label;
    svg
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(i))
      .attr('class', selectedYear === year ? 'selected' : '')
      .on('click', () => {
        selectedYear = selectedYear === year ? null : year;
        syncViews();
      });
  });

  data.forEach((d, idx) => {
    legend
      .append('li')
      .attr(
        'class',
        `legend-item${selectedYear === d.label ? ' selected' : ''}`,
      )
      .attr('style', `--color:${colors(idx)}`)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
      .on('click', () => {
        selectedYear = selectedYear === d.label ? null : d.label;
        syncViews();
      });
  });
}

function syncViews() {
  renderProjects(getDisplayedProjects(), projectsContainer, 'h2');
  renderPieChart(getSearchFiltered());
}

const titleEl = document.querySelector('.projects-title');
if (titleEl) {
  titleEl.textContent = `Projects (${allProjects.length})`;
}

syncViews();

searchInput?.addEventListener('input', (event) => {
  query = event.target.value;
  selectedYear = null;
  syncViews();
});
