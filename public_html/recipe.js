console.log(window.localStorage.getItem('current'))
let current = JSON.parse(window.localStorage.getItem('current'))


let protein = current['protein']
let carbs = current['carbs']
let fat = current['fat']
let ingredients = current['ingredients']

//ingredients: [{'regular' : String, 'substitute' : String}],
//instructions: String

console.log(current)
let html = `
<img src="../images/${current['image']}"><br>`
html += '<br><h2>Ingredients:</h2><br>'
html += '<ul>'
for (let ingredient of ingredients) {
    html += `<li>-${ingredient['regular']}`
    if (ingredient['substitute'] != "")
        html += `can be substituted with ${ingredient['substitute']}`
    html += '</li>'
}
html += '</ul><br>'
html += '<h2>Instructions:</h2><br>'
html += `${current['instructions']}<br>`

document.getElementById('recipe').innerHTML = ''
document.getElementById('recipe').innerHTML += html

const data = [carbs, fat, protein];
let labels = ['carbs', 'fat', 'protein'];

// Set up the dimensions for the pie chart
const width = 400;
const height = 400;
const radius = Math.min(width, height) / 2;

// Set up the color scale
const color = d3.scaleOrdinal(d3.schemeCategory10);

// Create a pie chart function
const pie = d3.pie();

// Create an arc function
const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius);

// Create an SVG element and append it to the container
const svg = d3.select("#recipe")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

// Create pie chart elements
svg.selectAll("path")
    .data(pie(data))
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", (d, i) => color(i))
    .attr("stroke", "white")
    .style("stroke-width", "2px");

// Add labels to the pie chart
svg.selectAll("text")
    .data(pie(data))
    .enter()
    .append("text")
    .attr("transform", d => `translate(${arc.centroid(d)})`)
    .style("text-anchor", "middle")
    .style("font-size", "14px");

// Create the legend
const legend = d3.select("#recipe")
    .append("svg")
    .attr("width", 200)
    .attr("height", 200)
    .selectAll("legend")
    .data(color.domain())
    .enter()
    .append("g")
    .attr("transform", (d, i) => `translate(50, ${i * 50})`);

legend.append("rect")
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", color);

legend.append("text")
    .attr("x", 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "start")
    .text((d, i) => data[i] + 'g of ' + labels[i]);


const btn = document.querySelector("button");
const post = document.querySelector(".post");
const widget = document.querySelector(".star-widget");
const editBtn = document.querySelector(".edit");
btn.onclick = () => {
    widget.style.display = "none";
    post.style.display = "block";
    editBtn.onclick = () => {
        widget.style.display = "block";
        post.style.display = "none";
    }
    return false;
}





/**
 * Adds a review to the current recipe.
 */
function addReview(stars) {
    let user = window.sessionStorage.getItem('username');
    let recipe = current._id;
    let newReview = { username: user, numStars: stars, recipeID: recipe };
    fetch('/make/review', {
        method: 'POST',
        body: JSON.stringify(newReview),
        headers: { 'Content-Type': 'application/json' }
    }).then((response) => {
        return response.text();
    }).then((text) => {
        if (text == 'SUCCESSFULLY UPDATED REVIEW') {
            showReviews();
        }
        else {
            alert(text);
        }
    }).catch((error) => {
        console.log('THERE WAS AN ERROR ADDING A REVIEW');
        console.log(error);
    });
}

/* 
 * Show the reviews on the recipe.
 * 
 * TODO: Change this so it shows the bar chart of reviews instead of each
 * individual review. (Note: this method also needs to be called on window load)
 */
function showReviews() {
    let id = current._id;
    let query = { recipe: id };
    let url = '/get/reviews/' + id;
    let result = fetch(url);
    result.then((response) => {
        return response.text();
    }).then((text) => {
        if (text == 'COULD NOT FIND REVIEWS') {
            document.getElementById('recipeBlock').innerHTML += '<p>Could not load reviews.</p>';
        }
        else {
            let reviews = JSON.parse(text);
            // put the reviews into HTML
            for (let review of reviews) {
                // add each review to the DOM
                document.getElementById('recipeBlock').innerHTML += '<h3>' + review.user + '<h3>';
                let numStars = review.stars;
                // add each star for the user
                for (let i = 0; i < numStars; i++) {
                    document.getElementById('recipeBlock').innerHTML += "<img class='reviewStars' src='star.png'>";
                }
            }
        }
    })
}

let inputs = document.getElementsByTagName('input')
for (let i =0;i<inputs.length;i++)
{
    let input = inputs[i]
    let stars = 6-(i+1)
    input.onclick = () => {addReview(stars)}
}