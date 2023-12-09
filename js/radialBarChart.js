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
        vis.margin = { top: 10, right: 10, bottom: 10, left: 10 };
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width  - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;
        vis.chartRadius = vis.height / 4 - 40;

        // Create SVG for Radial Bar Chart
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + (vis.width / 2) + "," + (vis.height / 2) + ")");

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

        let arc = d3.arc()
            .innerRadius((d, i) => arcMinRadius + (numArcs - (i + 1)) * (arcWidth + arcPadding))
            .outerRadius((d, i) => arcMinRadius + (numArcs - i) * (arcWidth + arcPadding))
            .startAngle(0)
            .endAngle((d, i) => scale(d));

        let radialAxis = vis.svg.append('g')
            .attr('class', 'r axis')
            .selectAll('g')
            .data(vis.displayData)
            .enter().append('g');

        radialAxis.append('circle')
            .attr('r', (d, i) => arcMinRadius + (numArcs - i) * (arcWidth + arcPadding));

        radialAxis.append('text')
            .attr('x', 10)
            .attr('y', (d, i) => -(arcMinRadius + (numArcs - i - 0.5) * (arcWidth + arcPadding)))
            .text(d => d.year);

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

        arcs.on('mousemove', function(event, d) {
            // Access the event using the event argument
            showTooltip(event, d);
        });
        arcs.on('mouseout', hideTooltip);

        // Hover effect for arcs
        arcs.on('mouseover', function() {
            d3.select(this).style('opacity', 0.7);
        })
            .on('mouseout', function() {
                d3.select(this).style('opacity', 0.9);
            });

        function arcTween(d, i) {
            let interpolate = d3.interpolate(0, d.numArrivals);
            return t => arc(interpolate(t), i);
        }



        function showTooltip(event, d) {
            vis.tooltip.style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 25) + 'px')
                .style('display', 'inline-block')
                .html(`Year: ${d.year}<br>Num Arrivals: ${d.numArrivals}`);
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

    }

    update(selectedCountry, selectedRegion) {
        this.selectedCountry = selectedCountry;
        this.selectedRegion = selectedRegion;
        this.wrangleData();
    }
}
