
var recipes;
var current = 'x'

document.getElementById('search').onclick = () =>
{
    let keyword = document.getElementById('key').value
    fetch('/search/recipes/' + keyword)
    .then((data) => { return data.text() })
    .then((text) => 
    {
        let data = JSON.parse(text);
        recipes = data
        console.log(data)
        let lower = document.getElementById('recipes')
        lower.innerHTML = ''
        // adding the purchases to the DOM
        for (let i in data)
        {
            let recipe = data[i]
            console.log(recipe)
            let html = `<br><div class='item'}>
            <span>Title: <a href='recipe.html' id=${i}>${recipe['title']}</a></span><br>
            <img src="../images/${recipe['image']}"><br>
          </div>`
            lower.innerHTML += html
        }
        addListeners()
    })
}

function addListeners()
{
    let anchors = document.getElementsByTagName('a')
    for (let anchor of anchors)
    {
        anchor.onclick = (e) =>
        {
            e.preventDefault()
            console.log(e)
            let index = e.srcElement.id
            console.log(index)
            current = recipes[index]
            console.log(current)
            window.localStorage.setItem('current', JSON.stringify(current))
            window.location.href='recipe.html'
        }
    }
}
