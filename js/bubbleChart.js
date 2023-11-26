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


        // // add title
        // vis.title = vis.svg.append("text")
        //     .attr("x", vis.width / 2)
        //     .attr("y", 0 - vis.margin.top / 3)
        //     .attr("text-anchor", "middle")
        //     .style("font-size", "20px")
        //     .text("bubble chart title")


        // set scale for bubble radius
        vis.circleRad = d3.scaleSqrt()
            .domain([0, 4])
            .range([5, 15])

        // append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'bubbleTooltip')

        // create custom selector for country subset and trigger filter if selected
        vis.createSelector();

    }

    createSelector() {
        let vis = this;

        // selected countries
        if (globalSelected != null) {
            vis.countries = globalSelected;
            vis.countryData = vis.data.filter(function(d) {
                return globalSelected.includes(d.Country)
            })
        } else {
            vis.countries = vis.data.map((d) => d.Country)
            vis.countryData = vis.data;
        }

        // find top 10 cuisines in selected countries
        let cuisinegroup =  Array.from(d3.rollup(vis.countryData, leaves => leaves.length, d => d['Cuisine']),
            ([key, value]) => ({category: key, value: value}));

        // sort cuisines
        cuisinegroup.sort((a, b) => b.value - a.value)

        // top 10 cuisine
        let top10 = cuisinegroup.slice(0, 10)
        console.log("new top 10")
        console.log(top10)

        // remove previous
        d3.select('#bubbleSelector').selectAll("option").remove();

        // now create custom selector based on selected countries
        vis.selector = d3.select("#bubbleSelector");

        vis.selector.selectAll("option")
            .data(top10)
            .enter()
            .append("option")
            .text((d) => d.category)

        // set default cuisine
        vis.cuisine = top10[0].category;

        // handle selection
        vis.selector.on("change", function () {
            vis.cuisine = d3.select(this).property("value")
            vis.displayData = vis.countryData

            console.log("CHANGED")
            console.log(vis.cuisine)
            vis.wrangleData();
        })

        vis.displayData = vis.countryData;
        vis.wrangleData();

    }

    wrangleData() {
        let vis = this;

        console.log("before filter")
        console.log(vis.displayData)

        // filter for cuisine
        vis.displayData = vis.displayData.filter(function(d) {
            return d.Cuisine === vis.cuisine;
        })

        console.log('final display data')
        console.log(vis.displayData)

        vis.updateVis();
    }


    updateVis() {
        let vis = this;

        // set up selection menu based on most popular cuisines in selected countries

        // create groups and their centers
        vis.stars = {
            "one": {x: vis.width/6.5, y: vis.height/2, title: "1 Star MICHELIN"},
            "two": {x: vis.width/6.5*2, y: vis.height/2, title: "2 Stars MICHELIN"},
            "three": {x: vis.width/6.5*3, y: vis.height/2, title: "3 Stars MICHELIN"},
            "bib": {x: vis.width/6.5*4, y: vis.height/2, title:"Bib Gourmand"},
            "green": {x: vis.width/6.5*5, y: vis.height/2, title:"MICHELIN Green Star"},
        }

        vis.svg.selectAll("circle").remove();

        // draw circles
        let circles = vis.svg.selectAll("circle")
            .data(vis.displayData)
            .enter()
            .append("circle")
            .attr("r", (d) => vis.circleRad(d['Price']))
            .on('mouseover', function(event, d) {
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 15 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
             <div class="bubbleTooltip">
                 <h4 id="bubbleRest"> ${d.Name} </h4>
                 <p id="bubbeInfo"><strong>Award:</strong> ${d.Award}</p>      
                 <p id="bubbeInfo"><strong>Cuisine:</strong> ${d.Cuisine}</p>      
                 <p id="bubbeInfo"><strong>Location:</strong> ${d.City}, ${d.Country} </p>   
                 <p id="bubbeInfo"><strong>Price:</strong> ${"$".repeat(d.Price)}</p>                   
             </div>`)
                return vis.tooltip.style("visibility", "visible");
        }).on('mouseout', function() {
            return vis.tooltip.style("visibility", "hidden")
            })

        // force simulations to space out the circles
        let forces = d3.forceSimulation(vis.displayData)
            .force("charge", d3.forceManyBody().strength([-30]))
            .force("center", (d) => d3.forceCenter(groupForceX(d), groupForceY(d)))
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
                    return vis.stars.one.x
                case '2 Stars MICHELIN':
                    return vis.stars.two.x
                case '3 Stars MICHELIN':
                    return vis.stars.three.x
                case 'Bib Gourmand':
                    return vis.stars.bib.x
                case 'MICHELIN Green Star':
                    return vis.stars.green.x
            }
        }

        // set appropraite force Y
        function groupForceY(d) {
            switch (d.Award) {
                case '1 Star MICHELIN':
                    return vis.stars.one.y
                case '2 Stars MICHELIN':
                    return vis.stars.two.y
                case '3 Stars MICHELIN':
                    return vis.stars.three.y
                case 'Bib Gourmand':
                    return vis.stars.bib.y
                case 'MICHELIN Green Star':
                    return vis.stars.green.y
            }
        }

        // set title for separate bubbles clusters
        var index = 0;
        for (var rating in vis.stars) {
            let group = vis.stars[rating]

            vis.svg.append("text")
                .attr("x", (index * vis.width / 5) + 150)
                .attr("y", 80)
                .attr("text-anchor", "middle")
                .style("font-size", "20px")
                .attr("class", "bubbleTitle")
                .text(group.title)

            index++;
        }


        // set colour scale for bubbles
        vis.circleColour = d3.scaleOrdinal(d3.schemePastel1)
            .domain(vis.countries)

        // colour circle by country
        circles.attr("fill", (d) => vis.circleColour(d.Country));




    }
}

