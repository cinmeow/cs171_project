/** Bubble Chart Class
 * Code reference from combination of sources below:
 * https://medium.com/free-code-camp/a-gentle-introduction-to-d3-how-to-build-a-reusable-bubble-chart-9106dc4f6c46
 * https://github.com/jeffreymorganio/d3-country-bubble-chart/blob/master/script.js#L147
 * https://github.com/dmesquita/reusable_bubble_chart/blob/master/bubble_chart.js
 * **/

class BubbleChart {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = [];

        this.initVis();
    }

    initVis() {
        let vis = this;

        console.log("bubble")
        console.log(vis.data);

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
            .text("bubble chart title")


        // set scale for bubble radius
        vis.circleRad = d3.scaleSqrt()
            .domain([0, 4])
            .range([3, 15])


        vis.wrangleData();


    }


    wrangleData() {
        let vis = this;

        // selected countries
        if (globalSelected != null) {
            vis.countries = globalSelected;
            vis.displayData = vis.data.filter(function(d) {
                return globalSelected.includes(d.Country)
            })
        } else {
            vis.countries = vis.data.map((d) => d.Country)
            vis.displayData = vis.data;
        }

        // select cuisine (dynamically)
        vis.cuisine = 'American';

        // filter for cuisine
        vis.displayData = vis.displayData.filter(function(d) {
            return d.Cuisine === vis.cuisine;
        })

        console.log(vis.displayData)

        vis.updateVis();
    }


    updateVis() {
        let vis = this;

        // create groups and their centers
        let stars = {
            "one": {x: vis.width/5, y: vis.height/2, title: "1 Star MICHELIN"},
            "two": {x: vis.width/5*2, y: vis.height/2, title: "2 Stars MICHELIN"},
            "three": {x: vis.width/5*3, y: vis.height/2, title: "3 Stars MICHELIN"},
            "bib": {x: vis.width/5*4, y: vis.height/2, title:"Bib Gourmand"},
            "green": {x: vis.width/5*5, y: vis.height/2, title:"MICHELIN Green Star"},
        }

        // draw circles
        let circleG = vis.svg.append("g").attr("class", "bubbles")

        let circles = circleG.selectAll("circle")
            .data(vis.displayData)
            .enter()
            .append("circle")
            .attr("r", (d) => vis.circleRad(d['Price']));

        // force simulations to space out the circles
        let forces = d3.forceSimulation(vis.displayData)
            .force("charge", d3.forceManyBody().strength([-50]))
            .force("x", d3.forceX(groupForceX))
            .force("y", d3.forceY(groupForceY))
            .on("tick", function() {
                circles.attr("cx", function(d) { return d.x})
                    .attr("cy", function(d) { return d.y})
            })

        // set appropriate force X
        function groupForceX(d) {
            switch (d.Award) {
                case '1 Star MICHELIN':
                    return stars.one.x
                case '2 Stars MICHELIN':
                    return stars.two.x
                case '3 Stars MICHELIN':
                    return stars.three.x
                case 'Bib Gourmand':
                    return stars.bib.x
                case 'MICHELIN Green Star':
                    return stars.green.x
            }
        }

        // set appropraite force Y
        function groupForceY(d) {
            switch (d.Award) {
                case '1 Star MICHELIN':
                    return stars.one.y
                case '2 Stars MICHELIN':
                    return stars.two.y
                case '3 Stars MICHELIN':
                    return stars.three.y
                case 'Bib Gourmand':
                    return stars.bib.y
                case 'MICHELIN Green Star':
                    return stars.green.y
            }
        }

        // set title for separate bubbles



        // set colour scale for bubbles
        vis.circleColour = d3.scaleOrdinal(d3.schemePastel1)
            .domain(vis.countries)

        // colour circle by country
        circles.attr("fill", (d) => vis.circleColour(d.Country));




    }
}

