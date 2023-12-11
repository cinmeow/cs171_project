/** Bar Charts for Global Michelin Data **/

class BarChart{

    constructor(parentElement, data, datatype) {
        this.parentElement = parentElement;
        this.data = data;
        this.dataType = datatype;

        this.displayData = [];

        this.initVis();
    }

    initVis(){
        let vis = this;

        console.log(vis.data)

        // dynamic svg canvas
        vis.margin = {top: 80, right: 60, bottom: 20, left: 40};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // initialize svg drawing area
        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.right + vis.margin.left}, ${vis.margin.top})`);


        // add title
        vis.title = vis.svg.append("text")
            .attr("x", vis.width / 2)
            .attr("y", 0 - vis.margin.top / 3)
            .attr("text-anchor", "middle")
            .style("font-size", "20px")

        let title = vis.dataType === "restaurants" ? "Distribution of Michelin Star Ratings" : "Top 10 Cuisine Types";
        vis.title.text(title);


        // create scales and axes
        vis.x = d3.scaleLinear().range([0, vis.width - vis.margin.right]);
        vis.y = d3.scaleBand().range([0, vis.height]);

        vis.xAxis = d3.axisBottom().scale(vis.x)
        vis.yAxis = d3.axisLeft().scale(vis.y)

        vis.svg.append("g")
            .attr("class", "x-axis axis");

        vis.svg.append("g")
            .attr("class", "y-axis axis");

        vis.wrangleData();

    }

    wrangleData() {
        let vis = this;

        if (vis.dataType === "restaurants") {
            // Group by Michelin stars
            vis.displayData = Array.from(d3.rollup(vis.data, leaves => leaves.length, d => d['Award']),
                ([key, value]) => ({category: key, value: value}));
        } else if (vis.dataType === "cuisine") {
            // Group by cuisine and take top 10
            let cuisineData = Array.from(d3.rollup(vis.data, leaves => leaves.length, d => d['Cuisine']),
                ([key, value]) => ({category: key, value: value}));
            cuisineData.sort((a, b) => b.value - a.value);
            vis.displayData = cuisineData.slice(0, 10);
        }

        vis.displayData.sort((a, b) => b.value - a.value);


        console.log(vis.displayData)

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // update domain
        let max_X = d3.max(vis.displayData, d => d['value'])

        vis.x.domain([0, max_X]);
        vis.y.domain(vis.displayData.map(d => d.category));

        // bar chart name - change according to selection
        vis.barname = 'awards'

        // draw bar chart with michelin star rating first
        let bar = vis.svg.selectAll(".barChart-" + vis.barname)
            .data(vis.displayData)

        bar.exit().transition()
            .duration(750)
            .attr("width", 0)
            .remove();

        bar.transition()
            .duration(750)
            .attr("x", 10)
            .attr("y", d => vis.y(d.category))
            .attr("height", vis.y.bandwidth() - 5)
            .attr("width", d => vis.x(d.value))
            .attr("fill", "#A0071B");

        bar.enter()
            .append("rect")
            .attr("x", 10)
            .attr("y", (d) => vis.y(d.category))
            .attr("height", vis.y.bandwidth() - 5)
            .attr("width", 0) // Start with 0 width and transition to final width
            .transition()
            .duration(750)
            .attr("width", (d) => vis.x(d.value))
            .attr("fill", "#A0071B")
            .attr("class", "barChart-" + vis.barname + " bar-hover");

        // add axes
        // vis.svg.selectAll(".axis").remove();

        vis.svg.select(".x-axis")
            .attr("transform", "translate(10," + vis.height + ")")
            .call(vis.xAxis);

        vis.svg.select(".y-axis")
            .transition()
            .duration(750)
            .attr("transform", "translate(8,0)")
            .call(vis.yAxis);


    }

    setData(newData, countryName) {
        let vis = this;

        // Filter the data for the selected country
        vis.data = newData.filter(d => d.Country === countryName);

        let title = vis.dataType === "restaurants" ? `${countryName} - Distribution of Michelin Star Ratings` : ` ${countryName} - Top 10 Cuisine Types`;
        vis.title.text(title);

        // Update the display data
        vis.wrangleData();
    }

}