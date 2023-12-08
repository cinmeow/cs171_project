class MapVis {
    constructor(parentElement, tourismData, michelinData, travelData, geoData) {
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.tourismData = tourismData;
        this.michelinData = michelinData;
        this.travelData = travelData;
        // console.log("mich data:",michelinData);


        this.initVis();
    }

    initVis() {
        let vis = this;

        // Set up dimensions and margins
        vis.margin = { top: 80, right: 10, bottom: 80, left: 20 };
        vis.width = 1000 - vis.margin.left - vis.margin.right;
        vis.height = 800 - vis.margin.top - vis.margin.bottom;

        // Initialize drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left}, ${vis.margin.top})`);

        vis.svg.append('g')
            .attr('class', 'title')
            .attr('id', 'map-title')
            .append('text')
            .text('Select Country to View Data')
            .attr('transform', `translate(${vis.width / 2.7}, -40)`)
            .attr('text-anchor', 'middle');

        const baseHeight = 650; // Example base height - adjust this as needed
        const zoom = vis.height / baseHeight;

        // Initialize projection and path for the map
        vis.projection = d3.geoOrthographic()
            .translate([vis.width / 2.7, vis.height / 3])
            // .scale(249.5 * zoom)
            .scale(230)  // Adjust scale to fit the SVG area
            .clipAngle(90);  // Clip at the hemisphere

        vis.path = d3.geoPath()
            .projection(vis.projection);

        vis.world = topojson.feature(vis.geoData, vis.geoData.objects.countries).features

        vis.zoom = d3.zoom()
            .scaleExtent([1, 8])  // Set the scale extent for zooming
            .on('zoom', (event) => {
                vis.svg.attr('transform', event.transform);
            });


        let m0,
            o0;

        vis.svg.call(
            d3.drag()
                .on("start", function (event) {

                    let lastRotationParams = vis.projection.rotate();
                    m0 = [event.x, event.y];
                    o0 = [-lastRotationParams[0], -lastRotationParams[1]];
                })
                .on("drag", function (event) {
                    if (m0) {
                        let m1 = [event.x, event.y],
                            o1 = [o0[0] + (m0[0] - m1[0]) / 4, o0[1] + (m1[1] - m0[1]) / 4];
                        vis.projection.rotate([-o1[0], -o1[1]]);
                    }

                    // Update the map
                    vis.path = d3.geoPath().projection(vis.projection);
                    d3.selectAll(".country").attr("d", vis.path)
                    d3.selectAll(".graticule").attr("d", vis.path)
                })

        ).call(vis.zoom);


        vis.svg.append("path")
            .datum({type: "Sphere"})
            .attr("class", "graticule")
            .attr('fill', '#ADDEFF')
            .attr("stroke","rgba(129,129,129,0.35)")
            .attr("d", vis.path);

        // Set up legend dimensions and position
        vis.legendDimensions = { width: 100, height: 20, position: { x: 100, y: vis.height - 160 } };


        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("pointer-events", "none")
            .style("background-color", "white")
            .style("border", "solid 1px #ccc")
            .style("padding", "10px")
            .style("border-radius", "5px")
            .style("text-align", "left");


        vis.colorScale = d3.scaleSequential(d3.interpolateReds)



        // Wrangle the data
        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // Aggregate data: calculate average number of arrivals per country
        vis.arrivalDataByCountry = d3.rollup(vis.tourismData,
            v => d3.mean(v, d => d['Number of Arrivals']),
            d => d['Country Name']);

        // Set the domain for the color scale based on data
        vis.colorScale.domain(d3.extent(Array.from(vis.arrivalDataByCountry.values())));

        // Aggregate data: calculate average number of restaurants per country
        vis.michelinDataByCountry = d3.rollup(vis.michelinData,
            v => v.length,
            d => d['Country']);

        vis.bedPlacesDataByCountry = d3.rollup(vis.travelData,
                v => d3.mean(v, d => d['numBedPlaces']),
                d => d['Country']);

        // console.log("m:",vis.michelinDataByCountry);

        // Create a scale for the legend
        vis.legendScale = d3.scaleLinear()
            .range([0, vis.legendDimensions.width])
            .domain(vis.colorScale.domain());


        // Calculate mean arrivals and expenditures per country
        vis.countryInfo = Array.from(d3.group(vis.tourismData, d => d['Country Name']), ([name, values]) => {
            return {
                name: name,
                mean_arrivals: d3.mean(values, d => d['Number of Arrivals']),
                mean_expenditure: d3.mean(values, d => d['Expenditures (current US$)'])

            };

        });
        // console.log(vis.countryInfo);

        let groupedByCountry = d3.group(vis.tourismData, d => d['Country Name']);

        // Process each country
        vis.countryInfoByYear = Array.from(groupedByCountry, ([countryName, values]) => {
            let arrivals = values.map(d => ({ year: d['Year'], arrivals: d['Number of Arrivals'] }));
            let expenditures = values.map(d => ({ year: d['Year'], expenditures: d['Expenditures (current US$)'] }));

            return {
                name: countryName,
                arrivals: arrivals,
                expenditures: expenditures
            };
        });

        // console.log(vis.countryInfoByYear);

        vis.legendTitles = {
            'arrivals': 'Average Number of Arrivals',
            'michelin': 'Number of Michelin Restaurants',
            'accommodations': 'Average Number of Bed Places'
        };

        vis.updateVis();
    }

    updateVis() {

        let vis = this;
        vis.rotateGlobe();

        // Draw the countries on the map
        vis.countries = vis.svg.selectAll(".country")
            .data(topojson.feature(vis.geoData, vis.geoData.objects.countries).features)
            .enter().append("path")
            .attr('class', 'country')
            .attr("d", vis.path)
            .attr("fill", d => {
                let countryName = d.properties.name;
                let arrivals = vis.arrivalDataByCountry.get(countryName);
                return arrivals ? vis.colorScale(arrivals) : '#ccc'; // Color based on average arrivals
            })
            .on("mouseover", function(event, d) {
                let originalColor = d3.select(this).attr("fill");
                d3.select(this).attr("fill", "pink")
                    .classed("original-color", true)
                    .attr("data-original-color", originalColor);

                let countryData = vis.countryInfo.find(c => c.name === d.properties.name);
                let michelinRestaurants = vis.michelinDataByCountry.get(d.properties.name) || 0;
                let avgbedplaces = vis.bedPlacesDataByCountry.get(d.properties.name) || 0;

                vis.tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);

                if (countryData && countryData.mean_arrivals) {
                    // console.log(countryData)
                    // console.log(michelinRestaurants)
                    vis.tooltip.html(
                        `<strong>Country:</strong> ${d.properties.name}<br>
                        <strong>Avg Arrivals:</strong> ${countryData.mean_arrivals || 'N/A'}<br>
                        <strong>Avg Expenditures:</strong> ${countryData.mean_expenditure || 'N/A'}<br>
                         <strong>Avg Number of Bed Places:</strong> ${avgbedplaces || 'N/A'}<br>
                        <strong>Michelin Restaurants:</strong> ${michelinRestaurants}`
                        
                    );
                } else {
                    if  (michelinRestaurants) {
                        vis.tooltip.html(
                            `<strong>Country:</strong> ${d.properties.name}<br>
                        <strong>Michelin Restaurants:</strong> ${michelinRestaurants}`

                        );

                    } else {
                        vis.tooltip.html(
                            `<strong>Country:</strong> ${d.properties.name}<br>
                            <strong>Data Not Available</strong>`
                        );
                    }
                }

                vis.tooltip
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(event, d) {
                if (d3.select(this).classed("original-color")) {
                    d3.select(this).attr("fill", d3.select(this).attr("data-original-color"))
                        .classed("original-color", false);
                }

                vis.tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on("click", function(event, d) {
                let selectedCountryName = d.properties.name;
                // Check if the country is already selected
                if (vis.selectedCountry === selectedCountryName) {
                    // Clear the selection
                    vis.selectedCountry = null;
                    d3.selectAll(".country").classed("selected-country", false);
                } else {
                    // Update the selected country
                    vis.selectedCountry = selectedCountryName;
                    // Clear previous selections
                    d3.selectAll(".country").classed("selected-country", false);
                    // Highlight the clicked country
                    d3.select(this).classed("selected-country", true);
                }

                // Handle the click event for the selected country
                vis.handleCountryClick(selectedCountryName);
            });

        // Add horizontal legend
        vis.legend = vis.svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${vis.legendDimensions.position.x}, ${vis.legendDimensions.position.y})`);

        // Create a gradient for the legend
        vis.defs = vis.svg.append("defs");
        let linearGradient = vis.defs.append("linearGradient")
            .attr("id", "linear-gradient");

        let numStops = 10;
        let stopColors = d3.range(numStops).map(d => vis.colorScale(d / (numStops - 1) * vis.colorScale.domain()[1]));

        linearGradient.selectAll("stop")
            .data(stopColors)
            .enter().append("stop")
            .attr("offset", (d, i) => i / (numStops - 1))
            .attr("stop-color", d => d);

        // Draw the rectangle and fill with gradient
        vis.legend.append("rect")
            .attr("width", vis.legendDimensions.width)
            .attr("height", vis.legendDimensions.height)
            .style("fill", "url(#linear-gradient)");

        // Calculate tick values
        let domain = vis.colorScale.domain();
        let numTicks = 4;
        let tickValues = d3.range(domain[0], domain[1], (domain[1] - domain[0]) / (numTicks - 1));
        tickValues.push(domain[1]); // Ensure the last value is included

        // Add legend axis
        vis.legendAxis = d3.axisBottom(vis.legendScale)
            .tickValues(tickValues)
            .tickFormat(d3.format(".2s")); // or any format you prefer

        vis.legend.append("g")
            .attr("class", "legend-axis")
            .attr("transform", `translate(0, ${vis.legendDimensions.height})`)
            .call(vis.legendAxis);

        // Add label at the left end of the axis
        vis.legend.append("text")
            .attr("class", "legend-label")
            .attr("x", vis.legendDimensions.width / 2) // Middle of the axis
            .attr("y", vis.legendDimensions.height + 40) // Below the axis
            .style("text-anchor", "middle")
            .text("Average Number of Arrivals"); // Replace with your desired label text



    }
    handleCountryClick(countryName) {
        let vis = this;
        let selectedData = vis.countryInfoByYear.find(d => d.name === countryName);
        let selectedDatabyM =vis.michelinData.filter(d => d.Country === countryName);
        let selectedDataAcc = vis.travelData.filter(d => d.Country === countryName);

        if(selectedData) {
            console.log("selected data", selectedData);
            // Assuming LineVis has a global variable named 'lineVis'
            if (lineVis && lineVis2) {
                lineVis.setData(selectedData.arrivals, countryName);
                lineVis2.setData(selectedData.expenditures, countryName);
                }


            if (barchart && barchart2) {
                barchart.setData(selectedDatabyM, countryName);
                barchart2.setData(selectedDatabyM, countryName);
            }

            if ( areachart1 && areachart2){
                console.log("acc data", selectedDataAcc)
                areachart1.setData(selectedDataAcc, countryName);
                areachart2.setData(selectedDataAcc, countryName);
            }
        }
    }

    rotateGlobe() {
        let vis = this;

        // Define the rotation step
        let rotationStep = 0;

        d3.timer(() => {
            // Increment the rotation
            let rotation = vis.projection.rotate();
            rotation[0] += rotationStep;
            vis.projection.rotate(rotation);

            // Redraw the countries with the new projection
            vis.svg.selectAll(".country").attr("d", vis.path);
        });
    }

    updateColorScale(dataType) {
        let vis = this;

        if (dataType === 'arrivals') {
            // Update color scale for arrivals
            vis.colorScale.domain(d3.extent(Array.from(vis.arrivalDataByCountry.values())));
        } else if (dataType === 'michelin') {
            // Update color scale for Michelin data
            vis.colorScale.domain(d3.extent(Array.from(vis.michelinDataByCountry.values())));
        } else if (dataType === 'accommodations') {
            // update color scale for acc data
            vis.colorScale.domain(d3.extent(Array.from(vis.bedPlacesDataByCountry.values())));
        }
    


        // Redraw the map with the new color scale
        vis.countries.transition()
            .duration(500)
            .attr("fill", d => {
                let countryName = d.properties.name;
                let value;
            if (dataType === 'arrivals') {
                value = vis.arrivalDataByCountry.get(countryName);
            } else if (dataType === 'michelin') {
                value = vis.michelinDataByCountry.get(countryName);
            } else if (dataType === 'accommodations') {
                value = vis.bedPlacesDataByCountry.get(countryName);
            }
            return value ? vis.colorScale(value) : '#ccc';
        });

        // Update the legend scale domain
        vis.legendScale.domain(vis.colorScale.domain());

        // Update the legend axis
        let numTicks = 4;
        let tickValues = d3.range(vis.legendScale.domain()[0], vis.legendScale.domain()[1], (vis.legendScale.domain()[1] - vis.legendScale.domain()[0]) / (numTicks - 1));
        tickValues.push(vis.legendScale.domain()[1]); // Ensure the last value is included

        vis.legend.select(".legend-axis")
            .transition().duration(500)
            .call(d3.axisBottom(vis.legendScale)
                .tickValues(tickValues)
                .tickFormat(d3.format(".2s")));

        vis.svg.select(".legend-label").text(vis.legendTitles[dataType]);
    }

}
