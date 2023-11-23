console.log("let's get started!")
let geoDataURL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json"; // GeoJSON data URL
let tourismDataURL = "data/tourism_worldbank1.csv"; // Replace with the actual path to your CSV file
// initiate global variables
let michelinCountry = new Set()
let mapVis, lineVis, selectVis;


// set up fullpage scrolling
new fullpage('#fullpage', {
    // license key
    licenseKey: 'gplv3-license',

    // fullpage setup
    autoScrolling:true,
    scrollHorizontally: true,
    fitToSection: true,

    // dot nav on right
    anchors: ['landing', 'intro', 'michelin_guide', 'global', 'select_countries', 'purpose', 'bubble', 'credits'],

    // Navigation
    menu: '#menu',
    navigation: true,
    navigationPosition: 'right',
    navigationTooltips: ['Welcome', 'Intro', 'Michelin Guide', 'Global', 'Select', 'Purpose', 'Cuisine', 'Credits'],
    showActiveTooltip: false,
    slidesNavigation: false,
    slidesNavPosition: 'bottom',

});


// load data with promises
let promises = [
    d3.csv("data/Travel_data2.csv", (row) => {
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
    d3.csv("data/michelin2.csv", (row) => {
        row.Price =+ row.Price;
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
    mapVis = new MapVis("globe", dataArray[3],dataArray[1], dataArray[2]);

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


    // // Initialize BarChart
    barChart = new BarChart("bar-chart", dataArray[1]);

    // TRAVEL PURPOSE + MICHELIN GUIDE VISUALIZATION
    travelPurpose = new TravelPurposeVis("purpose-vis", dataArray[0], dataArray[1]);

    // filter out data with Michelin countries
    console.log("michelin unique names", michelinCountry);
    let michelinTravelData = dataArray[0].filter((d) => michelinCountry.has(d.Country));
    console.log("michelin travel data", michelinTravelData);

    d3.select("#data-selection").on("change", function(event) {
        // Get the current value of the dropdown
        let selectedValue = d3.select(this).property("value");

        // Update the map visualization
        mapVis.updateColorScale(selectedValue);

        // // Update the chart based on the selection
        // if (selectedValue === "arrivals") {
        //     // Show line chart and hide bar chart
        //     lineVis.setData(/* appropriate data for lineVis */);
        //     d3.select("#line-chart").style("display", "block");
        //     d3.select("#bar-chart").style("display", "none");
        // } else if (selectedValue === "michelin") {
        //     // Show bar chart and hide line chart
        //     barChart.setData(/* appropriate data for barChart */);
        //     d3.select("#bar-chart").style("display", "block");
        //     d3.select("#line-chart").style("display", "none");
        // }
    });
}



function handleSelectedCountries(selectedCountries) {
    console.log("Selected Countries:", selectedCountries);
    // Additional handling for selected countries
}
console.log("meow", michelinCountry)


