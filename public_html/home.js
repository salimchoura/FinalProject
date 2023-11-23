window.onload = () => {
    let num = window.scrollY / window.innerHeight;
      let x = 0;

      document.getElementById('filler').style.display = 'none';

      if(num <= 1) {
        document.getElementById('one').style.opacity = 1-num;
        x = (1-num)*2;
        document.getElementById('one').style.transform = 'translate3d('+x+'%,'+x+'%,0px) scale(1,1) rotate(-3deg)';
      } else if(num > 1 && num <= 2) {
        document.getElementById('two').style.opacity = 2-num;
        x = (2-num)*2;
        document.getElementById('two').style.transform = 'translate3d('+x+'%,-'+x+'%,0px) scale(1,1) rotate(5deg)';
      } else if(num > 2 && num <= 3) {
        document.getElementById('three').style.opacity = 3-num;
        x = (3-num)*2;
        document.getElementById('three').style.transform = 'translate3d('+x+'%,'+x+'%,0px) scale(1,1) rotate(-15deg)';
      } else {
        document.getElementById('filler').style.display = 'block';
      }
}


var recipes;
var current = 'x'

document.getElementById('search').onclick = () =>
{
    let keyword = document.getElementById('key').value
    fetch('/search/recipes/' + keyword)
    .then((data) => { return data.text() })
    .then((text) => 
    {
        window.localStorage.setItem('recipes', text)
        window.location.href = 'results.html'
    })
}
