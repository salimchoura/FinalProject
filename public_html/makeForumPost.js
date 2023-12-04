/*
 * Nilufer Demirbas, Salim Choura, Yanxihao Chen, and Adrianna Koppes
 * This file contains all the code necessary for making a forum post where
 * a user shall enter a title for the post, any text for the post itself,
 * an image if they would like, and a tag to make their post easier to find.
 * 
 * File Author: Nilufer Demirbas
 */

function makeForumPost(){

    console.log("Post Added!");
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
    
    // body for the post
    newForumPost = { 'username': name,
                     'title': postTitle, 
                     'image': imagePost, 
                     'text': textPost, 
                     'tag': postTag };

    dataString = JSON.stringify(newForumPost);

    let url = '/add/forum';

    // promise to get the user input for the forum post
    promise = fetch(url, {
        method: "POST",
        body: dataString,
        'header': { 'Content-Type': 'application/json' }
    });

    // check if the POST request was succesful or failed
    promise.then((data) => {
        return data.text();})
    .then((text) => {if (text =! undefined) { console.log(text) }})
    .catch(() => {
        console.log("MAKING FORUM POST FAILED");
    });

}

