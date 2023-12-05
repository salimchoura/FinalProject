
console.log(window.localStorage.getItem('curr'));
let curr = JSON.parse(window.localStorage.getItem('curr'));

let html = `
<h1>${curr['username']}</h1>
<h2>${curr['title']}</h2>

<div id="postText">${curr['text']}</div>

<h1 id="postTag">${curr['tag']}</h1>`;

let docHTML;
let comHTML;

window.onload = (() => {
    docHTML = '';
    docHTML += html;   
    document.getElementById('postContent').innerHTML = docHTML;

    comHTML = '';
    document.getElementById('comments').innerHTML = comHTML;
});



function addComment(){

    // gets the text and image inputs of the user from the post creation page
    let name = sessionStorage.getItem('username');
    let forum = curr._id;
    let comment = document.getElementById('commentPost').value;

    var httpRequest = new XMLHttpRequest();
    if (!httpRequest) {
        return false;
    }

    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                // for now, just log the response in the console
                console.log(httpRequest.responseText);

            } else { 
                console.log('ERROR ADDING LISTING');
            }
        }
    }
    
    // body for the post
    newCommentPost = { 'username': name,
                       'text': comment, 
                       'forum': forum };

    dataString = JSON.stringify(newCommentPost);

    let url = '/forum/add/comment';
    httpRequest.open('POST', url);
    httpRequest.setRequestHeader('Content-type', 'application/json');
    httpRequest.send(dataString);

}

function showComment(){

    let keyword = curr._id;
    let url = '/forum/get/comments/' + keyword;
    let resp = fetch(url);
    resp.then((response) => {
        console.log(response);
        return response.text();
    }).then((comm) => {

        console.log(comm);

        let comments = JSON.parse(comm);            
        document.getElementById('comments').innerHTML = ''
        for (let item of comments) {
            document.getElementById('comments').innerHTML += `<div class='comment'><h3> ${item.user} </h3><p> ${item.text} </p></div>`;
        }

    }).catch((error) => {
        console.log("COULD NOT GET SEARCH RESULTS");
        console.log(error);
    });
}


showComment();