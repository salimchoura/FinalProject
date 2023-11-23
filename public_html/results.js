var recipes;

window.onload = () =>
{
    data = JSON.parse(window.localStorage.getItem('recipes'))
    recipes = data
    console.log(data)
    let block = document.getElementById('recipes')
    block.innerHTML = ''
    // adding the purchases to the DOM
    for (let i in data)
    {
        let recipe = data[i]
        console.log(recipe)
        let html = `<br><div class='item'}>
        <span>Title: <a href='recipe.html' id=${i}>${recipe['title']}</a></span><br>
        <img src="../images/${recipe['image']}"><br>
      </div>`
      block.innerHTML += html
    }
    addListeners()
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
