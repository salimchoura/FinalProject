
let curr = JSON.parse(window.localStorage.getItem('curr'));
showPost()
showComment()
document.getElementById('addComment').onclick = addComment

function showPost() {
    let html = `<div class='post'>
    <span id="postTag">/${curr['tag']}/</span>
    <span>${curr['title']}</span>
    <div id="postText">${curr['text']}<br> <br>-${curr['username']}</div>
    </div>`;
    console.log(curr)
    fetch('/check/user')
        .then((response) => { return response.text() })
        .then((confirmation) => {
            let username = window.sessionStorage.getItem('username');
            if (confirmation == 1 && username == curr['username']) {
                console.log('here')
                html += `<div id="editPostButton" ><button id="editPost">Edit Post</button>`
            }
            document.getElementById('postContent').innerHTML = html;
            document.getElementById('comments').innerHTML = '';
            addListeners()
        })
}

function showComment() {

    console.log(curr)
    let keyword = curr._id;
    let url = '/forum/get/comments/' + keyword;
    let resp = fetch(url);
    resp.then((response) => { return response.text() })
        .then((comments) => 
        {
            let formatted = JSON.parse(comments);
            document.getElementById('comments').innerHTML = ''
            for (let item of formatted) 
            {
                document.getElementById('comments').innerHTML 
                += `<div class='comment'><h3> ${item.user} </h3><p> ${item.text} </p> </div>`;
            }
        })
}

function addComment() {

    // gets the text and image inputs of the user from the post creation page
    let name = sessionStorage.getItem('username');
    let forum = curr._id;
    let comment = document.getElementById('commentPost').value;

    // body for the post
    newCommentPost = {
        'username': name,
        'text': comment,
        'forum': forum
    };

    dataString = JSON.stringify(newCommentPost);

    let url = '/forum/add/comment';

    fetch(url, {
        method: 'POST',
        body: JSON.stringify(newCommentPost),
        headers: { 'Content-Type': 'application/json' }
    }).then((response) => {
        return response.text();
    }).then((text) => {
        if (text == 'SUCCESSFULLY ADDED COMMENT') {

            showComment();
            return false;
        }
        else {
            alert('You need to be logged in to review and comment. Make sure your log in session has not expired');
        }
    }).catch((error) => {
        console.log('THERE WAS AN ERROR ADDING A COMMENT');
        console.log(error);
    });

}




function editComment(theIdWeNeed) {

    var commID = theIdWeNeed;
    console.log(commID);

    // gets the text and image inputs of the user from the post creation page
    let name = sessionStorage.getItem('username');
    let forum = curr._id;
    let comment = document.getElementById(commID).value;

    // body for the post
    newCommentPost = {
        'username': name,
        'text': comment,
        'forum': forum,
        'comment': commID
    };

    dataString = JSON.stringify(newCommentPost);

    let url = '/forum/edit/comment';

    fetch(url, {
        method: 'POST',
        body: JSON.stringify(newCommentPost),
        headers: { 'Content-Type': 'application/json' }
    }).then((response) => {
        console.log(response);
        return response.text();
    }).then((result) => {
        console.log(result);

        if (result == 'SUCCESSFULLY EDITED COMMENT') {

            document.getElementById('change').innerHTML = `<p id="change">${comment}</p>`;
            showComment();
            return false;
        }
        else {
            alert('You need to be logged in to review and comment. Make sure your log in session has not expired');
        }
    }).catch((error) => {
        console.log('THERE WAS AN ERROR ADDING A COMMENT');
        console.log(error);
    });

}

function editPost() {

    fetch('/check/user').then((response) => {
        console.log(response);
        return response.text();
    }).then((comm) => {

        if (comm == 1) {
            window.location = 'editPost.html';

        } else if (comm == 0) {
            document.getElementById('editPostButton').innerHTML += `<h1>Login To Edit Post</h1><`;
        }

    }).catch((error) => {
        console.log("COULD NOT GET USER LOGIN INFO");
        console.log(error);
    });

}

function addListeners() {
    let button = document.getElementById('editPostButton')
    if (button != undefined) {
        button.onclick = editPost
    }
}

function addCommentListeners() {
    let allComms = document.getElementsByClassName('comment');
    for(let comm of allComms) {
        let currID = comm.id;
        let allChildren = comm.children;
        if(allChildren.length > 2) {
            let currButton = allChildren[2];
            let handle = function(e) {
                return editComment(currID);
            }
            if(currButton != undefined) {
                currButton.addEventListener("click", handle);
            }
        }
    }
}