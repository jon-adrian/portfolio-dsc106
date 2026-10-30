import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');
const projectsTitle = document.querySelector('.projects-title');

let query = '';
let selectedYear = null;

let searchInput = document.querySelector('.searchBar');

// Apply both filters together
function updateProjects() {
    let filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();

        let matchesSearch = values.includes(query.toLowerCase());
        let matchesYear = selectedYear === null || project.year === selectedYear;

        return matchesSearch && matchesYear;
    });

    renderProjects(filteredProjects, projectsContainer, 'h2');
    projectsTitle.textContent = `${filteredProjects.length} Projects`;
}

// Get projects matching the search query
function getSearchResults() {
    return projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query.toLowerCase());
    });
}

// Update chart and project cards when searching
searchInput.addEventListener('input', (event) => {
    query = event.target.value;

    updateProjects();
    renderPieChart(getSearchResults());
});

// Render the pie chart
function renderPieChart(projectsGiven) {
    let rolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year,
    );

    let data = rolledData.map(([year, count]) => {
        return { value: count, label: year };
    });

    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let sliceGenerator = d3.pie().value((d) => d.value);
    let arcData = sliceGenerator(data);
    let arcs = arcData.map((d) => arcGenerator(d));

    let colors = d3.scaleOrdinal(d3.schemeTableau10);

    // Clear previous chart
    let svg = d3.select('#projects-pie-plot');
    svg.selectAll('path').remove();

    // Draw pie slices
    arcs.forEach((arc, idx) => {
        let year = data[idx].label;

        svg.append('path')
            .attr('d', arc)
            .attr('fill', colors(idx))
            .classed('selected', selectedYear === year)
            .on('click', () => {
                // Toggle year selection
                selectedYear = selectedYear === year ? null : year;

                // Update highlighting
                svg.selectAll('path')
                    .classed('selected', (_, i) =>
                        data[i].label === selectedYear
                    );

                d3.select('.legend')
                    .selectAll('li')
                    .classed('selected', (_, i) =>
                        data[i].label === selectedYear
                    );

                // Apply both search and year filters
                updateProjects();
            });
    });

    // Clear previous legend
    let legend = d3.select('.legend');
    legend.selectAll('li').remove();

    // Draw updated legend
    data.forEach((d, idx) => {
        legend.append('li')
            .attr('style', `--color:${colors(idx)}`)
            .attr('class', 'legend-item')
            .classed('selected', selectedYear === d.label)
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });
}

// Initial page rendering
updateProjects();
renderPieChart(projects);