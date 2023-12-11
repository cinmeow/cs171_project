console.log("let's get started!")
let geoDataURL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json"; // GeoJSON data URL
let tourismDataURL = "data/tourism_worldbank1.csv"; // Replace with the actual path to your CSV file
let tourismDataURL2 = "data/tourism_worldbank2.csv";
let arrivalRegionData = "data/arrivalByRegions2.csv";
// initiate global variables
let michelinCountry = new Set()
let spiderSelect = new Set();
let countryColorArray = []
let restVis;
let mapVis, lineVis, lineVis2, selectVis, barchart, barchart2, bubbleChart, treemapVis, areachart1, areachart2, radialBarChart;
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
    anchors: ['landing', 'backgroundInfo', 'intro', 'michelin_guide', 'global', 'presel', 'select_countries', 'treemap', 'bubble', 'call2action', 'credits', 'source'],

    // Navigation
    menu: '#menu',
    navigation: true,
    navigationPosition: 'right',
    navigationTooltips: ['Welcome', 'Background', 'Intro', 'Michelin Guide', 'Global', 'Pre', 'Select', 'TreeMap', 'Cuisine', 'Action', 'Credits', 'Sources'],
    showActiveTooltip: false,
    slidesNavigation: false,
    slidesNavPosition: 'bottom',

    // other settings
    touchSensitivity: 205,
    scrollOverflow: true,
    scrollingSpeed: 1500,
    easing: 'easeInOutCubic'

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
    d3.csv(tourismDataURL),
    d3.csv(arrivalRegionData),
    d3.csv(tourismDataURL2)
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
    // console.log("travel data", dataArray[0]);
    // console.log("michelin data", dataArray[1]);
    // console.log("geo data", dataArray[2]);
    // console.log("tourism data", dataArray[3]);

    // create Set with all unique names from Michelin Guide
    dataArray[1].forEach((d) => {
      michelinCountry.add(d.Country)
    })

    // initialize visualizations

    // MAP VISUALIZATION
    mapVis = new MapVis("globe", dataArray[3],dataArray[1], dataArray[0], dataArray[2]);

    let global = dataArray[5].filter(d => d['Country Name'] === "Global");

    // LINE GRAPH 1 VISUALIZATION
    // Prepare data for LineVis
    let lineData1 = global.map(d => ({
        year: +d['Year'],
        arrivals: +d['Number of Arrivals']
    }));

    let lineData2 = global.map(d => ({
        year: +d['Year'],
        expenditures: +d['Expenditures (current US$)']
    }));


    // Initialize LineVis with empty data
    lineVis = new LineVis("chart1", lineData1, 'arrivals');
    lineVis2 = new LineVis("chart1", lineData2, 'expenditures');
    selectVis = new SelectVis("#flag-container", countries);

    // filter out data with Michelin countries
    let michelinTravelData = dataArray[0].filter((d) => michelinCountry.has(d.Country));

    d3.select("#data-selection").on("change", function(event) {
        // Get the current value of the dropdown
        let selectedValue = d3.select(this).property("value");

        // Clear the contents of the chart1 div
        d3.select("#chart1").html("");
        d3.select("#chart2").html("");

        // Update the map visualization
        mapVis.updateColorScale(selectedValue);
        mapVis.unselect();

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
            areachart1 = new AreaChart('chart1', dataArray[0], "bed");
            areachart2 = new AreaChart("chart2",  dataArray[0], "lengthOfStay");

        }
    });

    // Initialize spider chart
    spiderChart = new SpiderVis("spider-chart", dataArray[0], dataArray[1], dataArray[3])

    // Initialize bubble chart
    bubbleChart = new BubbleChart("michelin_bubble", dataArray[1]);

    // Initialize tree map
    radialBarChart = new RadialBarChart("radialVis", dataArray[4]);
    treemapVis = new Treemap("treemap_container", dataArray[4], radialBarChart);


    // create colors per michelin country (coded)
    countryColorAssignment(michelinCountry);

}


// This is for the selection panel (select 5)
var globalSelected;
function handleSelectedCountries(selectedCountries) {
    console.log("Selected Countries:", selectedCountries);
    globalSelected = selectedCountries;

    // Additional handling for selected countries
    bubbleChart.createSelector();
    populateDropdown(selectedCountries);
}

// Connect selectVis to spider chart
function addTo_spiderSelect(selectedCountry){
    // if country already in set, then remove, if country not in set then add
    if(spiderSelect.has(selectedCountry)){
        spiderSelect.delete(selectedCountry);
    }else{
        spiderSelect.add(selectedCountry);
    }
    spiderChart.selectedCountries(spiderSelect);
}

// function to assign color to each country directly
function countryColorAssignment(michelin_data){
    // variables
    const numColors = michelin_data.size
    const michelinCountryName = Array.from(michelin_data).sort()

    // Generate random colors
    for (let i = 0; i < numColors; i++) {
        const color = "#" + Math.floor(Math.random() * 16777215).toString(16);
        const country = michelinCountryName[i];
        countryColorArray.push({[country]: color});
    }
}

// function populateDropdown(selectedCountries) {
//     let dropdown = d3.select("#country-dropdown");
//
//     // Clear existing options
//     dropdown.selectAll("option").remove();
//
//     // Add a default option (optional)
//     dropdown.append("option")
//         .text("Select a country")
//         .attr("value", "");
//
//
//
//     // Append new options for each country
//     selectedCountries.forEach(country => {
//         dropdown.append("option")
//             .text(country)
//             .attr("value", country);
//     });
//
//     // Event listener for dropdown change
//     dropdown.on("change", function() {
//         let selectedCountry = d3.select(this).property("value");
//         if (selectedCountry) {
//             treemapVis.update(selectedCountry);
//         }
//     });
// }

function populateDropdown(selectedCountries) {
    let dropdown = d3.select("#country-dropdown");

    dropdown.selectAll("option").remove();

    dropdown.append("option")
        .text("Select a country")
        .attr("value", "");

    selectedCountries.forEach(country => {
        dropdown.append("option")
            .text(country)
            .attr("value", country);
    });

    dropdown.on("change", function() {
        let selectedCountry = d3.select(this).property("value");
        if (selectedCountry) {
            treemapVis.update(selectedCountry);
        }
    });
}



