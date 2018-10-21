// do to:
// add unhappy case
// 

const apiKeyNYT = '2e6221e2ef1149908f06408d501922f0';

function generateSpotifyHTML(chartData) {
    let htmlString = '';
    chartData.forEach(track => {
        htmlString += `<article><div class="description"><h3>${track.Name}</h3><h4>By ${track.Artist}</h4></div><a class="read-more" href="${track.URL}" target="_blank">Play on Spotify →</a></article>`
    });
    return htmlString;    
}

function renderSpotify(chartData){
    let spotifyResults = $('div.spotify.results')
    spotifyResults.empty();
    if (chartData == undefined){
        spotifyResults.append(`<article><div class="description"><h3>Data Not Yet Compiled</h3><p>Try again later!</p></div></article>`);
    } else {
        spotifyResults.append(generateSpotifyHTML(chartData));
    }
}

// convert spotify viral chart CSV to JS Object for easier data manipulation
function convertCsvToObj(csv) {
    console.log(csv);
    // split raw text into array based on new lines
    let lines = csv.split('\n');
    console.log(lines[0]);
    // handle unhappy case if API call doesn't return a csv
    if (lines[0] == "<!doctype html>") return undefined;
    // create empty array for chart data
    let chart = [];
    // extract header values for keys in chart objects
    let header = lines.shift().split(',');
    // select number of tracks to return    
    let chartSize = 7;
    // extract top viral songs for the day
    for (let i = 0; i < chartSize; i++){
        //create new object for individual track
        let trackObj = {}
        let trackInfo = lines[i].split(',');
        for (let i = 0; i < header.length; i++) {
            trackInfo[i] = trackInfo[i].replace(/['"]+/g, '');
            if (i == 1){
                trackObj['Name'] = trackInfo[i];
            } else {
                trackObj[`${header[i]}`] = trackInfo[i];
            }
        }
        chart.push(trackObj);
    }
    return(chart);
}

function callSpotifyChart(date) {
    date = encodeURI(date);
    fetch('https://allorigins.me/get?method=raw&url=' + encodeURIComponent(`https://spotifycharts.com/viral/global/daily/${date}/download`) + '&callback=?')
    .then(response => {
        if (response.ok) {
            return response.text();
        }
    })
    .then(responseText => convertCsvToObj(responseText))
    .then(chart => renderSpotify(chart));
}

function generateNYTimesHTML(responseJson) {
    let articles = responseJson.articles;
    let htmlString = '';
    articles.forEach(article => {
        htmlString += 
        `<article><div class="description"><h3>${article.title}</h3><h4>By ${article.author}</h4><p>${article.description}</p></div><a class="read-more" href="${article.url}" target="_blank">Read More →</a></p></article>`
    });
    return htmlString;
}

function renderNYTimes(responseJson){
    let NYTimesResults = $('div.NYTimes.results')
    NYTimesResults.empty()
    NYTimesResults.append(generateNYTimesHTML(responseJson));
}

function callNYTimes(date){
    date = encodeURI(date);
    fetch(`https://newsapi.org/v2/everything?domains=nytimes.com&apiKey=${apiKeyNYT}&sortBy=popularity&from=${date}&to=${date}&pageSize=5`)
    .then(response => {
        if(response.ok) {
            return response.json();
        }
        throw new Error (error.message);
    })
    .then(responseJson => renderNYTimes(responseJson));
}
function generateRedditHTML(responseJson) {
    let response = responseJson.data;
    let htmlString = '';
    response.forEach(article => {
        htmlString += 
        `<article><div class="description"><h3>${article.title}</h3><h4><a href="https://www.reddit.com/r/${article.subreddit}">r/${article.subreddit}</a></h4></div><a class="read-more" href="${article.full_link}" target="_blank">Read More →</a></article>`
    })
    return htmlString;
}

function renderReddit(responseJson){
    let redditResults = $('div.reddit.results');
    redditResults.empty();
    redditResults.append(generateRedditHTML(responseJson));
    
}

function callReddit(startDate, endDate){
    let size = 7; 
    fetch(`https://api.pushshift.io/reddit/submission/search/?sort=desc&sort_type=num_comments&size=${size}&after=${startDate}&before=${endDate}`)
    .then(response => {
        if (response.ok) {
            return response.json();
        }
    })
    .then(responseJson => renderReddit(responseJson));
}

function handleDate() {
    let selectedDate = $('input[type="date"]').val();
    let epochDate = new Date(selectedDate);
    let epochDateStart = epochDate.getTime();
    let epochDateEnd = new Date(epochDateStart + 86400000);
    //divide time by 1000 to get epoch date in seconds
    epochDateEnd = epochDateEnd.getTime() / 1000;
    epochDateStart = epochDateStart /1000;
    return [selectedDate, epochDateStart, epochDateEnd];
}

function callAPI(date){
    callNYTimes(date[0]);
    callReddit(date[1], date[2]);
    callSpotifyChart(date[0]);
}

function handleSubmit() {
    $('form').submit(event => {
        event.preventDefault();
        let date = handleDate();
        callAPI(date);
    }) 
}   

function normalizeDate(dateUnit) {
    if (dateUnit < 10) {
        dateUnit = "0" + dateUnit;
    }
    return dateUnit;
}

function setDate(){
    let date = new Date();
    let d = date.getDate() - 1;
    let m = date.getMonth() + 1;
    let yyyy = date.getFullYear();
    let dd = normalizeDate(d);
    let mm = normalizeDate(m);
    let yesterday = `${yyyy}-${mm}-${dd}`;
    // previous month
    let lastMonth = normalizeDate(m -1);
    let minDate = `${yyyy}-${lastMonth}-${dd}`;
    $('#js-date').attr("value", yesterday);
    $('#js-date').attr("max", yesterday);
    $('#js-date').attr("min", minDate);
}

function readyForm() {
    setDate();
    handleSubmit();
}

$(readyForm);

// pain points log:
// finding undefined in  HTMLString, done in by initializing an empty variable instead of a variable assigned to an empty string
// determining epoch time for use in pushShift API
// finding some way around the CORS restriction for pulling Spotify Chart Data from third party site
// convert CSV into a JavaScript readable object