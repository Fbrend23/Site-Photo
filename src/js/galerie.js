const filterButton = document.querySelectorAll(".btn");
const galleryItems = document.querySelectorAll(".container-img");

filterButton.forEach(button => {
    button.addEventListener("click", function() {
        const filterValue = button.getAttribute("data-filter");

        filterButton.forEach(btn => {
            btn.classList.remove("selected");
        });
        button.classList.add("selected");

        galleryItems.forEach(item => {
            if (filterValue === "all" || item.classList.contains(filterValue)) {
                item.classList.remove("hidden");
            } else {
                item.classList.add("hidden");
            }
        });
    });
});

const galleryImg = document.querySelectorAll(".container-img picture img");
const modal = document.getElementById("myModal");
const modalImage = document.getElementById("modalImage");

if (modal && modalImage && galleryImg.length > 0) {
    galleryImg.forEach((img, currentIndex) => {
        img.addEventListener("click", function () {
            modal.style.display = "flex";
            modalImage.classList.remove("loaded");
            modalImage.src = '';
            modalImage.src = this.src;
            modal.setAttribute("data-current-index", currentIndex);

            modalImage.onload = () => {
                modalImage.classList.add("loaded");
            };
        });
    });

    const prev = document.getElementsByClassName("previous")[0];
    const next = document.getElementsByClassName("next")[0];

    if (prev && next) {
        prev.addEventListener("click", function () {
            let currentIndex = parseInt(modal.getAttribute("data-current-index"));
            if (currentIndex > 0) {
                currentIndex--;
                modalImage.classList.remove("loaded");
                modalImage.src = '';
                modalImage.src = galleryImg[currentIndex].src;
                modal.setAttribute("data-current-index", currentIndex);

                modalImage.onload = () => {
                    modalImage.classList.add("loaded");
                };
            }
        });

        next.addEventListener("click", function () {
            let currentIndex = parseInt(modal.getAttribute("data-current-index"));
            if (currentIndex < galleryImg.length - 1) {
                currentIndex++;
                modalImage.classList.remove("loaded");
                modalImage.src = '';
                modalImage.src = galleryImg[currentIndex].src;
                modal.setAttribute("data-current-index", currentIndex);

                modalImage.onload = () => {
                    modalImage.classList.add("loaded");
                };
            }
        });
    }

    const span = document.getElementsByClassName("close")[0];
    if (span) {
        span.addEventListener("click", function () {
            modal.style.display = "none";
        });
    }

    window.addEventListener("click", function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });
}

const menu = document.getElementById("hamburger");
const bar = document.querySelectorAll(".bar1, .bar2, .bar3");
const nav = document.querySelectorAll(".nav-container, .main-list, .navigation");

if (menu) {
    menu.addEventListener("click", function () {
        bar.forEach(function (bar) {
            bar.classList.toggle("click");
        });
        menu.classList.toggle("click");

        nav.forEach(function (nav) {
            nav.classList.toggle("mobile");
        });
    });
}
