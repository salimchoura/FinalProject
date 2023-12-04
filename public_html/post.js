
console.log(window.localStorage.getItem('curr'));
let curr = JSON.parse(window.localStorage.getItem('curr'));

let html = `
<h1>${curr['username']}</h1>
<h2>${curr['title']}</h2>

<div id="postText">${curr['text']}</div>

<h1 id="postTag">${curr['tag']}</h1>`;


let docHTML;

window.onload = (() => {
    docHTML = '';
    docHTML += html;   
    document.getElementById('postContent').innerHTML = docHTML;
});




function addComment(){

}

function showComment(){

}