/*
 * Nilufer Demirbas, Salim Choura, Yanxihao Chen, and Adrianna Koppes
 * This file contains all the code necessary for making a forum post where
 * a user shall enter a title for the post, any text for the post itself,
 * an image if they would like, and a tag to make their post easier to find.
 * 
 * File Author: Nilufer Demirbas
 */

function makeForumPost(){

    // gets the text and image inputs of the user from the post creation page
    let name = sessionStorage.getItem('username');
    let postTitle = document.getElementById('postTitle').value.trimEnd();
    let textPost = document.getElementById('textPost').value.trimEnd();
    let imagePost = document.getElementById('imagePost').files[0];
    let postTag = null;
    if(document.getElementById("advice").checked){
        postTag = document.getElementById("advice").value;
    }else if(document.getElementById("question").checked){
        postTag = document.getElementById("question").value;
    }else{
        console.log('MUST CHECK ONE');
    }

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
    newForumPost = { 'username': name,
                     'title': postTitle, 
                     'image': imagePost, 
                     'text': textPost, 
                     'tag': postTag };

    dataString = JSON.stringify(newForumPost);

    let url = '/add/forum';
    httpRequest.open('POST', url);
    httpRequest.setRequestHeader('Content-type', 'application/json');
    httpRequest.send(dataString);

}

