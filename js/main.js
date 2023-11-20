console.log("let's get started!")
let geoDataURL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json"; // GeoJSON data URL
let tourismDataURL = "data/tourism_worldbank1.csv"; // Replace with the actual path to your CSV file
// initiate global variables
let michelinCountry = new Set()
let mapVis, lineVis, selectVis;


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
    d3.csv("data/michelin.csv", (row) => {
        row.Price =+ row.Prince;
        return row
    }),
    d3.json(geoDataURL),
    d3.csv(tourismDataURL)
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
    // check if all data carried over
    console.log("travel data", dataArray[0]);
    console.log("michelin data", dataArray[1]);
    console.log("geo data", dataArray[2]);
    console.log("tourism data", dataArray[3]);

    // create Set with all unique names from Michelin Guide
    dataArray[1].forEach((d) => {
      michelinCountry.add(d.Country)
    })

    // initialize visualizations
    // MAP VISUALIZATION
    mapVis = new MapVis("map-container", dataArray[3], dataArray[2]);

    let france = dataArray[3].filter(d => d['Country Name'] === "France");

    // LINE GRAPH 1 VISUALIZATION
    // Prepare data for LineVis
    let lineData = france.map(d => ({
        year: +d['Year'],
        arrivals: +d['Number of Arrivals']
    }));

    // Initialize LineVis with empty data
    lineVis = new LineVis("line-chart", lineData);
    selectVis = new SelectVis("#flag-container", countries);


    // TRAVEL PURPOSE + MICHELIN GUIDE VISUALIZATION
    // filter out data with Michelin countries
    let michelinTravelData = dataArray[0].filter((d) => michelinCountry.has(d.Country));
    console.log("michelin travel data", michelinTravelData)
    // initialize travel purpose visualization
    travelPurpose = new TravelPurposeVis("tourism_vis_1", michelinTravelData, dataArray[1])
}

function handleSelectedCountries(selectedCountries) {
    console.log("Selected Countries:", selectedCountries);
    // Additional handling for selected countries
}
console.log("meow", michelinCountry)
