/* * * * * * * * * * * * * *
*      class BarVis        *
* * * * * * * * * * * * * */


class TravelPurposeVis {

    constructor(parentElement, travelData, michelinData){
        this.parentElement = parentElement;
        this.travelData = travelData;
        this.michelinData = michelinData;
        this.filteredtravelDataset = [];

        console.log("Constructor: travel data", this.travelData);
        console.log("Constructor: michelin data", this.michelinData); 

        this.initVis()
    }

    initVis(){
        let vis = this;

        vis.wrangleData();
    }

    wrangleData(){
        let vis = this;
        // LATER: filter for selected countries

        // combine travel and michelin datasets

        vis.updateVis()
    }

    updateVis(){
        let vis = this;

    }



}