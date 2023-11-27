class AreaChart {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = data;
        this.countryName = "Global"
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 40, right: 40, bottom: 70, left: 60};

        // TODO: #9 - Change hardcoded width to reference the width of the parent element
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;


        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


        // Scales and axes
        vis.x = d3.scaleTime()
            .range([0, vis.width]);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x)
            .ticks(6);

        vis.svg.append("g")
            .attr("class", "y-axis axis");

        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")");


        // Append a path for the area function, so that it is later behind the brush overlay
        vis.timePath = vis.svg.append("path")
            .attr("class", "area");

        vis.svg.append("text")
            .attr("class", "areachart-title")
            .attr("x", (vis.width / 2))
            .attr("y", 0 - (vis.margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "16px")

        // (Filter, aggregate, modify data)
        vis.wrangleData();

        // Add legend
        const legend = vis.svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(" + (vis.width - 500) + ",220)");

        // Legend for total beds
        legend.append("rect")
            .attr("x", 0)
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", "#3f408c");

        legend.append("text")
            .attr("x", 25)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text("Total Beds");

        // Legend for occupied beds
        legend.append("rect")
            .attr("x", 225)
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", "#bdc9fb");

        legend.append("text")
            .attr("x", 250)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text("Occupied Beds");

        vis.svg2 = d3.select("#chart2")
            .append("p")
            .text("Upon selecting a country, the area chart will be filtered to the Country's year-by-year data for the number " +
                "of available accommodations (in this case number of bed space). The lighter part of the area chart is the number" +
                "of occupied bed space by year. There is quite a bit of missing data, so anything that is 0 is missing. ")

    }

    wrangleData() {
        let vis = this;
        console.log("data in (Area Chart - Wrangle Data)", vis.displayData);

        vis.numRoomData = Array.from(
            d3.rollup(
                vis.displayData,
                (leaves) => d3.sum(leaves, (d) => d.numRooms),
                (d) => d.Year
            ),
            ([key, value]) => ({Year: key, numRooms: value})
        );
        vis.occupancyData = Array.from(
            d3.rollup(
                vis.displayData,
                (leaves) => d3.sum(leaves, (d) => (d.numRooms * d.occupancyRooms) / 100),
                (d) => d.Year
            ),
            ([key, value]) => ({Year: key, numOccupied: value})
        );

        vis.newData = vis.numRoomData.map((d1) => {
            let matchingItem = vis.occupancyData.find((d2) => d2.Year === d1.Year);
            return {
                Year: d1.Year,
                numRooms: d1.numRooms,
                numOccupied: matchingItem.numOccupied
            }
        });
        console.log("merged data", vis.newData)

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Update domains
        vis.x.domain(d3.extent(vis.newData, d => d.Year));
        vis.y.domain([0, d3.max(vis.newData, d => Math.max(d.numRooms, d.numOccupied))]);

        // Define the area for total beds
        vis.areaTotal = d3.area()
            .curve(d3.curveLinear)
            .x(d => vis.x(d.Year))
            .y0(vis.height)
            .y1(d => vis.y(d.numRooms));

        // Define the area for occupied beds
        vis.areaOccupied = d3.area()
            .curve(d3.curveLinear)
            .x(d => vis.x(d.Year))
            .y0(vis.height)
            .y1(d => vis.y(d.numOccupied));

        // Update the total beds area path
        let totalBeds = vis.svg.selectAll(".total-beds")
            .data([vis.newData]);

        totalBeds.enter()
            .append("path")
            .attr("class", "area total-beds")
            .attr("fill", "#3f408c")
            .merge(totalBeds)
            .transition().duration(1000)
            .attr("d", vis.areaTotal);

        // Update the occupied beds area path
        let occupiedBeds = vis.svg.selectAll(".occupied-beds")
            .data([vis.newData]);

        occupiedBeds.enter()
            .append("path")
            .attr("class", "area occupied-beds")
            .attr("fill", "#bdc9fb")
            .merge(occupiedBeds)
            .transition().duration(1000)
            .attr("d", vis.areaOccupied);

        // Update axes with transition
        vis.svg.select(".y-axis")
            .transition().duration(1000)
            .call(vis.yAxis);

        vis.svg.select(".x-axis")
            .transition().duration(1000)
            .call(vis.xAxis);

        // Update chart title
        vis.svg.selectAll(".areachart-title")
            .text(`Accommodations and Occupancy Over Time - ${vis.countryName}`);
    }

    setData(newData, countryName) {
        let vis = this;
        vis.displayData = newData;
        vis.countryName = countryName;
        vis.wrangleData();
    }

}

//     updateVis(){
//         let vis = this;
//
//         // Update domain
//         vis.x.domain(d3.extent(vis.newData, function (d) {
//             return d.Year;
//         }));
//         vis.y.domain([0, d3.max(vis.newData, function (d) {
//             return Math.max(d.numRooms, d.numOccupied);
//         })]);
//
//         // D3 area path generator
//         vis.areaTotal = d3.area()
//             .curve(d3.curveLinear)
//             .x(function (d) {
//                 return vis.x(d.Year);
//             })
//             .y0(vis.height)
//             .y1(function (d) {
//                 return vis.y(d.numRooms);
//             });
//
//         vis.areaOccupied = d3.area()
//             .curve(d3.curveLinear)
//             .x(function (d) {
//                 return vis.x(d.Year);
//             })
//             .y0(vis.height)
//             .y1(function (d) {
//                 return vis.y(d.numOccupied);
//             });
//
//         vis.svg.selectAll(".area").remove();
//
//         vis.svg
//             .append("path")
//             .datum(vis.newData)
//             .attr("class", "area")
//             .attr("d", vis.areaTotal)
//             .attr("fill", "#3f408c")
//             .attr("stroke", "#3d5064");
//         vis.svg
//             .append("path")
//             .datum(vis.newData)
//             .attr("class", "area")
//             .attr("d", vis.areaOccupied)
//             .attr("fill", "#bdc9fb")
//             .attr("stroke", "#3d5064");
//
//         vis.svg.selectAll(".areachart-title")
//             .text(`Accommodations and Occupancy Over Time - ${vis.countryName}`)
//
//         // Call the area function and update the path
//         // D3 uses each data point and passes it to the area function. The area function translates the data into positions on the path in the SVG.
//         vis.timePath
//             .datum(vis.newData)
//             .attr("d", vis.area);
//
//
//         // Update axes
//         vis.svg.select(".y-axis").call(vis.yAxis);
//         vis.svg.select(".x-axis").call(vis.xAxis);
//     }
//
//     setData(newData, countryName) {
//         let vis = this;
//         vis.displayData = newData
//         vis.countryName = countryName
//         console.log(vis.displayData)
//         // Update the display data
//         vis.wrangleData();
//     }
// }


