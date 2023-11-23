// selectVis.js
class SelectVis {
    constructor(parentElement, countries) {
        this.parentElement = parentElement;
        this.countries = countries;
        this.selectedCountries = new Set();

        this.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("pointer-events", "none")
            .style("background-color", "white")
            .style("border", "solid 1px #ccc")
            .style("padding", "10px")
            .style("border-radius", "5px")
            .style("text-align", "left");

        this.initVis();
    }

    initVis() {
        let vis = this;
        // Set up dimensions and margins
        vis.margin = { top: 80, right: 20, bottom: 80, left: 20 };
        vis.width = 800 - vis.margin.left - vis.margin.right;
        vis.height = 600 - vis.margin.top - vis.margin.bottom;


        // Initialize drawing area
        vis.svg = d3.select(vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(0, 50)");


        console.log("COUNTRIES")
        console.log(vis.countries)


        // Patterns for flags
        vis.patterns = vis.svg.append("defs").selectAll("pattern")
            .data(vis.countries)
            .enter().append("pattern")
            .attr("id", d => `flag-${d.name}`)
            .attr("width", 20)
            .attr("height", 10)
            .attr("patternContentUnits", "objectBoundingBox")
            .append("image")
            .attr("xlink:href", d => d.flag)
            .attr("width", 1)
            .attr("height", 1)
            .attr("preserveAspectRatio", "xMidYMid slice");

        // pattern for non-selected image
        vis.svg.select("defs")
            .append("pattern")
            .attr("id", "non-selected-pattern")
            .attr("width", 1)
            .attr("height", 1)
            .attr("patternContentUnits", "objectBoundingBox")
            .append("image")
            .attr("xlink:href", "img/non_select.png")
            .attr("width", 1)
            .attr("height", 1)
            .attr("preserveAspectRatio", "xMidYMid slice");

        // Creating circles
        vis.circles = vis.svg.selectAll(".country-circle")
            .data(vis.countries)
            .enter().append("circle")
            .attr("class", "country-circle")
            .attr("cx", (d, i) => (i % 7) * 80 + 50)
            .attr("cy", (d, i) => Math.floor(i / 7) * 80 + 30)
            .attr("r", 30)
            .attr("fill", d => `url(#flag-${d.name})`)
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .on("click", function(event, d) { vis.selectCountry(event, d); })
            .on("mouseover", function(event, d) {
                vis.tooltip.transition().duration(200).style("opacity", 1);
                vis.tooltip.html(d.name)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                vis.tooltip.transition().duration(500).style("opacity", 0);
            });

        // Submit button behavior
        d3.select("#submit-button").on("click", () => vis.submitSelection());
        d3.select("#clear-button").on("click", () => vis.clearSelection());

    }

    selectCountry(event, d) {
        let vis = this;

         if (vis.selectedCountries.size < 5) {
            vis.selectedCountries.add(d.name);
            d3.select(event.currentTarget)
                .attr("stroke", "pink")
                .attr("stroke-width", 5);
        }
    }

    getSelectedCountries() {
        let vis = this;
        // Return an array of names of the selected countries
        return Array.from(vis.selectedCountries);
    }

    submitSelection() {
        let vis = this;


        if (vis.selectedCountries.size === 5) {
            vis.circles.each(function(d) {
                let flag = d3.select(this);
                if (vis.selectedCountries.has(d.name)) {

                    // If selected, keep the original flag
                    flag.transition().duration(500)
                        .attr("fill", `url(#flag-${d.name})`);
                } else {
                    // If not selected, set the fill to gray with reduced opacity
                    flag.transition().duration(500)
                        .attr("fill", "url(#non-selected-pattern)");
                }
            });

            // Handle the selected countries (e.g., trigger an update in another component)
            handleSelectedCountries(vis.getSelectedCountries());
        } else {
            // Optionally, you can provide feedback to the user (e.g., alert or message on the page)
            alert("Please select exactly 5 countries before submitting.");
        }
    }

    clearSelection() {
        let vis = this;

        // Clear the selected countries
        vis.selectedCountries.clear();

        // Reset the appearance of all circles
        vis.circles.attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("fill", d => `url(#flag-${d.name})`);
    }
}
