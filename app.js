// do to:
// add unhappy case
// hook up date handler

const apiKeyNYT = '2e6221e2ef1149908f06408d501922f0';

function generateNYTimesHTML(responseJson) {
    let article = responseJson.articles;
    let htmlString = '';
    article.forEach(article => {
        htmlString += `<h3>${article.title}</h3><h4>By ${article.author}</h4><p>${article.description}</p><a href="${article.url}">Read More</a></p>`
    });
    return htmlString;
}

function renderNYTimes(responseJson){
    $('.NYTimes').empty()
    $('.NYTimes').append(generateNYTimesHTML(responseJson));
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
    $('.reddit').empty();
    console.log(responseJson.data);
    $('.reddit').append(generateRedditHTML(responseJson));
    
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
// epoch time for 