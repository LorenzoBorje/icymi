// do to:
// add unhappy case
// hook up date handler

const apiKeyNYT = '2e6221e2ef1149908f06408d501922f0';

function generateSpotifyHTML(chartData) {
    console.log(chartData);
    let htmlString = '';
    chartData.forEach(track => {
        htmlString += `<h3>${track.Name}</h3><h4>${track.Artist}</h4><a href="${track.URL}">Play on Spotify</a>`
    });
    return htmlString;    
}

function renderSpotify(chartData){
    let spotifyResults = $('.spotify .results')
    spotifyResults.empty();
    spotifyResults.append(generateSpotifyHTML(chartData));
}

// convert spotify viral chart CSV to JS Object for easier data manipulation
function convertCsvToObj(csv) {
    // split raw text into array based on new lines
    let lines = csv.split('\n');
    // create empty array for chart data
    let chart = [];
    // extract header values for keys in chart objects
    let header = lines.shift().split(',');
    // extract top five viral songs for the day
    for (let i = 0; i < 5; i++){
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
    let chartData;
    date = encodeURI(date)
    console.log(date);
    $.get('https://allorigins.me/get?method=raw&url=' + encodeURIComponent(`https://spotifycharts.com/viral/global/daily/${date}/download`) + '&callback=?', data => {
    chartData = convertCsvToObj(data);
    renderSpotify(chartData);
    });
}

function generateNYTimesHTML(responseJson) {
    let articles = responseJson.articles;
    let htmlString = '';
    articles.forEach(article => {
        htmlString += `<h3>${article.title}</h3><h4>By ${article.author}</h4><p>${article.description}</p><a href="${article.url}">Read More</a></p>`
    });
    return htmlString;
}

function renderNYTimes(responseJson){
    let NYTimesResults = $('.NYTimes .results')
    NYTimesResults.empty()
    NYTimesResults.append(generateNYTimesHTML(responseJson));
}

function callNYTimes(date){
    date = encodeURI(date);
    console.log(date);
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
    console.log('generating')
    let response = responseJson.data;
    let htmlString = '';
    response.forEach(article => {
        htmlString += `<h3>${article.title}</h3><h4>${article.subreddit}</h4><a href="${article.full_link}">Read More</a>`
    })
    return htmlString;
}

function renderReddit(responseJson){
    let redditResults = $('.reddit .results');
    redditResults.empty();
    redditResults.append(generateRedditHTML(responseJson));
    
}

function callReddit(startDate, endDate){
    fetch(`https://api.pushshift.io/reddit/submission/search/?sort=desc&sort_type=num_comments&size=5&after=${startDate}&before=${endDate}`)
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

$(handleSubmit);

// pain points log:
// finding undefined in  HTMLString, done in by initializing an empty variable instead of a variable assigned to an empty string
// determining epoch time for use in pushShift API
// finding some way around the CORS restriction for pulling Spotify Chart Data from third party site
// convert CSV into a JavaScript readable object