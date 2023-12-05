/* Author: Salim Choura, Yanxiao Chen, 
 * Adrianna Shingyi Koppes, Nilufer Demirbas
/* Course: CSC 337
/* Description: This file is responsible for the client side
* of the explore_recipes.html page*/


//storing the recipes and the current recipe. The user will click
//on a recipe image after looking up recipes and current will contain
//the data of that recipe
var recipes;
var current = 'x'


//handling the fuctioning of the search button
document.getElementById('my_search_button').onclick = () =>
{
    // extracting the keyword and sending it to the server to check
    // what recipe titles match the keyword
    let keyword = document.getElementById('key').value
    fetch('/search/recipes/' + keyword)
    .then((data) => { return data.text() })
    .then((text) => 
    {
        recipes = JSON.parse(text)
        let docSection = document.getElementById('recipes')
        docSection.innerHTML = ''
        // appending images of recipes with matching titles to the DOM.
        // we make the images anchor tags but we don't specify an href
        // because we would need to store the recipe that was clicked on first
        // before being redirected.
        for (let item of recipes)
        {
            let html = `<div class='recipe'><a class='tag'><img src=./images/${item['image']}></a><br>
            <div>`
            docSection.innerHTML += html
        }
        // adding event listeners to the images so that they redirect us to recipe.html
        // with the correct recipe
        addListeners()
    })
}


/*
 * This function adds events listeners to the images of the matching
 * recipes once they were added to the DOM. Each event listener will
 * store the data of the clicked recipe in the local storage of the broswer.
 */
function addListeners()
{
    let tags = document.getElementsByClassName('tag')
    for (let i=0;i<tags.length;i++)
    {
        tags[i].onclick = () => 
        {
            // when image number i is clicked, we want to store the
            // data of recipes at index i because the images appear in the
            // same order of the recipes. Once recipe at index i is stored,
            // we redirect the user to recipe.html to see the data of that recipe.
            let stringified = JSON.stringify(recipes[i])
            console.log(stringified)
            window.localStorage.setItem('current', stringified)
            window.location = 'recipe.html'
        }
    }
}

// if the user clicks on the addrecipe button, they will be redirected to 
// addRecipe.html
document.getElementById('addRecipe').onclick = () =>
{
    window.location = 'addRecipe.html'
}