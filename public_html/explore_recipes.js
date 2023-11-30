var recipes;
var current = 'x'

document.getElementById('my_search_button').onclick = () =>
{
    console.log('lol')
    let keyword = document.getElementById('key').value
    fetch('/search/recipes/' + keyword)
    .then((data) => { return data.text() })
    .then((text) => 
    {
        recipes = JSON.parse(text)
        let docSection = document.getElementById('recipes')
        docSection.innerHTML = ''
        for (let item of recipes)
        {
            let html = `<div class='recipe'><a class='tag'><img src=./images/${item['image']}></a><br>
            <div>`
            docSection.innerHTML += html
        }
        addListeners()
    })
}


function addListeners()
{
    let tags = document.getElementsByClassName('tag')
    for (let i=0;i<tags.length;i++)
    {
        tags[i].onclick = () => 
        {
            let stringified = JSON.stringify(recipes[i])
            console.log(stringified)
            window.localStorage.setItem('current', stringified)
            window.location = 'recipe.html'
        }
    }
}

document.getElementById('addRecipe').onclick = () =>
{
    window.location = 'addRecipe.html'
}