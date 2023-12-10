class RadialBarChart{
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = []; // Will be set in wrangleData

        this.selectedCountry = 'France'; // Default selected country
        this.selectedRegion = 'Europe'; // Default selected region
        console.log("radialdata", data)

        this.initVis();
    }

    initVis() {
        let vis = this;

        // Set dimensions and margins
        vis.margin = { top: 30, right: 10, bottom: 10, left: 10 };
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width  - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;
        vis.chartRadius = vis.height / 4 - 10;

        // Create SVG for Radial Bar Chart
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + (vis.chartRadius + vis.margin.left) + "," + (vis.chartRadius + vis.margin.top) + ")");

        vis.color = d3.scaleOrdinal(d3.schemeCategory10);

        // Tooltip for Radial Bar Chart
        vis.tooltip = d3.select('body').append('div')
            .attr('class', 'radialtooltip');

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // Filter data based on selected country and region
        vis.displayData = vis.data.filter(d => d.country === vis.selectedCountry && d.Arrival_Regions === vis.selectedRegion);
        console.log("radoa; data",vis.displayData);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Clear the existing SVG elements
        vis.svg.selectAll("*").remove();

        // Prepare the data for the radial bar chart
        let keys = vis.displayData.map(d => d.year);
        let values = vis.displayData.map(d => d.numArrivals);

        let scale = d3.scaleLinear()
            .domain([0, d3.max(values) * 1.1])
            .range([0, 2 * Math.PI]);

        let arcMinRadius = 10;
        let arcPadding = 10;
        let numArcs = keys.length;
        let arcWidth = (vis.chartRadius - arcMinRadius - numArcs * arcPadding) / numArcs;
        let numTicks = 10;
        let labelPadding = -5;

        let arc = d3.arc()
            .innerRadius((d, i) => getInnerRadius(i))
            .outerRadius((d, i) => getOuterRadius(i))
            .startAngle(0)
            .endAngle((d, i) => scale(d));





        // Axial axis
        let axialAxis = vis.svg.append('g')
            .attr('class', 'a axis')
            .selectAll('g')
            .data(scale.ticks(numTicks).slice(0, -1))
            .enter().append('g')
            .attr('transform', d => 'rotate(' + (rad2deg(scale(d)) - 90) + ')');

        axialAxis.append('line')
            .attr('x2', vis.chartRadius);

        axialAxis.append('text')
            .attr('x', vis.chartRadius + 10)
            .style('text-anchor', d => (scale(d) >= Math.PI && scale(d) < 2 * Math.PI ? 'end' : null))
            .attr('transform', d => 'rotate(' + (90 - rad2deg(scale(d))) + ',' + (vis.chartRadius + 15) + ',0)')
            .text(d => d);


        // Data arcs
        let arcs = vis.svg.append('g')
            .attr('class', 'data')
            .selectAll('path')
            .data(vis.displayData)
            .enter().append('path')
            .attr('class', 'arc')
            .style('fill', (d, i) => d.numArrivals > 0 ? vis.color(i) : "white")
            .style('opacity', 0.9) // Inline style for arc opacity
            .style('transition', 'opacity 0.5s');

        arcs.transition()
            .delay((d, i) => i * 200)
            .duration(1000)
            .attrTween('d', arcTween);



        // Attach mouseover and mouseout events
        arcs.on('mouseover', function(event, d) {
            // Show tooltip on mouseover
            showTooltip(event, d);
            d3.select(this).style('opacity', 0.5);
        })
            .on('mouseout', function(event, d) {
                // Hide tooltip on mouseout
                hideTooltip();
                d3.select(this).style('opacity', 0.9);
            });

        let radialAxis = vis.svg.append('g')
            .attr('class', 'r axis')
            .selectAll('g')
            .data(vis.displayData)
            .enter().append('g');

        radialAxis.append('circle')
            .attr('r', (d, i) => getOuterRadius(i) + arcPadding);


        radialAxis.append('text')
            .attr('x', labelPadding)
            .attr('y', (d, i) => -getOuterRadius(i) + arcWidth / 2 ) // Adjust y position
            .text(d => d.year)
            .style("font-size", "10px");


        function arcTween(d, i) {
            let interpolate = d3.interpolate(0, d.numArrivals);
            return t => arc(interpolate(t), i);
        }



        function showTooltip(event, d) {
            vis.tooltip.style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 25) + 'px')
                .style('display', 'inline-block')
                .html(`Year: ${d.year}<br>Number of Arrivals: ${parseInt(d.numArrivals)}k`); // Format as integer
        }

        function hideTooltip() {
            vis.tooltip.style('display', 'none');
        }

        vis.svg.selectAll('.axis line, .axis circle')
            .style('stroke', '#cccccc')
            .style('stroke-width', '1px');

        vis.svg.selectAll('.axis circle')
            .style('fill', 'none');

        vis.svg.selectAll('.r.axis text')
            .style('text-anchor', 'end');

        function rad2deg(angle) {
            return angle * 180 / Math.PI;
        }

        function getInnerRadius(index) {
            return arcMinRadius + (numArcs - (index + 1)) * (arcWidth + arcPadding);
        }

        function getOuterRadius(index) {
            return getInnerRadius(index) + arcWidth;
        }

    }

    update(selectedCountry, selectedRegion) {
        this.selectedCountry = selectedCountry;
        this.selectedRegion = selectedRegion;
        this.wrangleData();
    }
}
