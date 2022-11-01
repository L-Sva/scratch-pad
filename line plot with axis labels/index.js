'use strict';

const svgWidth = 700;
const svgHeight = 500;

const margin = { top: 60, right: 30, bottom: 60, left: 60 };
const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

const svg = d3.select('svg')
  .style('border-style', 'solid')
  .attr('width', svgWidth)
  .attr('height', svgHeight);

const svgG = svg.append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);


// for Walmart
let CIK = 104169;
CIK = String(CIK).padStart(10, '0');
let urlEnd = `/CIK${CIK}.json`;
let submiUrl = 'https://data.sec.gov/submissions' + urlEnd;
let factUrl = 'https://data.sec.gov/api/xbrl/companyfacts' + urlEnd;

// console.log(`await (await fetch('${factUrl}')).json()`);

(async function main() {

  // get data ready
  let resp = await fetch('./data/walmart_facts.json');
  let rData = await resp.json();
  let cName = rData.entityName;
  let profits = rData.facts['us-gaap'].ProfitLoss.units.USD;
  let yearProf = profits.filter(p => (
    p.fp === 'FY' && /^CY\d{4}$/.test(p.frame)
  ));
  yearProf.forEach(d => d.year =
    d3.timeParse('%Y')(/^CY(\d{4})$/.exec(d.frame)[1]));

  // plot x- and y-axis
  const x = d3.scaleTime()
    .domain(d3.extent(yearProf, d => d.year))
    .range([0, width]);

  const xAxisGen = d3.axisBottom(x);

  svgG.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(xAxisGen);

  svgG.append('text')
    .attr('text-anchor', 'middle')
    .attr('x', width / 2)
    .attr('y', height)
    .attr('dy', '2.5em')
    .text('Year');

  const y = d3.scaleLinear()
    .domain([0, d3.max(yearProf, d => d.val)])
    .range([height, 0]);

  const yAxisGen = d3.axisLeft(y)
    .tickFormat(d => d / 1e9);

  svgG.append('g')
    .call(yAxisGen);

  svgG.append('text')
    .attr('text-anchor', 'middle')
    .attr('x', -height / 2)
    .attr('dy', '-2em')
    .attr('transform', 'rotate(-90)')
    .text('Profit ($ bn)');

  // draw line graph
  svgG.append('path')
    .datum(yearProf)
    .attr('fill', 'none')
    .attr('stroke', 'black')
    .attr('stroke-width', 1.5)
    .attr('d', d3.line()
      .x(d => x(d.year))
      .y(d => y(d.val))
    );

  // add title
  svg.append('text')
    .attr('font-size', '1.6em')
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle')
    .attr('x', svgWidth / 2)
    .attr('y', margin.top / 2)
    .text('Walmart Annual Profits');

})()

