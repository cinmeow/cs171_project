 const numPeople = 500;
 const restaurantWidth =  500;
 const restaurantHeight = 400;
 const doorPosition = { x: restaurantWidth/2, y: restaurantHeight/2.25 };
 let counter = 0

 // Create the SVG
 let svg = d3.select("#french-restaurant")
     .append("svg")
     .attr("width", restaurantWidth)
     .attr("height", restaurantHeight);

 // add image of restaurant in
svg.append("image")
     .attr("xlink:href", "img/French-rest.png")
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
         .attr("x", restaurantWidth)
         .attr("y", restaurantHeight)
         .attr("opacity", 1);
 }


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

            // Remove the person after person completes path
            d3.select(this).transition().delay(300).remove();
        });
}


// Function to start animations for multiple people with staggered start times
function animatePeople() {
    for (let i = 0; i < numPeople; i++) {
        const person = addPerson();
        // Stagger the start times using setTimeout
        setTimeout(() => animatePerson(person), i * 2000);
    }
}

// Call the animatePeople function
animatePeople();

// Call the animatePeople function at regular intervals to create a continuous loop
setInterval(animatePeople, 32000);

// Function to update the counter
function updateCounter() {
    if(counter < 689){
        counter++;
        d3.select("#counter-boxFrance").text(`⭐ Number of Ratings: ${counter}`);
    }
}

// Update the counter
setTimeout(function () {
    setInterval(updateCounter, 40);
}, 8000);