const numPeople = 500;
const restaurantWidth = document.getElementById("french-restaurant").getBoundingClientRect().width;
const restaurantHeight = 450;
const doorPosition = { x: restaurantWidth/2.75, y: restaurantHeight/2.25 };
let counter = 0

// Create the SVG container using D3
const svg = d3.select("#french-restaurant")
    .append("svg")
    .attr("width", restaurantWidth)
    .attr("height", restaurantHeight);

svg.append("image")
    .attr("xlink:href", "img/French-rest.png") // Replace with the actual path or URL
    .attr("width", restaurantWidth)
    .attr("height", restaurantHeight)
    .attr("x", 0)
    .attr("y", 0);

// Function to add a person to the SVG
function addPerson() {
    return svg.append("image")
        .attr("class", "person")
        .attr("xlink:href", "img/walking_france.png")
        .attr("width", restaurantWidth)
        .attr("height", restaurantHeight)
        .attr("x", restaurantWidth) // Initial x position outside the restaurant
        .attr("y", restaurantHeight) // Initial y position (center of the restaurant)
        .attr("opacity", 1);
}

// Function to animate a person walking to the door and disappearing
// Function to animate a person walking to the door and disappearing
function animatePerson(person) {
    person.transition()
        .duration(10000)
        .attr("x", doorPosition.x)
        .attr("y", doorPosition.y)
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
function animatePeople() {
    for (let i = 0; i < numPeople; i++) {
        const person = addPerson();
        // Stagger the start times using setTimeout
        setTimeout(() => animatePerson(person), i * 1000);
    }
}

// Call the animatePeople function
animatePeople();

// Call the animatePeople function at regular intervals to create a continuous loop
setInterval(animatePeople, 83000); // 11000 milliseconds (10s for animation + 1s delay before starting the next animation)

// Function to update the counter
function updateCounter() {
    if(counter < 689){
        counter++;
        d3.select("#counter-boxFrance").text(counter);
    }
}

// Update the counter every second (adjust the interval as needed)
setTimeout(function () {
    setInterval(updateCounter, 50);
}, 9000);