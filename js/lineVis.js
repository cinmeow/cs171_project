class LineVis {
    constructor(parentElement, data, datatype) {
        this.parentElement = parentElement;
        this.data = data;

        this.dataType = datatype;

        this.initVis();
    }

    initVis() {
        let vis = this;

        // Set up dimensions and margins
        vis.margin = {top: 70, right: 100, bottom: 20, left: 40};
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
            .style("font-size", "16px");

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Update scales
        vis.x.domain(d3.extent(vis.data, d => +d.year));
        vis.y.domain([0, d3.max(vis.data, d => +d[vis.dataType])]);


        let format = d3.format(".2s");
        function customYAxisFormatTick(d) {
            return format(d).replace('G', 'B'); // Replace G (Giga) with B (Billion) if needed
        }

        function formatLabel(value) {
            return value <= 0 ? "NaN" : format(value);
        }

        // Update axes
        vis.xAxis.call(d3.axisBottom(vis.x));
        vis.yAxis.transition().duration(1000).call(d3.axisLeft(vis.y).tickFormat(customYAxisFormatTick));

        // Update chart title
        let titleText = vis.currentCountry ? `${vis.currentCountry}: ${vis.formatDataType(vis.dataType)} Over Time` : `Global: ${vis.formatDataType(vis.dataType)} Over Time`;
        vis.title.text(titleText);

        // Update y-axis label
        vis.svg.select(".y-axis-label")
            .text(vis.formatDataType(vis.dataType));


        // Draw line
        let line = d3.line()
            .x(d => vis.x(d.year))
            .y(d => vis.y(d[vis.dataType]))
            .curve(d3.curveMonotoneX);

        let path = vis.svg.selectAll(".line")
            .data([vis.data]);

        // Enter + update
        path.enter()
            .append("path")
            .merge(path)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "#A1061B")
            .attr("stroke-width", "3px")
            .attr("d", line)
            .attr("stroke-dasharray", function() {
                const length = this.getTotalLength();
                return `${length} ${length}`;
            })
            .attr("stroke-dashoffset", function() {
                return this.getTotalLength();
            })
            .transition()
            .duration(1000)
            .attr("stroke-dashoffset", 0);

        // Draw dots on each data point
        vis.svg.selectAll(".dot")
            .data(vis.data)
            .join("circle")
            .attr("class", "dot")
            .attr("cx", d => vis.x(d.year))
            .attr("cy", d => vis.y(d[vis.dataType]))
            .attr("r", 6)
            .attr("fill", "#5E171C");

        // Labels for the dots
        vis.svg.selectAll(".dot-label")
            .data(vis.data)
            .join("text")
            .attr("class", "dot-label")
            .attr("x", d => vis.x(d.year) + 17)
            .attr("y", d => vis.y(d[vis.dataType]) - 10) // Adjust label position above the dot
            .text(d => formatLabel(d[vis.dataType]))
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "black");
    }



    setData(newData, countryName) {
        this.data = newData;
        console.log(newData)
        console.log(countryName)
        this.currentCountry = countryName;
        this.updateVis();
    }

    formatDataType(dataType) {
        return dataType.charAt(0).toUpperCase() + dataType.slice(1);
    }
}
