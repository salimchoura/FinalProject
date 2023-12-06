/*
 * Nilufer Demirbas, Salim Choura, Yanxihao Chen, and Adrianna Koppes
 * This file contains the code to make sure the input and textarea 
 * fields contain the values from the post that you have chosen to edit.
 * It finds the current post you are editing and updates all the 
 * information accordingly from the inputs entered by the user.
 * 
 * File Author: Nilufer Demirbas
 */

let curr = JSON.parse(window.localStorage.getItem('curr'));
console.log(curr);

document.getElementById('postTitle').value = curr['title'];
document.getElementById('textPost').value = curr['text'];

// The following function takes the object id of the post to know where it
// needs to apply the updates from the text fields to. It adds the data to
// the newPost body, stringifies it and enters it into the promise.
// The promise fetches the desired text result to confirm that the edit
// was a success and replaces the innerHTML of the old post with the updated
// version.

function editForumPost(){

    var id = curr['_id'];
    console.log(id);

    // gets the text and image inputs of the user from the post creation page
    let name = sessionStorage.getItem('username');
    let postTitle = document.getElementById('postTitle').value;
    let postContent = document.getElementById('textPost').value.trimEnd();
    
    // body for the post
    newPost = { 'username': name,
                       'title': postTitle, 
                       'forumID': id,
                       'content':postContent};

    dataString = JSON.stringify(newPost);

    let url = '/edit/forum';

    fetch(url, {
        method: 'POST',
        body: JSON.stringify(newPost),
        headers: { 'Content-Type': 'application/json' }
    }).then((response) => {
        console.log(response);
        return response.text();
    }).then((result) => {

        console.log(result);

        

        if (result == 'SUCCESSFULLY UPDATED FORUM POST') {

            document.getElementById('content').innerHTML = `<p id="change">${item.text}</p>`;
            return false;
        }
        else {
            alert('You need to be logged in to review and comment. Make sure your log in session has not expired');
        }

        window.location = 'forum.html';

    }).catch((error) => {
        console.log('THERE WAS AN ERROR ADDING A COMMENT');
        console.log(error);
    });

}