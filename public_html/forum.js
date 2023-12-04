/*
 * Nilufer Demirbas, Salim Choura, Yanxihao Chen, and Adrianna Koppes
 * This file contains all the code necessary for redirecting a user to 
 * the page where they will make their new forum post, and search 
 * through already made forum posts using the searchbar and keywords
 * that appear in the posts.
 * 
 * File Author: Nilufer Demirbas
 */

// takes user to the forum post creation page by switching window location
window.onload = () =>{
    document.getElementById('makePost').onclick = () =>
    {
        window.location = 'makeForumPost.html';
    }
}

// function takes keyword from the searchbar with the id "tag"
// then inserts it into the promise's url and searches for a 
// post that includes that keyword, before adding it as a html
// line into the forum page.

var posts;

function lookForPost(){
    console.log('looking for posts...');
    let keyword = document.getElementById('tag').value;
    fetch('/search/forum/' + keyword)
    .then((data) => { 
        return data.text(); })
    .then((text) => 
    {
        posts = JSON.parse(text);
        let forumPosts = document.getElementById('content');
        forumPosts.innerHTML = '';

        let postString = '';

        for (let element of posts)
        {
            postString += `<div class="fPost"> <h1> username </h1> <a class='titleLink' onclick="goToPost();"> ${element['title']} </a> <br> </div>`;
            forumPosts.innerHTML = postString;
        }
        
    });
}

function goToPost(){
    console.log('clicked');
    document.getElementsByClassName('titleLink').onclick = () =>
    {
        window.location = 'post.html';
    }
}