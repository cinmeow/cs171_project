const numPeopleEstonia = 50;
const restaurantWidthEstonia = 1000 // document.getElementById("estonia-restaurant").getBoundingClientRect().width;
const restaurantHeightEstonia = 400;
const doorPositionEstonia = { x: restaurantWidthEstonia/3, y: restaurantHeightEstonia/2.25 };
console.log(restaurantWidthEstonia)
let counterEstonia = 0
// Create the SVG container using D3
const svgEstonia = d3.select("#estonia-restaurant")
    .append("svg")
    .attr("width", restaurantWidthEstonia)
    .attr("height", restaurantHeightEstonia);

svgEstonia.append("image")
    .attr("xlink:href", "img/Est-rest.png") // Replace with the actual path or URL
    .attr("width", restaurantWidthEstonia)
    .attr("height", restaurantHeightEstonia)
    .attr("x", "-15vh")
    .attr("y", 0);

// Function to add a person to the SVG
function addPerson_Estonia() {
    return svgEstonia.append("image")
        .attr("class", "personEstonia")
        .attr("xlink:href", "img/walking_estonia.png")
        .attr("width", restaurantWidthEstonia)
        .attr("height", restaurantHeightEstonia)
        .attr("x", 0) // Initial x position outside the restaurant
        .attr("y", restaurantHeightEstonia) // Initial y position (center of the restaurant)
        .attr("opacity", 1);
}

// Function to animate a person walking to the door and disappearing
function animatePersonEstonia(person) {
    person.transition()
        .duration(10000)
        .attr("x", doorPositionEstonia.x)
        .attr("y", doorPositionEstonia.y)
        .on("start", function () {
            // Set the starting opacity to 1 (fully opaque)
            d3.select(this).attr("opacity", 1);
        })
        .on("end", function () {
            // Fade out the person
            d3.select(this).transition().duration(300).attr("opacity", 0);

            // Remove the person from the DOM after the animation ends
            d3.select(this).transition().delay(500).remove();
        });
}


// Function to start animations for multiple people with staggered start times
function animatePeopleEstonia() {
    for (let i = 0; i < numPeopleEstonia; i++) {
        const person = addPerson_Estonia();
        // Stagger the start times using setTimeout
        setTimeout(() => animatePersonEstonia(person), i * 5000);
    }
}

// Call the animatePeople function
animatePeopleEstonia();

// Call the animatePeople function at regular intervals to create a continuous loop
setInterval(animatePeopleEstonia, 55000); // 11000 milliseconds (10s for animation + 1s delay before starting the next animation)

// Function to update the counter
function updateCounterEstonia() {
    if(counterEstonia < 51){
        counterEstonia++;
        d3.select("#counter-boxEstonia").text(`⭐ Number of Ratings: ${counterEstonia}`);
    }
}

// Update the counter every second (adjust the interval as needed)
setTimeout(function () {
    setInterval(updateCounterEstonia, 200);
}, 9000);