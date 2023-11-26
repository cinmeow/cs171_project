class AreaChart{
    constructor(parentElement, data){
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = [];

        console.log("areachart", data)

        this.initVis();
    }

    initVis(){
        let vis = this;

        vis.margin = {top: 40, right: 40, bottom: 40, left: 40};

        // TODO: #9 - Change hardcoded width to reference the width of the parent element
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;


        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


        // Scales and axes
        vis.x = d3.scaleTime()
            .range([0, vis.width]);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x)
            .ticks(6);

        vis.svg.append("g")
            .attr("class", "y-axis axis");

        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")");


        // Append a path for the area function, so that it is later behind the brush overlay
        vis.timePath = vis.svg.append("path")
            .attr("class", "area");

        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }

    wrangleData(){
        let vis = this;
        console.log("areachart wrangledata, filtered data", vis.data)

        vis.updateVis();
    }

    updateVis(){
        let vis = this;
    }

    setData(newData, countryName) {
        let vis = this;

        // Filter the data for the selected country
        vis.data = newData.filter(d => d.Country === countryName);

        // Update the display data
        vis.wrangleData();
    }
}


