document.getElementById('addSpace').onclick = () => {

    let child = `    <div>
    <label>Ingredient</label>
    <input type="text">
    <label>Substitute</label>
    <input type="text">
</div><br>`
    document.getElementById('ingredients').innerHTML += child
}




document.getElementById('post').onclick = addRecipe


function addRecipe() {
    // Get the values of the item inputs
    console.log('clicked')
    const title = document.getElementById('name').value.trimEnd();
    const instructions = document.getElementById('ins').value.trimEnd();
    const image = document.getElementById('image').files[0];
    image.filename = image.originalname
    const carbs = document.getElementById('carbs').value;
    const protein = document.getElementById('protein').value;
    const fat = document.getElementById('fat').value;
    let ingredients = []
    let docIngredients = document.getElementById('ingredients')
    for (let ingredient of docIngredients.children) {
        if (ingredient.children.length != 0) {
            let obj = { 'regular': ingredient.children[1].value, 'substitute': ingredient.children[3].value }
            ingredients.push(obj)
        }
    }
    console.log(image)
    console.log(title)
    console.log(carbs)
    console.log(fat)
    console.log(protein)
    console.log(instructions)
    console.log(ingredients)

    const formData = new FormData();
    formData.append('photo', image);
    formData.append('title', title);
    formData.append('carbs', carbs);
    formData.append('fat', fat);
    formData.append('protein', protein);
    formData.append('instructions', instructions);
    formData.append('ingredients', JSON.stringify(ingredients));
    console.log(formData)

    let data = decodeURIComponent(document.cookie)
    let sliced = data.slice(8, data.length + 1)
    let converted = JSON.parse(sliced)
    let username = converted['username']
    let url = '/add/recipe/' + username;

    p = fetch(url, {
        method: "POST",
        body: formData,
        'header': { 'Content-Type': 'application/json' }
    })

    // Log a message if the POST request was successful
    p.then((data) => {
        return data.text()
    }).then((text) => { if (text != undefined) { console.log(text) } })

    // Show an alert message if the POST request failed
    p.catch(() => {
        console.log('something went wrong while requesting posting an item');
    })

}

