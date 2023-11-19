console.log("let's get started!")
// initiate global variables
let michelinCountry = new Set()

// load data with promises
// let promises = [
//     d3.csv("data/Travel_data.csv", (row) => {
//         row.Year = parseInt(row.Year);
//         row.avgLengthStay =+ row.avgLengthStay
//         return row
//     }),
//     d3.csv("data/michelin.csv")
// ];
// Promise.all(promises)
//     .then(function (data) {
//         initMainPage(data)
//     })
//     .catch(function (err) {
//         console.log(err)
//     });

// // initMainPage
// function initMainPage(dataArray) {
//     console.log(dataArray[0]);
//     console.log(dataArray[1])
//     dataArray[1].forEach((d) => {
//       michelinCountry.add(d.Country)
//     })
//     console.log(dataArray[0].map((d) => {return d.avgLengthStay}))
// }
// console.log("meow", michelinCountry)



// main.js
let geoDataURL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json"; // GeoJSON data URL
let tourismDataURL = "data/tourism_worldbank1.csv"; // Replace with the actual path to your CSV file


let mapVis, lineVis;

Promise.all([
    d3.json(geoDataURL),
    d3.csv(tourismDataURL)
]).then(([geoData, tourismData]) => {


    // Initialize the map visualization
    mapVis = new MapVis("map-container", tourismData, geoData);

    let france = tourismData.filter(d => d['Country Name'] === "France");

    // Prepare data for LineVis
    let lineData = france.map(d => ({
        year: +d['Year'],
        arrivals: +d['Number of Arrivals']
    }));

    // Initialize LineVis with empty data
    lineVis = new LineVis("line-chart", lineData);
});
