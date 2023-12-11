class Treemap {
    constructor(parentElement, data, radialBarChart) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = []; // Will be set in wrangleData
        this.radialBarChart = radialBarChart;

        this.initVis();
    }

    initVis() {
        let vis = this;

        // Set the dimensions and margins of the graph
        vis.margin = {top: 10, right: 10, bottom: 30, left: 60 };
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width * 0.8- vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height * 0.6- vis.margin.top - vis.margin.bottom;

        // Append the svg object to the body of the page
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Color scale for the rectangles
        vis.colorScale =  d3.scaleOrdinal(d3.schemeTableau10);

        vis.wrangleData();
    }

    wrangleData(selectedCountry = "France") {
        let vis = this;
        vis.country = selectedCountry

        // Filter data based on selected country
        vis.displayData = vis.data.filter(d => d.country === selectedCountry);

        // Aggregate data by region
        vis.aggregatedData = Array.from(d3.rollup(vis.displayData,
            v => d3.sum(v, d => d.numArrivals),
            d => d.Arrival_Regions
        ), ([name, value]) => ({ name, value }));

        // Create a hierarchy dataset with root
        let stratifyData = [{ id: "root", value: 0, parent: "" }]
            .concat(vis.aggregatedData.map(d => ({ id: d.name, value: d.value, parent: "root" })));

        // Stratify the data: reformatting for d3.js
        vis.root = d3.stratify()
            .id(function(d) { return d.id; })
            .parentId(function(d) { return d.parent; })
            (stratifyData);

        vis.root.sum(function(d) { return Math.log(d.value + 1); }); // Use log scale for area


        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Apply the treemap layout algorithm to the hierarchy
        d3.treemap()
            .size([vis.width - 50, vis.height - 50])
            .padding(4)
            (vis.root);

        vis.colorScale.domain(vis.aggregatedData.map(d => d.name));

        let nodes = vis.svg.selectAll(".node")
            .data(vis.root.leaves());

        // Exit selection
        nodes.exit().remove();

        // Enter selection
        const nodesEnter = nodes.enter().append("rect")
            .attr("class", "node");

        // Merge enter and update selections
        nodesEnter.merge(nodes)
            .transition().duration(1000)
            .attr('x', d => d.x0)
            .attr('y', d => d.y0)
            .attr('width', d => d.x1 - d.x0)
            .attr('height', d => d.y1 - d.y0)
            .style("stroke", "black")
            .style("fill", d => vis.colorScale(d.data.id));
        nodesEnter.on('mouseover',function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(100)
                    .style("opacity", 0.7);  // Reduce opacity on hover
            })
            .on('mouseout', function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(100)
                    .style("opacity", 1);  // Reset opacity when not hovered
            });

        // Attach click event listener
        nodesEnter.on('click', (event, d) => {
            console.log("Clicked node data:", d);
            if (this.radialBarChart && typeof this.radialBarChart.update === 'function') {
                this.radialBarChart.update(this.country, d.data.id);
            } else {
                console.error('RadialBarChart is not defined or update method is missing');
            }
        });

        // Ensure that click event is also attached to the updated nodes
        nodes.on('click', (event, d) => {
            vis.radialBarChart.update(this.country, d.data.id);
        });



        // Bind data to text labels for each node
        let labels = vis.svg.selectAll(".label")
            .data(vis.root.leaves());

        labels.exit().remove();

        labels.enter().append("text")
            .attr("class", "label")
            .merge(labels)
            .transition().duration(1000)
            .attr("x", d => d.x0 + 5)
            .attr("y", d => d.y0 + 20)
            .text(d => d.data.id)
            .attr("font-size", d => Math.min(13, 0.1 * Math.sqrt((d.x1 - d.x0) * (d.y1 - d.y0))) + "px")
            .attr("fill", "white");

        let nodesText = vis.svg.selectAll(".node-text")
            .data(vis.root.leaves());

        // Remove old text elements
        nodesText.exit().remove();

        // Create new text elements
        nodesText.enter().append("text")
            .attr("class", "node-text")
            .merge(nodesText) // Merge with update selection
            .attr("x", d => d.x0 + 5)
            .attr("y", d => d.y0 + 40)
            .text(d => `${Math.round(d.data.value)}k`)
            .attr("font-size", d => Math.min(12, 0.08 * Math.sqrt((d.x1 - d.x0) * (d.y1 - d.y0))) + "px")
            .attr("fill", "white");

        // Add legend
        let legend = vis.svg.selectAll(".legend")
            .data(vis.colorScale.domain());

        // Bind legend items and position them
        let legendItem = legend.enter().append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(${i * (vis.width / 7) }, ${vis.height - 30})`);

        // Append rectangles to legend items
        legendItem.append("rect")
            .attr("x", 0)
            .attr("width", 38)
            .attr("height", 18)
            .style("fill", vis.colorScale);

        // Append text to legend items
        legendItem.append("text")
            .attr("x", 0)
            .attr("y", 30)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .style("font-size", "10px")
            .text(d => d);

        // Adjust existing legend items if necessary
        legend.select("rect").style("fill", vis.colorScale);
        legend.select("text").text(d => d);
    }

    update(selectedCountry) {
        this.wrangleData(selectedCountry);
    }
}
