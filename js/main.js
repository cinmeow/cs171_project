console.log("let's get started!")
// initiate global variables


// load data with promises
let promises = [
    d3.csv("data/Travel_data.csv", (row) => {
        console.log(row)
        row.Year = parseInt(row.Year);
        return row
    })
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
    console.log(dataArray)
}