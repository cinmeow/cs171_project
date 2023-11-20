class TravelPurposeVis {

    constructor(parentElement, travelData, michelinData){
        this.parentElement = parentElement;
        this.travelData = travelData;
        this.michelinData = michelinData;
        this.filteredData = [];

        console.log("Constructor: travel data", this.travelData);
        console.log("Constructor: michelin data", this.michelinData);

        this.initVis()
    }

    initVis(){
        let vis = this;
        console.log("INIT VIS")

        vis.wrangleData();
    }

    wrangleData(){
        let vis = this;
        // LATER: filter for selected countries but for now, will use a curated set of countries/year (2019)
        let countryFilter = new Set(["USA", "France", "Italy", "Taiwan", "Thailand"]);
        let travelDataFilter = vis.travelData.filter((d) => {
            let cond1 = countryFilter.has(d.Country);
            let cond2 = d.Year === 2019;
            return cond1 && cond2
        });
        console.log("travel data filter", travelDataFilter)

        // combine travel and michelin datasets
        let averagePrice = Array.from(d3.rollup(
            vis.michelinData,
            (leaves) => d3.mean(leaves, (d) => d.Price),
            (d) => d.Country
        ));
        console.log(averagePrice)
        vis.updateVis()
    }

    updateVis(){
        let vis = this;

    }



}