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
        vis.margin = {top: 80, right: 40, bottom: 20, left: 40};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // initialize svg drawing area
        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.right + vis.margin.left}, ${vis.margin.top})`);


        // bubble radius "scale"
        vis.circleSizes = {
            0: 2,
            1: 5,
            2: 8,
            3: 10,
            4: 18
        }

        vis.makeLegend();


        // append info in left column
        vis.michelinInfo = d3.select("#michelinreminder")

        // append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")



            //.attr('id', 'bubbleTooltip')

        // create custom selector for country subset and trigger filter if selected
        vis.createSelector();

    }

    makeLegend() {

        let vis=this;

        // add legend
        vis.legend = d3.select("#bubbleLegend").append("svg")
            .attr("width", 100)
            .attr("height", 230)
            .attr("fill", 'none')
            .attr("stroke", 'black')
            .attr("stroke-width", 2)

        vis.legend.append("circle").attr("cx", 40).attr("cy", 80-5*2).attr("r", 5*2)
            .attr("fill", 'none')
            .attr("stroke", 'black')
            .attr("stroke-width", 2)

        vis.legend.append("circle").attr("cx", 40).attr("cy", 80-8*2).attr("r", 8*2)
            .attr("fill", 'none')
            .attr("stroke", 'black')
            .attr("stroke-width", 2)

        vis.legend.append("circle").attr("cx", 40).attr("cy", 80-10*2).attr("r", 10*2)
            .attr("fill", 'none')
            .attr("stroke", 'black')
            .attr("stroke-width", 2)

        vis.legend.append("circle").attr("cx", 40).attr("cy", 80-18*2).attr("r", 18*2)
            .attr("fill", 'none')
            .attr("stroke", 'black')
            .attr("stroke-width", 2)

        // add line

        vis.legend.append("line")
            .attr('x1', 40 + 10)
            .attr('x2', 150)
            .attr('y1', 80-5)
            .attr('y2', 80-5)
            .attr('stroke', 'black')
            .style('stroke-dasharray', ('2,2'))

        vis.legend.append("line")
            .attr('x1', 40 + 16)
            .attr('x2', 150)
            .attr('y1', 80-20)
            .attr('y2', 80-20)
            .attr('stroke', 'black')
            .style('stroke-dasharray', ('2,2'))

        vis.legend.append("line")
            .attr('x1', 40 + 12)
            .attr('x2', 150)
            .attr('y1', 80-35)
            .attr('y2', 80-35)
            .attr('stroke', 'black')
            .style('stroke-dasharray', ('2,2'))

        vis.legend.append("line")
            .attr('x1', 40 + 30)
            .attr('x2', 150)
            .attr('y1', 80-55)
            .attr('y2', 80-55)
            .attr('stroke', 'black')
            .style('stroke-dasharray', ('2,2'))

        // ADD label

        vis.legend.append("text")
            .attr('x', 150)
            .attr('y', 80-5)
            .text("$")
            .style("font-size", 14)
            .attr('alignment-baseline', 'middle')
            .attr("fill", 'black')
            .attr("stroke-width", 0)

        vis.legend.append("text")
            .attr('x', 150)
            .attr('y', 80-20)
            .text("$$")
            .style("font-size", 14)
            .attr('alignment-baseline', 'middle')
            .attr("fill", 'black')
            .attr("stroke-width", 0)

        vis.legend.append("text")
            .attr('x', 150)
            .attr('y', 80-35)
            .text("$$$")
            .style("font-size", 14)
            .attr('alignment-baseline', 'middle')
            .attr("fill", 'black')
            .attr("stroke-width", 0)

        vis.legend.append("text")
            .attr('x', 150)
            .attr('y', 80-55)
            .text("$$$$")
            .style("font-size", 14)
            .attr('alignment-baseline', 'middle')
            .attr("fill", 'black')
            .attr("stroke-width", 0)

        // add disclaimer
        vis.legend.append("text")
            .attr('x', 10)
            .attr('y', 105)
            .attr("class", "disclaimer")
            .attr('fill', 'black')
            .text("*Legend not to scale, bubble relative size indicates price")
            .attr("stroke-width", 0)

    }

    createSelector() {
        let vis = this;

        // selected countries
        if (globalSelected != null) {

            // check for south korea as edge case
            if (globalSelected.includes("South_Korea")) {
                vis.countries = globalSelected.filter((d) => d !== 'South_Korea')
                vis.countries.push("South Korea")
            } else {
                vis.countries = globalSelected;
            }

            if (globalSelected.includes("Hong_Kong")) {
                vis.countries = globalSelected.filter((d) => d !== 'Hong_Kong')
                vis.countries.push("Hong Kong")
            } else {
                vis.countries = globalSelected;
            }

            vis.countryData = vis.data.filter(function(d) {
                return vis.countries.includes(d.Country)
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
            "bib": {x: 80 + vis.width/5.5, y: vis.height/3.5, title:"Bib Gourmand"},
            "green": {x: 80 + vis.width/5.5*2.5, y: vis.height/3.5, title:"Green Star"},
            "one": {x: 80 + vis.width/5.5, y: vis.height/1.5, title: "1 Star"},
            "two": {x: 80 + vis.width/5.5*2, y: vis.height/1.5, title: "2 Stars"},
            "three": {x: 80 + vis.width/5.5*3, y: vis.height/1.5, title: "3 Stars"},
        }

        vis.svg.selectAll("circle").remove();


        // draw circles
        let circles = vis.svg.selectAll("circle")
            .data(vis.displayData)
            .enter()
            .append("circle")
            .attr("r", (d) => vis.circleSizes[d.Price]) // vis.circleRad(d['Price'])
            .attr("stroke", "black")  // Set the outline color to black
            .attr("stroke-width", 1)
            .on('mouseover', function(event, d) {
                // set hover color
                let myCircle = d3.select(this);
                myCircle.attr("stroke", "#A0071B");
                myCircle.attr("stroke-width", 5)

                // change michelin info text
                replaceText(d);

                // drop and rewrite title
                vis.moveTitle(d.Award);

                // display tool tip
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

            // revert stroke
            let myCircle = d3.select(this);
            myCircle.attr("stroke", "black");
            myCircle.attr("stroke-width", 1);

            // revert title
            vis.addTitle();

            // revert text
            vis.michelinInfo.text("The Michelin Guide has five different culinary distinction awards: " +
                "Bib Gourmand, MICHELIN Green Star, 1 Star MICHELIN, 2 Star MICHELIN and 3 Star MICHELIN. " +
                "Hover over bubbles in a category to review what each award means.")

            return vis.tooltip.style("visibility", "hidden")
            })


        // force simulations to space out the circles
        let forces = d3.forceSimulation(vis.displayData)
            .force("charge", d3.forceManyBody().strength([-15]))
            .force("center", (d) => d3.forceCenter(groupForceX(d), groupForceY(d)))
            .force("x", d3.forceX(groupForceX))
            .force("y", d3.forceY(groupForceY))
            .on("tick", function() {
                circles.attr("cx", function(d) {
                    return d.x
                }).attr("cy", function(d) {
                    return d.y
                })

                vis.addTitle();
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


        // set colour scale for bubbles
        vis.circleColour = d3.scaleOrdinal(d3.schemePastel1)
            .domain(vis.countries)

        // colour circle by country
        circles.attr("fill", (d) => vis.circleColour(d.Country));

        if (vis.countries.length <= 5) {
            vis.addColorLegend();
        }


        // replaceText
        let replaceText = function(d) {
            let newText;
            switch (d.Award) {
                case '1 Star MICHELIN':
                    newText = "1 Star MICHELIN: High-quality cooking, worth a stop";
                    break;
                case '2 Stars MICHELIN':
                    newText = "2 Stars MICHELIN: Excellent cooking, worth a detour";
                    break;
                case '3 Stars MICHELIN':
                    newText = "3 Stars MICHELIN: Exceptional cuisine, worth a special journey";
                    break;
                case 'Bib Gourmand':
                    newText = "Bib Gourmand: Exceptionally good food at moderate prices";
                    break;
                case 'MICHELIN Green Star':
                    newText = "MICHELIN Green Star: Culinary excellence with outstanding eco-friendly commitments"
            }

            vis.michelinInfo.text(newText);
        }

    }

    addColorLegend(){
        let vis = this;

        vis.legend.selectAll('.legendCircle').remove();

        vis.countries.forEach(
            function(d, i){
                let color = vis.circleColour(d)

                // add colors to legend
                vis.legend.append("circle")
                    .attr("class", "legendCircle")
                    .attr("cx", 15)
                    .attr("cy", 130+ i*(20))
                    .attr("r", 8)
                    .attr("fill", color)
                    .attr("stroke-width", 0.5);

                // add label to color
                vis.legend.append("text")
                    .attr("x", 28)
                    .attr("y", 135+ i*(20))
                    .attr("fill", 'black')
                    .attr("stroke-width", 0)
                    .text(d)
                    .style("font-family", "Montserrat, san serif");
            }
        )


    }

    ratingSwitcher(rating){
        let newTitle;
        switch (rating) {
            case '1 Star MICHELIN':
                newTitle = "one";
                break;
            case '2 Stars MICHELIN':
                newTitle = "two";
                break;
            case '3 Stars MICHELIN':
                newTitle = "three";
                break;
            case 'Bib Gourmand':
                newTitle = "bib";
                break;
            case 'MICHELIN Green Star':
                newTitle = "green"
        }

        return newTitle;
    }

    addTitle(){
        let vis = this;

        // set title for separate bubbles clusters

        vis.groupXCoord = Array.from(d3.group(vis.displayData, (d) => d.Award), ([key, value]) => {
            return {
                category: key,
                meanValue: d3.mean(value, d => d.x)
            };
        });

        vis.groupYCoord = Array.from(d3.group(vis.displayData, (d) => d.Award), ([key, value]) => {
            return {
                category: key,
                meanValue: d3.mean(value, d => d.y),
                maxValue: d3.max(value, d => d.y)
            };
        });


        vis.svg.selectAll('text').remove();
        var index = 0;

        let availableAwards = new Set(vis.groupXCoord.map(d => d.category));
        availableAwards = Array.from(availableAwards)


        for (let rating of availableAwards) {
            let xcoord = vis.groupXCoord.find((d) => d.category === rating).meanValue;
            let ycoord = vis.groupYCoord.find((d) => d.category === rating).meanValue;

            let switched = vis.ratingSwitcher(rating)
            let newTitle = vis.stars[switched].title

            vis.svg.append("text")
                .attr("x", xcoord)
                .attr("y", ycoord)
                .attr("text-anchor", "middle")
                .style("font-family", "Super Foods, sans-serif")
                .attr("fill", '#A0071B')
                .attr('stroke', 'white')
                .attr('stroke-width', 2)
                .style("font-size", "35px")
                .attr("class", "bubbleTitle" + switched)
                .text(newTitle)

            index++;
        }
    }

    moveTitle(rating){
        let vis = this;

        // get new rating name
        let switched = vis.ratingSwitcher(rating);

        // set title for separate bubbles clusters
        vis.svg.select(".bubbleTitle" + switched).remove();

        let xcoord = vis.groupXCoord.find((d) => d.category === rating).meanValue;
        let ycoord = vis.groupYCoord.find((d) => d.category === rating).maxValue;

        console.log("MOVE TITLE")
        console.log(ycoord)

        vis.svg.append("text")
                .attr("x", xcoord)
                .attr("y", ycoord + 50)
                .attr("text-anchor", "middle")
                .style("font-family", "Super Foods, sans-serif")
                .attr("fill", '#A0071B')
                .attr('stroke', 'white')
                .attr('stroke-width', 2)
                .style("font-size", "35px")
                .attr("class", "bubbleTitle" + switched)
                .text(rating)


        }
}

