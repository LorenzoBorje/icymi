// do to:
// add unhappy case
// hook up date handler


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
    fetch(`https://newsapi.org/v2/everything?domains=nytimes.com&apiKey=0b6c25a9ff884a048e469de267871ad1&sortBy=popularity&from=${date}&to=${date}&pageSize=5`)
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
    
    console.log(responseJson.data);
    $('.reddit').append(generateRedditHTML(responseJson));
    
}

function callReddit(startDate, endDate){
    console.log(startDate, endDate);
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
    console.log(selectedDate);
    let epochDate = new Date(selectedDate);
    console.log(epochDate);
    let epochDateStart = epochDate.getTime();
    let epochDateEnd = new Date(epochDateStart + 86400000);
    epochDateEnd = epochDateEnd.getTime();
    return [selectedDate, epochDateStart, epochDateEnd];
}

function handleSubmit() {
    $('form').submit(event => {
        event.preventDefault();
        let date = handleDate();
        // callNYTimes(date[0]);
        // callReddit(date[1], date[2]);
    }) 

}

$(handleSubmit);

//error log:
// finding undefined in  