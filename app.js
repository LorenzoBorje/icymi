function readyPage() {
    $('#js-date').datePicker();
}

function callPopularNYTimes(size){
    console.log('calling New York Times');
    fetch(`https://newsapi.org/v2/everything?domains=nytimes.com&apiKey=0b6c25a9ff884a048e469de267871ad1&sortBy=popularity&from=2018-10-13&to=2018-10-13&pageSize=${size}`)
}
function generateRedditHTML(responseJson) {
    console.log('generating')
    let response = responseJson.data;
    let htmlString;
    response.forEach(article => {
        htmlString += `<h3>${article.title}</h3><h4>${article.subreddit}</h4><a href="${article.full_link}">Read More</a>`
    })
    return htmlString;
}

function renderReddit(responseJson){
    console.log(responseJson.data);
    $('.reddit').append(generateRedditHTML(responseJson));
    console.log('rendering')
}

function callReddit(size){
    fetch(`https://api.pushshift.io/reddit/submission/search/?after=24h&sort=desc&sort_type=num_comments&size=${size}&fields=full_link,subreddit,num_comments,title`)
    .then(response => {
        if (response.ok) {
            return response.json();
        }
    })
    .then(responseJson => renderReddit(responseJson));
}

function handleSubmit() {
    $('form').submit(event => {
        event.preventDefault();
        callReddit(5);
    }) 

}

$(handleSubmit);