class SpiderVis {

    constructor(parentElement, travelData, michelinData, tourismData){
        this.parentElement = parentElement;
        this.travelData = travelData;
        this.tourismData = tourismData;
        this.michelinData = michelinData;

        this.selection = new Set();
        this.features = ["Arrivals", "Accommodations", "Expenditures", "Business", "Personal", "Michelin"];
        this.currentYear = 2019;
        this.n = spiderSelect.size;

        // description about each feature
        this.description = {
            "Arrivals": "Number of Arrivals <br> into country in 2019",
            "Accommodations": "Number of beds <br> available in country in 2019",
            "Expenditures": "Amount expended by tourists <br> in country in 2019",
            "Business": "Number traveling for <br> business purposes in 2019",
            "Personal": "Number traveling for <br> personal purposes in 2019",
            "Michelin": "Number of Restaurants <br> on the Michelin Guide"
        };

        this.initVis();
    }
    initVis(){
        let vis = this;

        // set the size of the svg

        vis.margin = {top: 100, right: 40, bottom: 150, left: 50};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select(`#${vis.parentElement}`)
            .append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height);

        // set up a radial scale for the radial chart
        vis.radialScale = d3.scaleLinear()
            .domain([0, 5])
            .range([0, vis.width-(0.7 * vis.width)])

        vis.ticks = Array.from({length: 5}, (_, index) => index + 1).reverse();

        vis.tickGroup = vis.svg.append("g")
            .attr("transform", `translate(${vis.width/15}, ${vis.height/15})`);

        vis.tickGroup.selectAll("circle")
            .data(vis.ticks)
            .join(
                enter => enter.append("circle")
                    .attr("cx", vis.width / 2)
                    .attr("cy", vis.height / 2)
                    .attr("fill", "none")
                    .attr("stroke", "#a0071b")
                    .attr("opacity", "0.6")
                    .attr("stroke-width", "2px")
                    .attr("r", d => vis.radialScale(d))
            );

        vis.tickGroup.selectAll(".ticklabel")
            .data(vis.ticks)
            .join(
                enter => enter.append("text")
                    .attr("class", "ticklabel")
                    .attr("x", vis.width / 2 + 5)
                    .attr("y", (d) => vis.height / 2 - vis.radialScale(d) - 5)
                    .attr("font-size", "10px")
                    .text(d => {
                        let order = 6-d;
                        return(order.toString())}
                    )
            );

