class AreaChart {
    constructor(parentElement, data, dataType = "bed") {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = data; // Will be updated in wrangleData
        this.countryName = "Global";
        this.dataType = dataType; // New property for data type
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 40, right: 40, bottom: 70, left: 60 };
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Scales and axes
        vis.x = d3.scaleTime().range([0, vis.width]);
        vis.y = d3.scaleLinear().range([vis.height, 0]);

        vis.yAxis = d3.axisLeft().scale(vis.y);
        vis.xAxis = d3.axisBottom().scale(vis.x).ticks(6);

        vis.svg.append("g").attr("class", "y-axis axis");
        vis.svg.append("g").attr("class", "x-axis axis").attr("transform", "translate(0," + vis.height + ")");

        // Append a path for the area function, so that it is later behind the brush overlay
        vis.timePath = vis.svg.append("path").attr("class", "area");

        vis.svg.append("text")
            .attr("class", "areachart-title")
            .attr("x", (vis.width / 2))
            .attr("y", 0 - (vis.margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "16px");

        // Add legend
        let legend = vis.svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(" + (vis.width - 500) + ",220)");

        // Legend for total beds
        legend.append("rect")
            .attr("x", 0)
            .attr("y", 15)
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", "#3f408c");

        legend.append("text")
            .attr("x", 25)
            .attr("y", 25)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text("Total Beds");

        // Legend for occupied beds
        legend.append("rect")
            .attr("x", 225)
            .attr("y", 15)
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", "#bdc9fb");

        legend.append("text")
            .attr("x", 250)
            .attr("y", 25)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text("Occupied Beds");

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        if (vis.dataType === "bed") {
            // Calculate number of rooms and occupied rooms per year
            vis.numRoomData = Array.from(
                d3.rollup(
                    vis.displayData,
                    (leaves) => d3.sum(leaves, (d) => d.numRooms),
                    (d) => d.Year
                ),
                ([key, value]) => ({ Year: key, numRooms: value })
            );
            vis.occupancyData = Array.from(
                d3.rollup(
                    vis.displayData,
                    (leaves) => d3.sum(leaves, (d) => (d.numRooms * d.occupancyRooms) / 100),
                    (d) => d.Year
                ),
                ([key, value]) => ({ Year: key, numOccupied: value })
            );
            vis.newData = vis.numRoomData.map((d1) => {
                let matchingItem = vis.occupancyData.find((d2) => d2.Year === d1.Year);
                return {
                    Year: d1.Year,
                    numRooms: d1.numRooms,
                    numOccupied: matchingItem.numOccupied
                }
            });
        } else if (vis.dataType === "lengthOfStay") {
            // Calculate average length of stay per year
            vis.avgLengthStayData = Array.from(
                d3.rollup(
                    vis.displayData,
                    (leaves) => d3.mean(leaves, (d) => d.avgLengthStay),
                    (d) => d.Year
                ),
                ([Year, avgLengthStay]) => ({ Year, avgLengthStay })
            );
        }

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        if (vis.dataType === "bed") {
            // Update domains for bed data
            vis.x.domain(d3.extent(vis.newData, d => d.Year));
            vis.y.domain([0, d3.max(vis.newData, d => Math.max(d.numRooms, d.numOccupied))]);

            // Define and update areas for bed data
            vis.updateAreaPaths(vis.newData, vis.areaTotal, "#3f408c", "total-beds", d => vis.y(d.numRooms));
            vis.updateAreaPaths(vis.newData, vis.areaOccupied, "#bdc9fb", "occupied-beds", d => vis.y(d.numOccupied));

            // Update title
            vis.updateTitle(`Accommodations and Occupancy Over Time - ${vis.countryName}`);

            // Show legend
            vis.updateLegend(true);
        } else if (vis.dataType === "lengthOfStay") {
            // Update domains for length of stay data
            vis.x.domain(d3.extent(vis.avgLengthStayData, d => d.Year));
            vis.y.domain([0, d3.max(vis.avgLengthStayData, d => d.avgLengthStay)]);

            // Define and update area for length of stay data
            vis.updateAreaPaths(vis.avgLengthStayData, vis.areaAvgLengthStay, "#69b3a2", "avg-length-stay", d => vis.y(d.avgLengthStay));

            // Update title
            vis.updateTitle(`Average Length of Stay Over Time - ${vis.countryName}`);

            // Hide legend
            vis.updateLegend(false);
        }

        // Update axes with transition
        vis.svg.select(".y-axis").transition().duration(1000).call(vis.yAxis);
        vis.svg.select(".x-axis").transition().duration(1000).call(vis.xAxis);
    }

    updateAreaPaths(data, areaGenerator, fillColor, className, y1Function) {
        let vis = this;

        // Define the area generator function
        areaGenerator = d3.area()
            .curve(d3.curveLinear)
            .x(d => vis.x(d.Year))
            .y0(vis.height)
            .y1(y1Function);

        // Update the area path
        let areaPath = vis.svg.selectAll(`.${className}`)
            .data([data]);

        areaPath.enter().append("path")
            .attr("class", `area ${className}`)
            .merge(areaPath)
            .transition().duration(1000)
            .attr("d", areaGenerator)
            .attr("fill", fillColor);
    }

    updateTitle(titleText) {
        let vis = this;
        vis.svg.selectAll(".areachart-title").text(titleText);
    }

    updateLegend(showLegend) {
        let vis = this;
        if (showLegend) {
            // Show legend for bed data
            vis.svg.selectAll(".legend").style("display", "block");
        } else {
            // Hide legend for length of stay data
            vis.svg.selectAll(".legend").style("display", "none");
        }
    }

    // Calls data being selected by the map
    setData(newData, countryName) {
        let vis = this;
        vis.displayData = newData;
        vis.countryName = countryName;
        vis.wrangleData();
    }
}
