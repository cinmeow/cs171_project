class LineVis {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data; // Data will be an array of { year, arrivals }

        this.initVis();
    }

    initVis() {
        let vis = this;

        // Set up dimensions and margins
        vis.margin = {top: 70, right: 60, bottom: 20, left: 40};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // Initialize drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left + vis.margin.right}, ${vis.margin.top})`);

        // Scales and axes
        vis.x = d3.scaleLinear()
            .range([0, vis.width-vis.margin.right]);

        vis.y = d3.scaleLinear()
            .range([vis.height, 20]);

        vis.xAxis = vis.svg.append("g")
            .attr("transform", `translate(0, ${vis.height})`);

        vis.yAxis = vis.svg.append("g");

        // Chart title
        vis.title = vis.svg.append("text")
            .attr("x", vis.width / 2)
            .attr("y", 0 - vis.margin.top / 2.5)
            .attr("text-anchor", "middle")
            .style("font-size", "20px");


        // X-axis label
        vis.svg.append("text")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + 40)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .text("Year");

        // Y-axis label
        vis.svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - vis.margin.left - 20)
            .attr("x", 0 - (vis.height / 2))
            .attr("dy", "1em")
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .text("Number of Arrivals");

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Update scales
        vis.x.domain(d3.extent(vis.data, d => +d.year));
        vis.y.domain([0, d3.max(vis.data, d => +d.arrivals)]);

        let titleText = vis.currentCountry ? `${vis.currentCountry}: Tourism Arrivals Over Time` : "France: Tourism Arrivals Over Time";
        vis.title.text(titleText);

        let format = d3.format(".2s");
        function customYAxisFormatTick(d) {
            return format(d).replace('G', 'B'); // Replace G (Giga) with B (Billion) if needed
        }

        // Update axes
        vis.xAxis.call(d3.axisBottom(vis.x));
        vis.yAxis.transition().duration(1000).call(d3.axisLeft(vis.y).tickFormat(customYAxisFormatTick));

        // Draw line
        let line = d3.line()
            .x(d => vis.x(d.year))
            .y(d => vis.y(d.arrivals))
            .curve(d3.curveMonotoneX); // Smooth the line

        vis.svg.selectAll(".line")
            .data([vis.data])
            .join("path")
            .attr("class", "line")
            .attr("d", line)
            .attr("fill", "none")
            .attr("stroke", "darkblue")
            .attr("stroke-width", "2px");

        // ... existing styling for the line

        // Draw dots on each data point
        vis.svg.selectAll(".dot")
            .data(vis.data)
            .join("circle")
            .attr("class", "dot")
            .attr("cx", d => vis.x(d.year))
            .attr("cy", d => vis.y(d.arrivals))
            .attr("r", 5)
            .attr("fill", "steelblue")
            .on("mouseover", (event, d) => {
                vis.tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                vis.tooltip.html(
                    `<strong>Year:</strong> ${d.year}<br>
                    <strong>Arrivals:</strong> ${d.arrivals}`
                )
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", d => {
                vis.tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // Labels for the dots
        vis.svg.selectAll(".dot-label")
            .data(vis.data)
            .join("text")
            .attr("class", "dot-label")
            .attr("x", d => vis.x(d.year) + 15)
            .attr("y", d => vis.y(d.arrivals) - 10) // Adjust label position above the dot
            .text(d => format(d.arrivals))
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "black");
    }

        // Add more styling and features as needed


    setData(newData, countryName) {
        this.data = newData;
        console.log(newData)
        console.log(countryName)
        this.currentCountry = countryName;
        this.updateVis();
    }
}
