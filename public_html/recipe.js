/*
 * Nilufer Demirbas, Salim Choura, Yanxihao Chen, and Adrianna Koppes
 * This file contains all the code necessary for setting up a page to display
 * one recipe. The recipe to display was specified by the user when they
 * clicked on a search result on the Explore Recipes page. Users can see the
 * recipe, an associated image, a pie chart showing the percentage of carbs,
 * protein, and fat, and information about the reviews.
 * 
 * File Authors: Salim Choura and Adrianna Koppes
 */

//getting the data of the current/clicked recipe
console.log(window.localStorage.getItem('current'))
let current = JSON.parse(window.localStorage.getItem('current'))


let protein = current['protein']
let carbs = current['carbs']
let fat = current['fat']
let ingredients = current['ingredients']


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

// making a pie chart with the carb/protein/fat breakdown.
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

document.getElementById('recipe').innerHTML += '<h2>Reviews Statistics</h2>'

const btn = document.querySelector("button");
const post = document.querySelector(".post");
const widget = document.querySelector(".star-widget");
const editBtn = document.querySelector(".edit");


showReviews()


/**
 * Adds a review to the current recipe. Takes user input, including the
 * number of stars left and the text review, as well as the information about
 * the content and the user, and sends it to the server to be input into
 * the database. Then, if the input is successful, then the client requests
 * to get all of the reviews from the server to display, updating the 
 * graphics to display the new review as well.
 * 
 * Authors: Adrianna Koppes, Salim Choura
 * 
 * @param stars Number representing the number of stars given in the review
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
            // change the star review widget to show the option to edit
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
 * Show the reviews on the recipe. Gets the reviews from the server, and then
 * adds all of the reviews to the page. It also sends the relevant information
 * to be added to the bar chart of reviews. The text portion of the reviews
 * and the bar chart showing all the different ratings that have been given 
 * and their distribution are shown separately.
 * 
 * Authors: Adrianna Koppes, Salim Choura
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


// we make a variable that keeps track of the order of the star
// that the user clicked which will represent the star review.
// when a star is clicked the variable changes accoringly.
var stars = 0

let inputs = document.getElementsByTagName('input')
for (let i = 0; i < inputs.length; i++) {
    let input = inputs[i]
    input.onclick = () => { stars = 6 - (i + 1) }
}

// when we click on the post button which means we update the reviews
// we reflect the change in our data base.
btn.onclick = () => {
    addReview(stars)
}

/**
 * 
 * @param reviews: a list of reviews made by users
 * This function loops through the list of star reviews 
 * and stores them in a dictionary that maps the number of 
 * stars to the number of users then uses d3.js to show
 * a bar chart of the reviews.
 */
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

    let barchart = d3.select('.barChart')
    if (barchart != undefined)
    {
        barchart.remove()
    }
    const svg = d3.select("#recipe")
    .append("svg")
    .attr('class', 'barChart')
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