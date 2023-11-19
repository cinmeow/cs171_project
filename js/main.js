console.log("let's get started!")
// initiate global variables
let michelinCountry = new Set()

// load data with promises
let promises = [
    d3.csv("data/Travel_data.csv", (row) => {
        row.Year = parseInt(row.Year);
        row.avgLengthStay =+ row.avgLengthStay
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
    console.log(dataArray[0]);
    console.log(dataArray[1])
    dataArray[1].forEach((d) => {
      michelinCountry.add(d.Country)
    })
    console.log(dataArray[0].map((d) => {return d.avgLengthStay}))
}
console.log("meow", michelinCountry)