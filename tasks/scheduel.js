console.log('<><><><><><><>run<><><><><><><>')
setInterval(() => console.log('<><><><><><><>scheduled<><><><><><><>'), 1860000)
setInterval(ticker, 60000)

var count = 0
function ticker() {
    console.log('<><><><><><><>'+ count++ +'<><><><><><><>')
}