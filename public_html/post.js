/*
 * Nilufer Demirbas, Salim Choura, Yanxihao Chen, and Adrianna Koppes
 * This file contains all the code necessary for making a forum post where
 * a user shall enter a title for the post, any text for the post itself,
 * an image if they would like, and a tag to make their post easier to find.
 * 
 * File Authors: Adrianna Koppes, Salim Choura, and Nilufer Demirbas
 */

// This gets information from the window.local.storage from 
// the forum page so that the values of the post that the
// user clicked on can be retrieved in this js file.

let curr = JSON.parse(window.localStorage.getItem('curr'));
showPost()
showComment()
document.getElementById('addComment').onclick = addComment

// The following function manipulates the innerHTML of the
// post page so it shows specifically the post that the 
// user clicked on in the forum page. Additionally it checks
// to see if you are logged in via a promise path that returns 
// 1 if you are logged in, and shows an "edit" button to edit
// the post on a different page.

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

// This function uses the object id of this post to fetch the 
// comments in the comments array object within this post. 
// The it iterates through all of the comments and displays 
// them on the page by manipulating the innerHTML of an html 
// element in the post.html page. 

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

// The following function mkes a new comment. 
// It gets the current post's id, the username from the current session,
// and the content of the comment textfield, to save their values into the newCommentPost
// body, before stringifying it. Then the body is posted onto the database, and 
// a success message is returned by the promise when it works.

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

// The following function edits the post that you are currently viewing 
// on post.html. It first checks to see if you are logged in and if you
// are allowed to edit the post. If so, the edit button will appear by
// updating the innerHTML value. 

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

// The following function listens to see if the editPostButton
// is clicked, and if so, it takes the user to the editPost page

function addListeners() {
    let button = document.getElementById('editPostButton')
    if (button != undefined) {
        button.onclick = editPost
    }
}