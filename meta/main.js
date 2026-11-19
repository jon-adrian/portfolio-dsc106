import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

let xScale;
let yScale;
let commitProgress = 100;
let colors = d3.scaleOrdinal(d3.schemeTableau10);

async function loadData() {
    const data = await d3.csv('loc.csv', (row) => ({
      ...row,
      line: Number(row.line),
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + 'T00:00' + row.timezone),
      datetime: new Date(row.datetime),
    }));
  
    return data;
  }
  
function processCommits(data) {
    return d3
      .groups(data, (d) => d.commit)
      .map(([commit, lines]) => {
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;
  
        let ret = {
          id: commit,
          url: 'https://github.com/jon-adrian/portfolio-dsc106/commit/' + commit,
          author,
          date,
          time,
          timezone,
          datetime,
          hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
          totalLines: lines.length,
        };
  
        Object.defineProperty(ret, 'lines', {
          value: lines,
          enumerable: false,
          writable: false,
          configurable: false,
        });
  
        return ret;
      });
  }

  function renderCommitInfo(data, commits) {
    const dl = d3.select('#stats')
      .append('dl')
      .attr('class', 'stats');
  
    function addStat(label, value) {
      const stat = dl.append('div');
      stat.append('dt').text(label);
      stat.append('dd').text(value);
    }
  
    addStat('Total LOC', data.length);
    addStat('Total commits', commits.length);
    addStat('Total files', d3.group(data, d => d.file).size);
    addStat('Average line length', d3.mean(data, d => d.length).toFixed(1));
    addStat('Longest line length', d3.max(data, d => d.length));
    addStat('Maximum depth', d3.max(data, d => d.depth));
  }  



  function renderTooltipContent(commit) {
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
  
    if (Object.keys(commit).length === 0) return;
  
    link.href = commit.url;
    link.textContent = commit.id;
  
    date.textContent = commit.datetime?.toLocaleString('en', {
      dateStyle: 'full',
    });
  
    // Additional fields
    document.getElementById('tooltip-commit-time').textContent =
      commit.datetime?.toLocaleTimeString('en');
  
    document.getElementById('commit-author').textContent =
      commit.author;
  
    document.getElementById('commit-lines').textContent =
      commit.totalLines;
  }
  
function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible;
  }
  
