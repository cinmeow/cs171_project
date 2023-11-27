class SpiderVis {

    constructor(parentElement, travelData, tourismData){
        this.parentElement = parentElement;
        this.travelData = travelData;
        this.tourismData = tourismData;

        this.selection = new Set()
        this.features = ["arrivals", "accommodations", "expenditures", "business", "personal"];

        this.initVis()
    }
    initVis(){
        let vis = this;

        vis.margin = {top: 40, right: 40, bottom: 40, left: 60};

        // TODO: #9 - Change hardcoded width to reference the width of the parent element
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select(`#${vis.parentElement}`)
            .append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height);

        vis.radialScale = d3.scaleLinear()
            .domain([0, 5])
            .range([0, vis.width-350])

        vis.ticks = [1, 2, 3, 4, 5];

        vis.svg.selectAll("circle")
            .data(vis.ticks)
            .join(
                enter => enter.append("circle")
                    .attr("cx", vis.width / 2)
                    .attr("cy", vis.height / 2)
                    .attr("fill", "none")
                    .attr("stroke", "gray")
                    .attr("r", d => vis.radialScale(d))
            );

        vis.svg.selectAll(".ticklabel")
            .data(vis.ticks)
            .join(
                enter => enter.append("text")
                    .attr("class", "ticklabel")
                    .attr("x", vis.width / 2 + 5)
                    .attr("y", d => vis.height / 2 - vis.radialScale(d)-5)
                    .attr("font-size", "10px")
                    .text(d => d.toString())
            );

        function angleToCoordinate(angle, value){
            let x = Math.cos(angle) * vis.radialScale(value);
            let y = Math.sin(angle) * vis.radialScale(value);
            return {"x": vis.width / 2 + x, "y": vis.height / 2 - y};
        }

        vis.featureData = vis.features.map((f, i) => {
            let angle = (Math.PI / 2) + (2 * Math.PI * i / vis.features.length);
            return {
                "name": f,
                "angle": angle,
                "line_coord": angleToCoordinate(angle, 5.5),
                "label_coord": angleToCoordinate(angle, 6)
            };
        });

        // draw axis line
        vis.svg.selectAll("line")
            .data(vis.featureData)
            .join(
                enter => enter.append("line")
                    .attr("x1", vis.width / 2)
                    .attr("y1", vis.height / 2)
                    .attr("x2", d => d.line_coord.x)
                    .attr("y2", d => d.line_coord.y)
                    .attr("stroke","black")
            );

        // draw axis label
        vis.svg.selectAll(".axislabel")
            .data(vis.featureData)
            .join(
                enter => enter.append("text")
                    .attr("x", d => d.label_coord.x-10)
                    .attr("y", d => d.label_coord.y)
                    .attr("font-size", "12px")
                    .text(d => d.name)
            );

        vis.wrangleData()
    }

    wrangleData(){
        let vis = this;
        console.log("passing vis.selection in wrangle data", vis.selection)

        vis.updateData()
    }

    updateData(){
        let vis = this;


    }

    selectedCountries(selection){
        let vis = this;

        // attach selection to a this. variable so that it can be accessed throughout the class construction
        vis.selection = new Set(selection);

        // call wrangle data to pass the data on
        vis.wrangleData()
    }
}

