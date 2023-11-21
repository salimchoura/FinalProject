let current = JSON.parse(window.localStorage.getItem('current'))


let protein = current['protein']
let carbs = current['carbs']
let fat = current['fat']
let ingredients = current['ingredients']

//ingredients: [{'regular' : String, 'substitute' : String}],
//instructions: String

console.log(current)
let html = `<span>Title ${current['title']}</span><br>
<img src="../images/${current['image']}"><br>`
html +='<ul>'
for (let ingredient of ingredients)
{
    html += `<li>${ingredient['regular']}`
    if (ingredient['substitute'] != "")
        html += `can be substituted with ${ingredient['substitute']}`
    html += '</li>'
}
html+='</ul>'
html+=`${current['instructions']}`

document.getElementById('recipeBlock').innerHTML = ''
document.getElementById('recipeBlock').innerHTML += html

const data = [carbs,fat,protein];
let labels = ['carbs','fat','protein'];

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
const svg = d3.select("#recipeBlock")
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
const legend = d3.select("#recipeBlock")
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

document.getElementById('recipeBlock').innerHTML += "<button id=0><img class='stars' src='star.png'></button>"
document.getElementById('recipeBlock').innerHTML += "<button id=0><img class='stars' src='star.png'></button>"
document.getElementById('recipeBlock').innerHTML += "<button id=0><img class='stars' src='star.png'></button>"
document.getElementById('recipeBlock').innerHTML += "<button id=0><img class='stars' src='star.png'></button>"
document.getElementById('recipeBlock').innerHTML += "<button id=0><img class='stars' src='star.png'></button>"


let buttons = document.getElementsByTagName('button')
for (let button of buttons)
{
    button.onclick = (e) =>
    {
        changeColor(e)
    }
}

function changeColor(event)
{
    console.log(event)
    let max = event
    console.log(max)
    let buttons = document.getElementsByTagName('button')
    for (let i=0;i < buttons.length;i++)
    {
        if (i < max)
        {
            console.log(1)
        }
    }


}