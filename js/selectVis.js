// selectVis.js
class SelectVis {
    constructor(parentElement, countries) {
        this.parentElement = parentElement;
        this.countries = countries;
        this.selectedCountries = new Set();

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.svg = d3.select(vis.parentElement)
            .append("svg")
            .attr("width", 800)
            .attr("height", 600);

        // Patterns for flags
        vis.patterns = vis.svg.append("defs").selectAll("pattern")
            .data(vis.countries)
            .enter().append("pattern")
            .attr("id", d => `flag-${d.name}`)
            .attr("width", 60)
            .attr("height", 40)
            .attr("patternContentUnits", "objectBoundingBox")
            .append("image")
            .attr("xlink:href", d => d.flag)
            .attr("width", 1)
            .attr("height", 1)
            .attr("preserveAspectRatio", "xMidYMid slice");

        // Creating circles
        vis.circles = vis.svg.selectAll(".country-circle")
            .data(vis.countries)
            .enter().append("circle")
            .attr("class", "country-circle")
            .attr("cx", (d, i) => (i % 10) * 80 + 40)
            .attr("cy", (d, i) => Math.floor(i / 10) * 80 + 40)
            .attr("r", 30)
            .attr("fill", d => `url(#flag-${d.name})`)
            .attr("stroke", "black")
            .on("click", function(event, d) { vis.selectCountry(event, d); });

        // Submit button behavior
        d3.select("#submit-button").on("click", () => vis.submitSelection());
        d3.select("#clear-button").on("click", () => vis.clearSelection());
    }

    selectCountry(event, d) {
        let vis = this;

        if (vis.selectedCountries.has(d.name)) {
            vis.selectedCountries.delete(d.name);
            d3.select(event.currentTarget).attr("stroke", "black");
        } else if (vis.selectedCountries.size < 5) {
            vis.selectedCountries.add(d.name);
            d3.select(event.currentTarget).attr("stroke", "red");
        }
    }

    getSelectedCountries() {
        let vis = this;
        // Return an array of names of the selected countries
        return Array.from(vis.selectedCountries);
    }

    submitSelection() {
        let vis = this;

        vis.circles.each(function(d) {
            if (vis.selectedCountries.has(d.name)) {
                // Set the fill to gray with reduced opacity
                d3.select(this).attr("fill", "rgba(128, 128, 128, 0.2)");
            }
        });

        handleSelectedCountries(vis.getSelectedCountries());
    }

    clearSelection() {
        let vis = this;

        // Clear the selected countries
        vis.selectedCountries.clear();

        // Reset the appearance of all circles
        vis.circles.attr("stroke", "black").attr("fill", d => `url(#flag-${d.name})`);
    }
}
