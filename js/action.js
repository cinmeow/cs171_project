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

        // svg canvas
        vis.margin = {top: 40, right: 20, bottom: 20, left: 20};


        // initialize svg drawing areas

        vis.locwidth = document.getElementById('finalLoc').getBoundingClientRect().width
        vis.locheight = document.getElementById('finalLoc').getBoundingClientRect().height
        vis.locPanel =  d3.select("#finalLoc")
            .append("svg")
            .attr("width", vis.locwidth)
            .attr("height", vis.locheight)

        vis.countries.forEach(function(d, i){
            vis.locPanel.append("text")
                .text(d)
                .attr("x", vis.locwidth/2)
                .attr("y", 32 * (i+1))
                .attr("fill", 'black')
                .attr("text-anchor", "middle")
                .attr("class", "loclist")
        })


        vis.cuiswidth = document.getElementById('finalCuisRow').getBoundingClientRect().width
        vis.cuisheight = document.getElementById('finalCuisRow').getBoundingClientRect().height
        vis.cuisPanel = d3.select("#finalCuisRow")
            .append("svg")
            .attr("width", vis.cuiswidth)
            .attr("height", vis.cuisheight);

        vis.cuisPanel.append("text")
            .text(vis.cuisine)
            .attr("x", vis.cuiswidth/2)
            .attr("y", 32)
            .attr("fill", 'black')
            .attr("text-anchor", "middle")
            .attr("class", "cuisineF")




    }
}