        // initialize tooltip for later use
        vis.tooltip = d3.select(`#${vis.parentElement}`)
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        vis.wrangleData()
    }

    wrangleData(){
        let vis = this;
        let parseYear = d3.timeParse("%Y");

        // filter tourism data to obtain only data from countries we selected and from the year 2019
        let filteredTourismData = vis.tourismData.filter((d) => {
            // if(vis.selection.has(d["Country Name"])){
            // }
            let c1 = vis.selection.has(d["Country Name"]);
            let c2 = parseYear(d.Year).getFullYear() === 2019;
            return c1 && c2;
        });


        // filter travel data to obtain only data from countries we selected and from year 2019
        let filteredTravelData = vis.travelData.filter((d) => {
            let c1 = vis.selection.has(d["Country"]);
            let c2 = d.Year.getFullYear() === vis.currentYear;
            return  c1 && c2;
        });

        // filter michelin data to obtain only data from countries we selected
        let filteredMichelinData = vis.michelinData.filter((d) => {
            return vis.selection.has(d["Country"]);
        });

        // calculate number of michelin restaurants per country
        let rollupMichelinData = Array.from(
            d3.rollup(
                filteredMichelinData,
                (leaves) => leaves.length,
                (d) => d.Country
            ),
            ([key, value]) => ({Country: key, numRestaurants: value})
        );

        // combine the data from tourism, travel and michelin guide into one array
        let combinedData = rollupMichelinData.map((d1) => {
            let matchingItem = filteredTravelData.find((d2) => d2["Country"] === d1["Country"]);
            let matchingItem2 = filteredTourismData.find((d2) => d2["Country Name"] === d1["Country"]);

            let businessPurpose, personalPurpose, numRooms, arrivals, expenditures;

            if (matchingItem) {
                businessPurpose = matchingItem["businessPurpose"];
                personalPurpose = matchingItem["personalPurpose"];
                numRooms = matchingItem["numRooms"];
            } else {
                businessPurpose = 0;
                personalPurpose = 0;
                numRooms = 0;
            }

            if (matchingItem2) {
                arrivals = matchingItem2["Number of Arrivals"];
                expenditures = matchingItem2["Expenditures (current US$)"];
            } else {
                arrivals = 0;
                expenditures = 0;
            }

            return {
                Country: d1["Country"],
                Arrivals: arrivals,
                Expenditures: expenditures,
                Accommodations: numRooms,
                Business: businessPurpose,
                Personal: personalPurpose,
                Michelin: d1["numRestaurants"]
            };
        })

        // sort the different categories and rank countries
        let arrivalsRank = combinedData.slice().sort((a, b) => b.Arrivals - a.Arrivals).map((country, index) => ({ Country: country.Country, Arrivals: -index + 5 }));
        let expendituresRank = combinedData.slice().sort((a, b) => b.Expenditures - a.Expenditures).map((country, index) => ({ Country: country.Country, Expenditures: -index + 5 }));
        let accommodationsRank = combinedData.slice().sort((a, b) => b.Accommodations - a.Accommodations).map((country, index) => ({ Country: country.Country, Accommodations: -index + 5 }));
        let businessRank = combinedData.slice().sort((a, b) => b.Business - a.Business).map((country, index) => ({ Country: country.Country, Business: -index + 5 }));
        let personalRank = combinedData.slice().sort((a, b) => b.Personal - a.Personal).map((country, index) => ({ Country: country.Country, Personal: -index + 5 }));
        let michelinRank = combinedData.slice().sort((a, b) => b.Michelin - a.Michelin).map((country, index) => ({ Country: country.Country, Michelin: -index + 5 }));


        // Combine the rankings into the final result
        vis.rankingArray = combinedData.map(country => ({
            Country: country.Country,
            Arrivals: arrivalsRank.find(rank => rank.Country === country.Country).Arrivals,
            Expenditures: expendituresRank.find(rank => rank.Country === country.Country).Expenditures,
            Accommodations: accommodationsRank.find(rank => rank.Country === country.Country).Accommodations,
            Business: businessRank.find(rank => rank.Country === country.Country).Business,
            Personal: personalRank.find(rank => rank.Country === country.Country).Personal,
            Michelin: michelinRank.find(rank => rank.Country === country.Country).Michelin
        }));


        vis.updateVis()
    }

    updateVis(){
        let vis = this;

        console.log(vis.rankingArray)
        // turn angles into coordinates to later draw path
        function angleToCoordinate(angle, value){
            let x = vis.width/2 + Math.cos(angle) * vis.radialScale(value);
            let y = vis.height/2 - Math.sin(angle) * vis.radialScale(value);
            return {"x": x, "y": y};
        }

        // get the angle coordinates for each feature in spider chart
        vis.featureData = vis.features.map((f, i) => {
            let angle = (Math.PI / 2) + (2 * Math.PI * i / vis.features.length);
            return {
                "name": f,
                "angle": angle,
                "line_coord": angleToCoordinate(angle, 5.05),
                "label_coord": angleToCoordinate(angle, 6)
            };
        });

        // add up each of the ranking to get a total value
        vis.rankingArray.forEach((element) => {
            element.total = Object.values(element).reduce((acc, value) => {
                // Skip the "Country" property from the sum
                if (typeof value === "number") {
                    return acc + value;
                }
                return acc;
            }, 0);
        });

        // Sort the array based on the "total" column in descending order so that area is drawn from largest to smallest
        vis.rankingArray.sort((a, b) => b.total - a.total);

        // draw axis line
        vis.tickGroup.selectAll("line")
            .data(vis.featureData)
            .join(
                enter => enter.append("line")
                    .attr("x1", vis.width / 2)
                    .attr("y1", vis.height / 2)
                    .attr("x2", d => d.line_coord.x)
                    .attr("y2", d => d.line_coord.y)
                    .attr("stroke","#a0071b")
                    .attr("stroke-width", "3px")
            );

        // draw axis label
        vis.tickGroup.selectAll(".axislabel")
            .data(vis.featureData)
            .join(
                enter => enter.append("text")
                    .attr("x", d => d.label_coord.x -25)
                    .attr("y", d => d.label_coord.y)
                    .attr("font-size", "14px")
                    .attr("font-family", "'Montserrat', sans-serif")
                    .attr("text-anchor", "right")
                    .text(d => d.name)
                    .on("mouseover", (event, d) => {
                        vis.tooltip
                            .style("opacity", 1)
                            .style("position", "absolute")
                            .style("pointer-events", "none")
                            .style("background-color", "#f5f1e6")
                            .style("border", "solid 1px #a0071b")
                            .style("padding", "10px")
                            .style("border-radius", "5px")
                            .style("text-align", "left")
                            .style("font-family", "'Montserrat', sans-serif")
                            .style("font-weight", "normal");
                        vis.tooltip.html(`${vis.description[d.name]}`)
                            .style("left", (event.pageX + 25) + "px")
                            .style("top", (event.pageY - 28) + "px");
                        console.log("mouseover", vis.description[d.name])
                    })
                    .on("mouseout", function () {
                        // Hide tooltip
                        vis.tooltip.html("")
                            .style("opacity", 0);
                    })
            );

        // draw data lines
        vis.line = d3.line()
            .x(d => d.x)
            .y(d => d.y);

        // get the path for each country selected
        function getPathCoordinates(data_point){
            let coordinates = [];
            for (var i = 0; i < vis.features.length; i++){
                let ft_name = vis.features[i];
                let angle = (Math.PI / 2) + (2 * Math.PI * i / vis.features.length);
                coordinates.push(angleToCoordinate(angle, data_point[ft_name]));
            };

            // Add the starting point to close the path
            coordinates.push(coordinates[0]);

            return coordinates;
        };


        // draw the path onto the visualization
        vis.area = vis.tickGroup.selectAll("path")
            .data(vis.rankingArray)
            .join(
                enter => enter.append("path")
                    .attr("d", d => vis.line(getPathCoordinates(d)))
                    .attr("stroke-width", 2)
                    .attr("stroke", (d) => {
                        const color = getColor(d.Country, countryColorArray);
                        console.log("colors", d.Country, color)
                        return color;
                    })
                    .attr("fill",  (d) => {
                        const color = getColor(d.Country, countryColorArray);
                        return color;
                    }) // Ensure that the area is not filled
                    .attr("fill-opacity", 0.5)
                    .attr("stroke-opacity", 1)
                    .on("mouseover", function (event, d) {
                        d3.select(this)
                            .attr("fill-opacity", 0.85);

                        // Show tooltip
                        vis.tooltip
                            .style("opacity", 1);
                        vis.tooltip.html(`<strong>${d.Country}<br/></strong>`)
                            .style("left", (event.pageX + 5) + "px")
                            .style("top", (event.pageY - 28) + "px");
                    })
                    .on("mouseout", function (event, d) {
                        d3.select(this)
                            .attr("fill-opacity", 0.2);

                        // Hide tooltip
                        vis.tooltip.html("")
                            .style("opacity", "0")
                    })
                    .transition() // Add a transition
                    .duration(500), // Set the duration
                update => update.transition().duration(1000) // Add a transition for updates
                    .attr("d", d => vis.line(getPathCoordinates(d)))
                    .attr("stroke", (d) => {
                        const color = getColor(d.Country, countryColorArray);
                        console.log("colors", d.Country, color)
                        return color;
                    })
                    .attr("fill",  (d) => {
                        const color = getColor(d.Country, countryColorArray);
                        return color;
                    }),
                exit => exit.remove().transition().duration(500) // Add a transition for exits
            );

        vis.updateLegend()
    }

    updateLegend(){
        let vis = this;
        // Get the selected countries
        const selectedCountries = Array.from(vis.selection);

        // Remove existing legend items
        vis.svg.selectAll(".legend-item").remove();

        // Create legend items for each selected country
        const legendItems = vis.svg.selectAll(".legend-item")
            .data(selectedCountries)
            .enter()
            .append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(${vis.width * 0.25}, ${(i * 20) + vis.height*0.1})`); // Adjust the spacing as needed

        // Add colored rectangles to represent countries in the legend
        legendItems.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("x", -100)
            .attr("y", -40)
            .attr("stroke", "black")
            .attr("stroke-width", "0.5px")
            .attr("fill", country => getColor(country, countryColorArray));

        // Add country labels to the legend
        legendItems.append("text")
            .attr("x", -85) // Adjust the position as needed
            .attr("y", -30)
            .attr("font-family", "'Montserrat', sans-serif")
            .text(country => country);

        // Adjust the legend position based on the size of the spider chart
        const legendWidth = 100; // Adjust the width as needed
        const legendHeight = selectedCountries.length * 20; // Adjust the height based on the number of items
        const legendX = vis.width - vis.margin.right - legendWidth;
        const legendY = vis.margin.top;

    }

    // obtain the selected
    selectedCountries(selection){
        let vis = this;

        // attach selection to a this. variable so that it can be accessed throughout the class construction
        vis.selection = spiderSelect;

        // call wrangle data to pass the data on
        vis.wrangleData()
    }

    // clear all area paths upon clear button pressed
    emptyAll(selection){
        let vis = this;
        if(selection === 1){
            vis.area.remove().exit()
            vis.svg.selectAll(".legend-item").remove();
        }
    }

}
// get color for country
function getColor(country_name, countryColorArray) {
    const colorObject = countryColorArray.find(entry => entry.hasOwnProperty(country_name));
    return colorObject ? colorObject[country_name] : "defaultColor";
}