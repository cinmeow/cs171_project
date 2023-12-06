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

        // choose how many select want to select
        this.num_selection = 5
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
            .on("click",
                function(event, d) {
                    // create if-else statement for selecting # of countries
                    // if > threshold, then you can only remove selections, but less can continue to add until threshold
                    if(spiderSelect.size > (vis.num_selection-1)){
                        // if the global variable spiderSelect has the country name, then remove, else "too many selections"
                        if(spiderSelect.has(d.name)){
                            console.log("unclick", d.name);
                            d3.select(event.currentTarget)
                                .attr("stroke", "black")
                                .attr("stroke-width", 1);
                            addTo_spiderSelect(d.name)
                        }else{
                            console.log("Too many selections")
                        }
                    }else{
                        // if threshold has not been met, and name of country is in spiderSelect, then clicking it again
                        // will turn the country borders back to black (unselected)
                        if(spiderSelect.has(d.name)){
                            console.log("unclick", d.name);
                            d3.select(event.currentTarget)
                                .attr("stroke", "black")
                                .attr("stroke-width", 1);
                        }else{
                            // if name of country is not in spiderSelect, then the flag will be highlighted (pink)
                            console.log("click", d.name);
                            d3.select(event.currentTarget)
                                .attr("stroke", "pink")
                                .attr("stroke-width", 5);
                        };
                        // if threshold has not been met, clicking country that is already in set will remove the country from set
                        // clicking country that is not in set will add country into set
                        addTo_spiderSelect(d.name);
                    };
            })
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

    submitSelection() {
        let vis = this;

        // set vis.selectedCountries to global variable spiderSelect
        vis.selectedCountries = spiderSelect


        if (vis.selectedCountries.size <= vis.num_selection) {
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
            handleSelectedCountries(Array.from(vis.selectedCountries));
        } else {
            // Optionally, you can provide feedback to the user (e.g., alert or message on the page)
            alert(`Please select up to ${vis.num_selection} countries before submitting.`);
        }
    }
    //
    clearSelection() {
        let vis = this;

        // Clear the selected countries
        spiderSelect.clear();
        console.log(spiderSelect)
        // Reset the appearance of all circles
        vis.circles.attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("fill", d => `url(#flag-${d.name})`);
    }
}
