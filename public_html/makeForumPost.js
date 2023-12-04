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
    const postTitle = document.getElementById('postTitle').value.trimEnd();
    const textPost = document.getElementById('textPost').value.trimEnd();
    const imagePost = document.getElementById('imagePost').files[0];
    const tag = document.getElementById('tag').value.trimEnd();
    
    // check to see if there is coherent posts submitted
    console.log(postTitle);
    console.log(textPost);
    console.log(imagePost);
    console.log(tag);

    // forum post layout
    const layout = new FormData();
    layout.append('image', imagePost);
    layout.append('title', postTitle);
    layout.append('text', textPost);
    layout.append('tag', tag);
    console.log(layout);

    // get username with cookies
    let data = decodeURIComponent(document.cookie)
    let sliced = data.slice(8, data.length + 1)
    let converted = JSON.parse(sliced)
    let username = converted['username']
    let url = '/add/forum/' + username;

    // promise to get the user input for the forum post
    promise = fetch(url, {
        method: "POST",
        body: layout,
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

