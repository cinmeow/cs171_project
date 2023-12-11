let actionPage;

function confirmCuisine(){
    var selected = document.getElementById('bubbleSelector')
    var value = selected.value;

    // after confirming, move to next page
    window.location.href = '#call2action';

    // initialize final call to action
    actionPage = new ActionPage("action", value, globalSelected)
}

class ActionPage{
    constructor(parentElement, cuisine, countries) {
        this.parentElement = parentElement;
        this.cuisine = cuisine;
        this.countries = countries;

        this.initVis();
    }

    initVis() {
        let vis = this;

        // dynamic svg canvas
        vis.margin = {top: 80, right: 40, bottom: 20, left: 40};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // initialize svg drawing areas
        vis.locPanel = d3.select("#finalLoc")
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.right + vis.margin.left}, ${vis.margin.top})`);

        vis.imagePanel = d3.select("#finalRest")
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.right + vis.margin.left}, ${vis.margin.top})`);

        vis.cuisPanel = d3.select("#finalCuis")
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.right + vis.margin.left}, ${vis.margin.top})`);

        // append image of restaurant
        vis.imagePanel.append("image")
            .attr("xlink:href", "img/French-rest.png")
            .attr("width", 600)
            .attr('height', 800)
            .attr("x", 10)
            .attr("y", 10);


    }
}