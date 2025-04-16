document.addEventListener("DOMContentLoaded", function(){
    setTimeout(function(){
        const intro1 = document.getElementsByClassName("intro1");
        for (let i = 0; i < intro1.length; i++){
            intro1[i].style.opacity ="1";}}, 1000);
    setTimeout(function(){
        document.querySelector(".intro2").style.opacity = "1";}, 2000);
})

const menu = document.getElementById("hamburger");
const bar = document.querySelectorAll(".bar1, .bar2, .bar3");
const nav = document.querySelectorAll(".nav-container, .main-list, .navigation");

menu.addEventListener("click", function() {
    bar.forEach(function(bar){
        bar.classList.toggle("click");
    });
    menu.classList.toggle("click");

    nav.forEach(function(nav){
        nav.classList.toggle("mobile");
    });
})