function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX + 12}px`;
    tooltip.style.top = `${event.clientY + 12}px`;
  }

  function createBrushSelector(svg) {
    svg.call(
      d3.brush()
        .on('start brush end', brushed)
    );
  
    svg.select('.dots').raise();
  }

function renderScatterPlot(data, commits) {
    // Dimensions of the scatterplot
    const width = 1000;
    const height = 600;
  
    // Create SVG
    const svg = d3
      .select('#chart')
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('overflow', 'visible');
  
    // X axis: Date of commit
    xScale = d3
      .scaleTime()
      .domain(d3.extent(commits, (d) => d.datetime))
      .range([0, width])
      .nice();
  
    // Y axis: Time of day (0-24 hours)
    yScale = d3
      .scaleLinear()
      .domain([0, 24])
      .range([height, 0]);
  

    const margin = { top: 20, right: 20, bottom: 40, left: 60 };

    // X axis
    const xAxis = d3.axisBottom(xScale);

    // Y axis
    const yAxis = d3.axisLeft(yScale)
    .tickFormat(d => `${d}:00`);

    svg.append('g')
    .attr('transform', `translate(0, ${height})`)
    .attr('class', 'x-axis')
    .call(xAxis);

    svg.append('g')
    .call(yAxis);

    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
  
    const rScale = d3.scaleSqrt()
  .domain([minLines, maxLines])
  .range([2, 30]);

    // Draw dots for each commit
    
    
    const gridlines = d3.axisLeft(yScale)
    .tickSize(-width)
    .tickFormat('');
    
    svg.append('g')
    .attr('class', 'gridlines')
    .call(gridlines);

    const dots = svg.append('g').attr('class', 'dots')

    const sortedCommits = d3.sort(commits, (d) => -d.totalLines);
  
    dots
    .selectAll('circle')
    .data(sortedCommits, (d) => d.id)
    .join('circle')
      .attr('cx', (d) => xScale(d.datetime))
      .attr('cy', (d) => yScale(d.hourFrac))
      .attr('r', (d) => rScale(d.totalLines))
      .style('fill-opacity', 0.7)
      .attr('fill', 'steelblue')

      .on('mouseenter', (event, commit) => {
        d3.select(event.currentTarget)
          .style('fill-opacity', 1);
      
        renderTooltipContent(commit);
        updateTooltipVisibility(true);
        updateTooltipPosition(event);
      })
      .on('mouseleave', (event) => {
        d3.select(event.currentTarget)
          .style('fill-opacity', 0.7);
      
        updateTooltipVisibility(false);
      });
      
      createBrushSelector(svg);
      
  }
  
function updateScatterPlot(data, commits) {
  const svg = d3.select('#chart').select('svg');

  if (commits.length > 0) {
    xScale.domain(d3.extent(commits, (d) => d.datetime));
  }

  const xAxis = d3.axisBottom(xScale);

  svg.select('.x-axis').call(xAxis);

  const [minLines, maxLines] = d3.extent(
    commits, (d) => d.totalLines
  );

  const rScale = d3.scaleSqrt()
    .domain([minLines ?? 0, maxLines ?? 1])
    .range([2, 30]);

  const sortedCommits = d3.sort(
    commits, (d) => -d.totalLines
  );

  svg.select('.dots')
    .selectAll('circle')
    .data(sortedCommits, (d) => d.id)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', (d) => rScale(d.totalLines))
    .attr('fill', 'steelblue')
    .style('fill-opacity', 0.7)
    .on('mouseenter', (event, commit) => {
      d3.select(event.currentTarget)
        .style('fill-opacity', 1);

      renderTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mouseleave', (event) => {
      d3.select(event.currentTarget)
        .style('fill-opacity', 0.7);

      updateTooltipVisibility(false);
    });
}

function updateFileDisplay(filteredCommits) {
  let lines = filteredCommits.flatMap((d) => d.lines);

  let files = d3
  .groups(lines, (d) => d.file)
  .map(([name, lines]) => {
    return { name, lines };
  })
  .sort((a, b) => b.lines.length - a.lines.length);


  let filesContainer = d3
    .select('#files')
    .selectAll('div')
    .data(files, (d) => d.name)
    .join(
      (enter) =>
        enter.append('div').call((div) => {
          div.append('dt').append('code');
          div.select('dt').append('small');
          div.append('dd');
        }),
    );


    filesContainer.select('dt > code').text((d) => d.name);

    filesContainer.select('dt > small')
      .text((d) => `${d.lines.length} lines`);
    

      filesContainer
      .select('dd')
      .selectAll('div')
      .data((d) => d.lines)
      .join('div')
      .attr('class', 'loc')
      .attr('style', (d) => `--color: ${colors(d.type)}`);
    
    
}

function isCommitSelected(selection, commit) {
    if (!selection) {
      return false;
    }
  
    const [[x0, y0], [x1, y1]] = selection;
  
    const x = xScale(commit.datetime);
    const y = yScale(commit.hourFrac);
  
    return x >= x0 && x <= x1 &&
           y >= y0 && y <= y1;
  }

function renderSelectionCount(selection) {
    const selectedCommits = selection
      ? commits.filter((d) => isCommitSelected(selection, d))
      : [];
  
    const countElement = document.querySelector('#selection-count');
  
    countElement.textContent = `${
      selectedCommits.length || 'No'
    } commits selected`;
  
    return selectedCommits;
  }
  
  
function renderLanguageBreakdown(selection) {
    const selectedCommits = selection
      ? commits.filter((d) => isCommitSelected(selection, d))
      : [];
  
    const container = document.getElementById('language-breakdown');
  
    if (selectedCommits.length === 0) {
      container.innerHTML = '';
      return;
    }
  
    const requiredCommits = selectedCommits.length
      ? selectedCommits
      : commits;
  
    const lines = requiredCommits.flatMap((d) => d.lines);
  
    const breakdown = d3.rollup(
      lines,
      (v) => v.length,
      (d) => d.type
    );
  
    container.innerHTML = '';
  
    for (const [language, count] of breakdown) {
      const proportion = count / lines.length;
      const formatted = d3.format('.1~%')(proportion);
  
      container.innerHTML += `
        <dt>${language}</dt>
        <dd>${count} lines (${formatted})</dd>
      `;
    }
  }  

  function brushed(event) {
    const selection = event.selection;
  
    d3.select('#chart')
      .selectAll('.dots circle')
      .classed('selected', (d) =>
        isCommitSelected(selection, d)
      );
  
    renderSelectionCount(selection);
    renderLanguageBreakdown(selection);
  }  
  
  let data = await loadData();
  let commits = processCommits(data);
  let timeScale = d3
  .scaleTime()
  .domain([
    d3.min(commits, (d) => d.datetime),
    d3.max(commits, (d) => d.datetime),
  ])
  .range([0, 100]);

let commitMaxTime = timeScale.invert(commitProgress);

let filteredCommits = commits;
  renderCommitInfo(data, commits);
  renderScatterPlot(data, commits);
  function onTimeSliderChange() {
    commitProgress = Number(
      document.getElementById('commit-progress').value
    );
  
    commitMaxTime = timeScale.invert(commitProgress);
  
    document.getElementById('commit-time').textContent =
      commitMaxTime.toLocaleString('en', {
        dateStyle: 'long',
        timeStyle: 'short',
      });
      filteredCommits = commits.filter((d) => d.datetime <= commitMaxTime);
updateScatterPlot(data, filteredCommits);
updateFileDisplay(filteredCommits);
  }
  
  document
    .getElementById('commit-progress')
    .addEventListener('input', onTimeSliderChange);
  
  onTimeSliderChange();