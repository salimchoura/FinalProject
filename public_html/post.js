
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

showComment();

function addComment(){

    // gets the text and image inputs of the user from the post creation page
    let name = sessionStorage.getItem('username');
    let forum = curr._id;
    let comment = document.getElementById('commentPost').value;
    
    // body for the post
    newCommentPost = { 'username': name,
                       'text': comment, 
                       'forum': forum };

    dataString = JSON.stringify(newCommentPost);

    let url = '/forum/add/comment';

    fetch(url, {
        method: 'POST',
        body: JSON.stringify(newCommentPost),
        headers: { 'Content-Type': 'application/json' }
    }).then((response) => {
        return response.text();
    }).then((text) => {
        if (text == 'SUCCESSFULLY UPDATED COMMENT') {

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
        
        let name = comments.name;
        
        for (let item of comments) {

            fetch('/check/user').then((response) => {
                console.log(response);
                return response.text();
            }).then((comm) => {
        
                if(comm == 1){
                    document.getElementById('comments').innerHTML += `<div class='comment'><h3> ${item.user} </h3><p id="change"> ${item.text} </p> <button id="${item._id}" class="editClass" onclick="editComment();">edit</button> </div>
                    <br> <div id="editComment"></div>`;
                }else if(comm == 0){
                    document.getElementById('comments').innerHTML += `<div class='comment'><h3> ${item.user} </h3><p> ${item.text} </p> </div>`;
                }
        
            }).catch((error) => {
                console.log("COULD NOT GET USER LOGIN INFO");
                console.log(error);
            }); 

        }

        var buttons = document.getElementsByClassName("editClass");
        var buttonsCount = buttons.length;
        for (var i = 0; i < buttonsCount; i += 1) {
            buttons[i].onclick = function() {
                let theIdWeNeed = this.id;
                console.log(theIdWeNeed);

                document.getElementById('change').innerHTML = `<div id='textArea'>
                        <textarea id="newCom" rows="3" cols="30"></textarea>
                        
                        <button id="done" class ="btn" type="reset" onclick="editComment('` + theIdWeNeed + `');">Done</button>
                        
                        </div>`;

            };

        }
        
    }).catch((error) => {
        console.log("COULD NOT GET SEARCH RESULTS");
        console.log(error);
    });

}



function editComment(theIdWeNeed){

    var commID = theIdWeNeed;
    console.log(commID);

    // gets the text and image inputs of the user from the post creation page
    let name = sessionStorage.getItem('username');
    let forum = curr._id;
    let comment = document.getElementById('newCom').value;
    
    // body for the post
    newCommentPost = { 'username': name,
                       'text': comment, 
                       'forum': forum,
                       'comment':commID};

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

function editPost(){

    fetch('/check/user').then((response) => {
        console.log(response);
        return response.text();
    }).then((comm) => {

        if(comm == 1){
            document.getElementById('editPostButton').innerHTML += `<div id="editPostButton" ><button id="editPost" onclick="editPost();">Edit Post</button></div>`;
            window.location = 'editPost.html';
            
        }else if(comm == 0){
            document.getElementById('editPostButton').innerHTML += `<div id="editPostButton" ><h1>Login To Edit Post</h1></div>`;
        }

    }).catch((error) => {
        console.log("COULD NOT GET USER LOGIN INFO");
        console.log(error);
    });

}