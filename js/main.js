console.log("let's get started!")
let geoDataURL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json"; // GeoJSON data URL
let tourismDataURL = "data/tourism_worldbank1.csv"; // Replace with the actual path to your CSV file
// initiate global variables
let michelinCountry = new Set()
let mapVis, lineVis;

// load data with promises
let promises = [
    d3.csv("data/Travel_data.csv", (row) => {
        row.Year = parseInt(row.Year);
        row.avgLengthStay =+ row.avgLengthStay
        return row
    }),
    d3.csv("data/michelin.csv"),
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
    console.log(dataArray[0]);
    console.log(dataArray[1]);
    console.log(dataArray[2]);
    console.log(dataArray[3]);

    // create Set with all unique names from Michelin Guide
    dataArray[1].forEach((d) => {
      michelinCountry.add(d.Country)
    })

    // check
    console.log(dataArray[0].map((d) => {return d.avgLengthStay}))

    // initialize visualizations
    mapVis = new MapVis("map-container", dataArray[3], dataArray[2]);

    let france = dataArray[3].filter(d => d['Country Name'] === "France");

    // Prepare data for LineVis
    let lineData = france.map(d => ({
        year: +d['Year'],
        arrivals: +d['Number of Arrivals']
    }));

    // Initialize LineVis with empty data
    lineVis = new LineVis("line-chart", lineData);
}
console.log("meow", michelinCountry)
