
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

// editpost redirect

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

            editBtn.onclick = () => {
                
            }
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

            if(name == curr.name){
                document.getElementById('comments').innerHTML += `<div class='comment'><h3> ${item.user} </h3><p> ${item.text} </p> <button id="edit" onclick="editComment();">edit</button> </div>
                <br> <div id="editComment"></div>`;
            }else{
                document.getElementById('comments').innerHTML += `<div class='comment'><h3> ${item.user} </h3><p> ${item.text} </p> </div>`;
            }

        }

    }).catch((error) => {
        console.log("COULD NOT GET SEARCH RESULTS");
        console.log(error);
    });
}


function editComment(){


    document.getElementById('editComment').innerHTML = `<div id='textArea'>
                <textarea id="newCom" rows="3" cols="30"></textarea>
                
                <button id="addComment" class ="btn" type="reset" onclick="addComment();">Done</button>
                
                </div>`;

    document.getElementById('commentPost').value = document.getElementById('newCom').value;

    let commID = '656ed730a07cc56a120c6663'; // how do i get the id?

    let url = '/forum/add/comment';
    let toFind = { foundComments : commID };
    let request = fetch(url, {
        method: 'POST',
        body: JSON.stringify(toFind),
        headers: {'Content-Type' : 'application/json'}
    });

    request.then((response) => {
        return response.text();
    }).then((text) => {
        if (text == 'SUCCESSFULLY UPDATED COMMENT') {

            showComment();
            return false;
        }
        else {
            alert('You need to be logged in to review and comment. Make sure your log in session has not expired');
        }
    })
    .catch((error) => {
        console.log("ERROR MAKING PURCHASE");
        console.log(error);
    });

}