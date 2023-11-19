class MapVis {
    constructor(parentElement, tourismData, geoData) {
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.tourismData = tourismData;

        // Define color scale - you can adjust the range as per your needs
        this.colorScale = d3.scaleSequential(d3.interpolateReds);

        this.initVis();
    }

    initVis() {
        let vis = this;

        // Set up dimensions and margins
        vis.margin = { top: 80, right: 80, bottom: 80, left: 80 };
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
            .text('Map')
            .attr('transform', `translate(${vis.width / 2}, 20)`)
            .attr('text-anchor', 'middle');

        const baseHeight = 650; // Example base height - adjust this as needed
        // const zoom = vis.height / baseHeight;

        // Initialize projection and path for the map
        vis.projection = d3.geoOrthographic()
            .translate([vis.width / 2, vis.height / 2])
            // .scale(249.5 * zoom)
            .scale(245)  // Adjust scale to fit the SVG area
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

        )
            .call(vis.zoom);

        // Apply the zoom behavior to the SVG
        // vis.svg.call(vis.zoom);

        vis.svg.append("path")
            .datum({type: "Sphere"})
            .attr("class", "graticule")
            .attr('fill', '#ADDEFF')
            .attr("stroke","rgba(129,129,129,0.35)")
            .attr("d", vis.path);

        // Set up legend dimensions and position
        vis.legendDimensions = { width: 100, height: 20, position: { x: 100, y: vis.height - 30 } };



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
        


        // Wrangle the data
        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // // Aggregate data: calculate average number of arrivals per country
        vis.arrivalDataByCountry = d3.rollup(vis.tourismData,
            v => d3.mean(v, d => d['Number of Arrivals']),
            d => d['Country Name']);

        // Set the domain for the color scale based on data
        vis.colorScale.domain(d3.extent(Array.from(vis.arrivalDataByCountry.values())));

        // Create a scale for the legend
        vis.legendScale = d3.scaleLinear()
            .range([0, vis.legendDimensions.width])
            .domain(vis.colorScale.domain());


        // Calculate mean arrivals and expenditures per country
        vis.countryInfo = Array.from(d3.group(vis.tourismData, d => d['Country Name']), ([name, values]) => {
            return {
                name: name,
                mean_arrivals: d3.mean(values, d => d['Number of Arrivals']),
                mean_expenditure: d3.mean(values, d => d['Inbound Visitor Expenditures (current US$)'])

            };

        });
        console.log(vis.countryInfo);

        let groupedByCountry = d3.group(vis.tourismData, d => d['Country Name']);

        // Process each country
        vis.countryInfoByYear = Array.from(groupedByCountry, ([countryName, values]) => {
            let arrivals = values.map(d => ({ year: d['Year'], arrivals: d['Number of Arrivals'] }));
            let expenditures = values.map(d => ({ year: d['Year'], expenditures: d['Inbound Visitor Expenditures (current US$)'] }));

            return {
                name: countryName,
                arrivals: arrivals,
                expenditures: expenditures
            };
        });

        console.log(vis.countryInfoByYear);




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
            .on("mouseover", (event, d) => {
                d3.select(event.currentTarget)
                    .attr("fill", "pink"); // Change color to purple on mouseover

                let countryData = vis.countryInfo.find(c => c.name === d.properties.name);

                vis.tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);

                if (countryData && countryData.mean_arrivals) {
                    vis.tooltip.html(
                        `<strong>Country:</strong> ${countryData.name}<br>
                        <strong>Avg Arrivals:</strong> ${countryData.mean_arrivals}<br>
                        <strong>Avg Expenditures:</strong> ${countryData.mean_expenditure || 'N/A'}`
                    );
                } else {
                    vis.tooltip.html(
                        `<strong>Country:</strong> ${d.properties.name}<br>
                        <strong>Data Not Available</strong>`
                    );
                }

                vis.tooltip
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", (event, d) => {
                d3.select(event.currentTarget)
                    .attr("fill", d => { // Reset color on mouseout
                        let countryName = d.properties.name;
                        let arrivals = vis.arrivalDataByCountry.get(countryName);
                        return arrivals ? vis.colorScale(arrivals) : '#ccc';
                    });

                vis.tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on("click", function(event, d) {
                let selectedCountryName = d.properties.name;
                vis.handleCountryClick(selectedCountryName);
            });

        // Add horizontal legend
        vis.legend = vis.svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${vis.legendDimensions.position.x}, ${vis.legendDimensions.position.y})`);

        // Create a gradient for the legend
        vis.defs = vis.svg.append("defs");
        const linearGradient = vis.defs.append("linearGradient")
            .attr("id", "linear-gradient");

        const numStops = 10;
        const stopColors = d3.range(numStops).map(d => vis.colorScale(d / (numStops - 1) * vis.colorScale.domain()[1]));

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
        const domain = vis.colorScale.domain();
        const numTicks = 4;
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




        // Add more features (like tooltips, etc.) as needed
    }
    handleCountryClick(countryName) {
        let vis = this;
        let selectedData = vis.countryInfoByYear.find(d => d.name === countryName);

        if(selectedData) {
            // Assuming LineVis has a global variable named 'lineVis'
            lineVis.setData(selectedData.arrivals, countryName); // or expenditures, based on your requirement
        }
    }

    rotateGlobe() {
        let vis = this;

        // Define the rotation step
        let rotationStep = 0.25;

        d3.timer(() => {
            // Increment the rotation
            let rotation = vis.projection.rotate();
            rotation[0] += rotationStep;
            vis.projection.rotate(rotation);

            // Redraw the countries with the new projection
            vis.svg.selectAll(".country").attr("d", vis.path);
        });
    }

}
