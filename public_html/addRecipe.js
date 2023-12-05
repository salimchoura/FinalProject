/* Author: Salim Choura, Yanxiao Chen, 
 * Adrianna Shingyi Koppes, Nilufer Demirbas
/* Course: CSC 337
/* Description: Style file is responsible for the 
*  client side of addRecipe.js */



// When the user clicks on the plus button, we append a new
// input field to the DOM where the user can add more ingredients
// to their recipe.
document.getElementById('addSpace').onclick = () => {

    let child = `    <div>
    <label>Ingredient</label>
    <input type="text">
    <label>Substitute</label>
    <input type="text">
</div><br>`
    document.getElementById('ingredients').innerHTML += child
}



// When the user clicks on the post button, we add the recipe
// they specified to the database.
document.getElementById('post').onclick = addRecipe


/*
 * This function extracts the recipe data from the input field, organizes
 * the data, then sends it to the server to save it to the database.
 */
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

    // extracting the ingredients
    for (let ingredient of docIngredients.children) {
        if (ingredient.children.length != 0) {
            let obj = { 'regular': ingredient.children[1].value, 'substitute': ingredient.children[3].value }
            ingredients.push(obj)
        }
    }

    const formData = new FormData();
    formData.append('photo', image);
    formData.append('title', title);
    formData.append('carbs', carbs);
    formData.append('fat', fat);
    formData.append('protein', protein);
    formData.append('instructions', instructions);
    formData.append('ingredients', JSON.stringify(ingredients));
    console.log(formData)

    // sending the recipe along with the poster of the recipe to the server.
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

