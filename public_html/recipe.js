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
<h1>${current['title']}</h1>
<img src="../images/${current['image']}"><br>`
html += '<br><h2>Ingredients:</h2><br>'
html += '<ul>'
for (let ingredient of ingredients) {
    html += `<li>-${ingredient['regular']}`
    if (ingredient['substitute'] != "")
        html += ` (substitute: ${ingredient['substitute']})`
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


showReviews()


/**
 * Adds a review to the current recipe.
 */
function addReview(stars) {
    let user = window.sessionStorage.getItem('username');
    let text = document.getElementById('feedback').value
    console.log('text')
    console.log('stars')
    let recipe = current._id;
    let newReview = { username: user, numStars: stars, recipeID: recipe, text: text };
    fetch('/make/review', {
        method: 'POST',
        body: JSON.stringify(newReview),
        headers: { 'Content-Type': 'application/json' }
    }).then((response) => {
        return response.text();
    }).then((text) => {
        if (text == 'SUCCESSFULLY UPDATED REVIEW') {
            showReviews();
            widget.style.display = "none";
            post.style.display = "block";
            editBtn.onclick = () => {
                widget.style.display = "block";
                post.style.display = "none";
            }
            return false;
        }
        else {
            alert('You need to be logged in to review and comment. Make sure your log in session has not expired');
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
            document.getElementById('recipe').innerHTML += '<p>Could not load reviews.</p>';
        }
        else {
            let reviews = JSON.parse(text);
            document.getElementById('recipe').innerHTML += '<h2>Reviews Statistics</h2>'
            makeBarChart(reviews)
            document.getElementById('comments').innerHTML = ''
            // put the reviews into HTML
            for (let review of reviews) {
                // add each review to the DOM
                document.getElementById('comments').innerHTML += `<div class='comment'><h3> ${review.user} </h3><p> ${review.text} </p></div>`;
            }
        }
    })
}

var stars = 0

let inputs = document.getElementsByTagName('input')
for (let i = 0; i < inputs.length; i++) {
    let input = inputs[i]
    input.onclick = () => { stars = 6 - (i + 1) }
}


btn.onclick = () => {
    addReview(stars)
}


function makeBarChart(reviews) {
    let formatted = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    for (let review of reviews) {
        formatted[review.stars] += 1
    }

    let formattedAgain = []
    for (let i = 1; i < 6; i++) {
        let obj = { stars: i, count: formatted[i] }
        formattedAgain.push(obj)
    }

    console.log(formattedAgain)

    const width = 600;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    // Calculate the inner dimensions
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;


    const svg = d3.select("#recipe")
    .append("svg")
    .attr("width", width)
    .attr("height", height)

    const chart = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create x and y scales
    const xScale = d3.scaleBand()
        .domain(formattedAgain.map(d => d.stars))
        .range([0, innerWidth])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(formattedAgain, d => d.count)])
        .range([innerHeight, 0]);

    // Create x and y axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Append x and y axes to the chart
    chart.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(xAxis);

    chart.append("g")
        .attr("class", "y-axis")
        .call(yAxis);

    // Create bars
    chart.selectAll(".bar")
        .data(formattedAgain)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.stars))
        .attr("y", d => yScale(d.count))
        .attr("width", xScale.bandwidth())
        .attr("height", d => innerHeight - yScale(d.count));


}