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

// Additionally the "curr" variable, allows the user to click
// on the post which will take them to a separate page where they 
// can see the post that they clicked on itself with its content.

var posts;
var curr = 'empty';

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
            postString += `<div class="fPost"> <h1> ${element['username']} </h1> <a class='titleLink' href="post.html"> ${element['title']} </a> <br> </div>`;
            forumPosts.innerHTML = postString;
        }

        postListener();
        
    });
}

// This function records the data of the post
// after it is clicked, so that it can relay the
// information to the new html page and its js file
// via the window.localStorage.

function postListener()
{
    let tags = document.getElementsByClassName('fPost')
    for (let i=0;i<tags.length;i++)
    {
        tags[i].onclick = () => 
        {
            let stringified = JSON.stringify(posts[i]);
            console.log(stringified);
            window.localStorage.setItem('curr', stringified);
            window.location = 'post.html';
        }
    }
}