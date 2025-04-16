const filterButton = document.querySelectorAll(".btn");
const galleryItems = document.querySelectorAll(".container-img");


filterButton.forEach(button => {
    button.addEventListener("click", function() {
        const filterValue = button.getAttribute("data-filter");

// Mettre à jour le bouton actif
        filterButton.forEach(btn => {
            btn.classList.remove("selected");
        });
            button.classList.add("selected");

// Filtrer
        galleryItems.forEach(item => {
            if (filterValue === "all" || item.classList.contains(filterValue)){
                item.classList.remove("hidden");
            } 
            else{
                item.classList.add("hidden");
                
            }
        })
    })
})


const galleryImg = document.querySelectorAll(".container-img > img");
const modal = document.getElementById("myModal");

galleryImg.forEach((img, currentIndex) => {
    img.addEventListener("click", function() {
        modal.style.display = "flex";
        document.getElementById("modalImage").src = this.src;
        modal.setAttribute("data-current-index", currentIndex);
    });
});

const prev = document.getElementsByClassName("previous")[0];
const next = document.getElementsByClassName("next")[0];

prev.addEventListener("click", function() {
    let currentIndex = parseInt(modal.getAttribute("data-current-index"));
    if (currentIndex > 0) {
        currentIndex--;
        document.getElementById("modalImage").src = galleryImg[currentIndex].src;
        modal.setAttribute("data-current-index", currentIndex);
    }
});

next.addEventListener("click", function() {
    let currentIndex = parseInt(modal.getAttribute("data-current-index"));
    if (currentIndex < galleryImg.length - 1) {
        currentIndex++;
        document.getElementById("modalImage").src = galleryImg[currentIndex].src;
        modal.setAttribute("data-current-index", currentIndex);
    }
});

const span = document.getElementsByClassName("close")[0];

// Fermer le modal 
span.addEventListener("click", function() {
    modal.style.display = "none";
});

// Fermer le modal quand l'utilisateur clique en dehors
window.addEventListener("click", function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
});

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