class TravelPurposeVis {

    constructor(parentElement, travelData, michelinData){
        this.parentElement = parentElement;
        this.travelData = travelData;
        this.michelinData = michelinData;
        this.filteredData = [];

        console.log("Constructor: travel data", this.travelData);
        console.log("Constructor: michelin data", this.michelinData);
        let vis = this;
        // filter out data with Michelin countries
        let michelinFilteredData = vis.michelinData.filter((d) => michelinCountry.has(d.Country));

        // LATER: filter for selected countries but for now, will use a curated set of countries/year (2019)
        let countryFilter = new Set(["USA", "France", "Italy", "Taiwan", "Thailand"]);
        let travelDataFilter = vis.travelData.filter((d) => {
            let cond1 = countryFilter.has(d.Country);
            let cond2 = d.Year === 2019;
            return cond1 && cond2
        });
        console.log("travel data filter", travelDataFilter)

        // average the price for michelin restaurants by country
        let averagePrice = Array.from(d3.rollup(
            michelinFilteredData,
            (leaves) => d3.mean(leaves, (d) => d.Price),
            (d) => d.Country
        ));

        let newMichelinData = averagePrice.map(([Country, AvgPrice]) => ({Country, AvgPrice}));
        // console.log(newMichelinData);

        // filter michelin data for only those in the five countries above
        let newMichelinFilteredData = newMichelinData.filter((d) => {
            return countryFilter.has(d.Country);
        });
        // console.log("michelin 5 countries", newMichelinFilteredData)

        // combine travel and michelin datasets
        vis.filteredData = travelDataFilter.map((d1) => {
            // Find the matching item in array2 based on the Country
            let matchingItem = newMichelinFilteredData.find((d2) => d2.Country === d1.Country);
            // Combine the properties from both arrays into a new object
            return{
                Country: d1.Country,
                businessPurpose: d1.businessPurpose,
                personalPurpose: d1.personalPurpose,
                avgPrice: matchingItem.AvgPrice,
            };

        });
        // console.log(vis.filteredData)

        this.initVis()
    }

    initVis(){
        let vis = this;
        console.log("INIT VIS");

        // set up margin and width
        vis.margin = {top: 50, right: 50, bottom: 50, left: 50};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.right - vis.margin.left ;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.bottom - vis.margin.top;
        console.log(vis.width, vis.height)
        // set up svg
        vis.svg = d3.select(`#${vis.parentElement}`)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // set up color scale for country
        var color = d3.scaleOrdinal()
            .domain(["USA", "France", "Italy", "Taiwan", "Thailand"])
            .range([ "#440154ff", "#21908dff", "#fde725ff", "#ff7900", "#81be50"])

        vis.dimensions = ["personalPurpose", "businessPurpose", "avgPrice"]

        // build linear scale for each dimension
        // vis.y = []
        //
        // console.log("filtered data MOO", vis.filteredData)
        // for(let i of Object.keys(vis.dimensions)){
        //     name = vis.dimensions[i];
        //     vis.y[name] = d3.scaleLinear()
        //         .domain([d3.extent(vis.filteredData, (d) => {
        //             +d[name];
        //         })])
        //         .range([vis.height, 0])
        // };
        //
        // // Build the X scale -> it find the best position for each Y axis
        // vis.x = d3.scalePoint()
        //     .range([0, vis.width])
        //     .domain(vis.dimensions);

        vis.y = {}; // Change to an object

        console.log("filtered data MOO", vis.filteredData);

        for (let i of Object.keys(vis.dimensions)) {
            const name = vis.dimensions[i];
            if(name === "personalPurpose" | name === "businessPurpose"){
                vis.y[name] = d3.scaleLinear()
                    .domain([0, 100000]) // Use 'return' to return the result
                    .range([vis.height, 0]);
            } else{
                vis.y[name] = d3.scaleLinear()
                    .domain([0, d3.max(vis.filteredData, (d) => d.avgPrice)]) // Use 'return' to return the result
                    .range([vis.height, 0]);
            }

        }

        console.log(vis.y)

        // Build the X scale -> it finds the best position for each Y axis
        vis.x = d3.scalePoint()
            .range([0, vis.width])
            .domain(vis.dimensions);


        console.log("vis.y", vis.y)
        console.log("vis.x", vis.x)
        // path function

        function path(d) {
            return d3.line()(vis.dimensions.map(function(p) { return [vis.x(p), vis.y[p](d[p])]; }));
        }
        vis.filteredData.forEach((d) => {

        });

        console.log("HERE", vis.filteredData)
        vis.svg
            .selectAll("myPath")
            .data(vis.filteredData)
            .enter()
            .append("path")
            .attr("class", function (d) {console.log("line" + d.Country)})
            .attr("d", path)
            .style("fill", "none" )
            .style("stroke", function(d){ return(color(d.Country))} )
            .style("stroke-width", "5px")
            .style("opacity", 1);

        vis.svg.selectAll("myAxis")
            // For each dimension of the dataset I add a 'g' element:
            .data(vis.dimensions).enter()
            .append("g")
            .attr("class", "axis")
            // I translate this element to its right position on the x axis
            .attr("transform", function(d) { return "translate(" + vis.x(d) + ")"; })
            // And I build the axis with the call function
            .each(function(d) { d3.select(this).call(d3.axisLeft().ticks(5).scale(vis.y[d])); })
            // Add axis title
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", -9)
            .text(function(d) { return d; })
            .style("fill", "black")


        vis.wrangleData();
    }

    wrangleData(){
        let vis = this;
        console.log("WRANGLE DATA")

        vis.updateVis()
    }

    updateVis(){
        let vis = this;
        console.log("UPDATE VIS")

    }



}