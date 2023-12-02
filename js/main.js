console.log("let's get started!")
let geoDataURL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json"; // GeoJSON data URL
let tourismDataURL = "data/tourism_worldbank1.csv"; // Replace with the actual path to your CSV file
// initiate global variables
let michelinCountry = new Set()
let mapVis, lineVis, lineVis2, selectVis, barchart, barchart2, travelPurpose, bubbleChart;
let parseYear = d3.timeParse("%Y");

// set up fullpage scrolling
new fullpage('#fullpage', {
    // license key
    licenseKey: 'gplv3-license',

    // fullpage setup
    autoScrolling:true,
    scrollHorizontally: true,
    fitToSection: true,
    parallax: true,

    // dot nav on right
    anchors: ['landing', 'intro', 'michelin_guide', 'global', 'select_countries', 'treemap', 'bubble', 'call2action', 'credits'],

    // Navigation
    menu: '#menu',
    navigation: true,
    navigationPosition: 'right',
    navigationTooltips: ['Welcome', 'Intro', 'Michelin Guide', 'Global', 'Select', 'Cuisine', 'Credits'],
    showActiveTooltip: false,
    slidesNavigation: false,
    slidesNavPosition: 'bottom',

    // other settings
    touchSensitivity: 205,
    scrollOverflow: true,
    scrollingSpeed: 1000,

});


// load data with promises
let promises = [
    d3.csv("data/Travel_data2.csv", (row) => {
        row.Year = parseYear(row.Year);
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
    mapVis = new MapVis("globe", dataArray[3],dataArray[1], dataArray[0], dataArray[2]);

    let france = dataArray[3].filter(d => d['Country Name'] === "France");

    // LINE GRAPH 1 VISUALIZATION
    // Prepare data for LineVis
    let lineData1 = france.map(d => ({
        year: +d['Year'],
        arrivals: +d['Number of Arrivals']
    }));

    let lineData2 = france.map(d => ({
        year: +d['Year'],
        expenditures: +d['Expenditures (current US$)']
    }));


    // Initialize LineVis with empty data
    lineVis = new LineVis("chart1", lineData1, 'arrivals');
    lineVis2 = new LineVis("chart1", lineData2, 'expenditures');
    selectVis = new SelectVis("#flag-container", countries);


    // TRAVEL PURPOSE + MICHELIN GUIDE VISUALIZATION
    // travelPurpose = new TravelPurposeVis("purpose-vis", dataArray[0], dataArray[1]);

    // filter out data with Michelin countries
    // console.log("michelin unique names", michelinCountry);
    let michelinTravelData = dataArray[0].filter((d) => michelinCountry.has(d.Country));
    // console.log("michelin travel data", michelinTravelData);

    d3.select("#data-selection").on("change", function(event) {
        // Get the current value of the dropdown
        let selectedValue = d3.select(this).property("value");

        // Clear the contents of the chart1 div
        d3.select("#chart1").html("");
        d3.select("#chart2").html("");

        // Update the map visualization
        mapVis.updateColorScale(selectedValue);

        // Update the chart based on the selection
        if (selectedValue === "arrivals") {
            // Create and display the line chart in chart1
            lineVis = new LineVis("chart1", lineData1, 'arrivals');
            lineVis2 = new LineVis("chart1", lineData2, 'expenditures');
        } else if (selectedValue === "michelin") {
            // Create and display the bar chart in chart1
            barchart = new BarChart("chart1", dataArray[1], "restaurants");
            barchart2 = new BarChart("chart2", dataArray[1], "cuisine");
        } else{
            // create area chart for accomodations data
            areachart = new AreaChart('chart1', dataArray[0])
        }
    });

    // Initialize spider chart
    spiderChart = new SpiderVis("spider-chart", dataArray[0], dataArray[3])

    // Initialize bubble chart
    bubbleChart = new BubbleChart("michelin_bubble", dataArray[1]);

}


// This is for the selection panel (select 5)
var globalSelected;
function handleSelectedCountries(selectedCountries) {
    console.log("Selected Countries:", selectedCountries);
    globalSelected = selectedCountries;

    // Additional handling for selected countries
    //circularVis.wrangleData()
    spiderChart.selectedCountries(selectedCountries);
    bubbleChart.createSelector();
}
console.log("meow", michelinCountry)


