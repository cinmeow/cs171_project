console.log("let's get started!")
// initiate global variables
let michelinCountry = new Set()
let myTravelPurpose
// load data with promises
let promises = [
    d3.csv("data/Travel_data.csv", (row) => {
        row.Year = parseInt(row.Year);
        row.avgLengthStay =+ row.avgLengthStay;
        row.businessPurpose =+ row.businessPurpose;
        row.numBedPlaces =+ row.numBedPlaces;
        row.numEstablishments =+ row.numEstablishments;
        row.numRooms =+ row.numRooms;
        row.occupancyBeds =+ row.occupancyBeds;
        row.occupancyRooms =+ row.occupancyRooms;
        row.personalPurpose =+ row.personalPurpose;
        row.totalArrivals =+ row.totalArrivals;
        return row
    }),
    d3.csv("data/michelin.csv")
];
Promise.all(promises)
    .then(function (data) {
        initMainPage(data)
    })
    .catch(function (err) {
        console.log(err)
    });

// initMainPage
function initMainPage(dataArray) {
    dataArray[1].forEach((d) => {
      michelinCountry.add(d.Country)
    })

    // filter travel dataset to only include countries in michelin guide.
    let travelDataset = dataArray[0].filter((d) => {
        // Check if the country property is in the set
        return michelinCountry.has(d.Country);
    });

    console.log("Initialize filtered travel Data", travelDataset);
    myTravelPurpose = new TravelPurposeVis('tourism_vis_1', travelDataset, dataArray[1])
}
console.log("meow", michelinCountry)