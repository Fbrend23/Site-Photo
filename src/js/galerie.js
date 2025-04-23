// Sélection des boutons de filtre et des éléments de la galerie
const filterButton = document.querySelectorAll(".btn");
const galleryItems = document.querySelectorAll(".container-img");

// Sélecteur du loader (indicateur de chargement)
const loader = document.getElementById("loader");

// Gestion du filtrage par catégorie
filterButton.forEach(button => {
    button.addEventListener("click", function () {
        const filterValue = button.getAttribute("data-filter");

        // Mise à jour du bouton actif (sélectionné)
        filterButton.forEach(btn => {
            btn.classList.remove("selected");
        });
        button.classList.add("selected");

        // Affichage ou masquage des images selon le filtre sélectionné
        galleryItems.forEach(item => {
            if (filterValue === "all" || item.classList.contains(filterValue)) {
                item.classList.remove("hidden");
            } else {
                item.classList.add("hidden");
            }
        });
    });
});

// Sélection des images dans les balises <picture>
const galleryImg = document.querySelectorAll(".container-img picture img");

// Références au modal et à l'image affichée dans celui-ci
const modal = document.getElementById("myModal");
const modalImage = document.getElementById("modalImage");

// Activation du système de modal si les éléments sont bien présents
if (modal && modalImage && galleryImg.length > 0) {
    galleryImg.forEach((img, currentIndex) => {
        img.addEventListener("click", function () {
            modal.style.display = "flex";

            // Affiche le loader pendant le chargement de l’image
            loader.classList.remove("hidden");

            // Réinitialisation de l’image
            modalImage.classList.remove("loaded");
            modalImage.src = '';
            modalImage.src = this.src;

            // Enregistrement de l’index de l’image affichée
            modal.setAttribute("data-current-index", currentIndex);

            // Une fois l’image chargée, affichage avec effet de fondu
            modalImage.onload = () => {
                loader.classList.add("hidden");
                modalImage.classList.add("loaded");
            };
        });
    });

    // Navigation vers l’image précédente
    const prev = document.getElementsByClassName("previous")[0];
    // Navigation vers l’image suivante
    const next = document.getElementsByClassName("next")[0];

    if (prev && next) {
        prev.addEventListener("click", function () {
            let currentIndex = parseInt(modal.getAttribute("data-current-index"));
            if (currentIndex > 0) {
                currentIndex--;

                // Chargement de l’image précédente avec loader
                loader.classList.remove("hidden");
                modalImage.classList.remove("loaded");
                modalImage.src = '';
                modalImage.src = galleryImg[currentIndex].src;

                modal.setAttribute("data-current-index", currentIndex);

                modalImage.onload = () => {
                    loader.classList.add("hidden");
                    modalImage.classList.add("loaded");
                };
            }
        });

        next.addEventListener("click", function () {
            let currentIndex = parseInt(modal.getAttribute("data-current-index"));
            if (currentIndex < galleryImg.length - 1) {
                currentIndex++;

                // Chargement de l’image suivante avec loader
                loader.classList.remove("hidden");
                modalImage.classList.remove("loaded");
                modalImage.src = '';
                modalImage.src = galleryImg[currentIndex].src;

                modal.setAttribute("data-current-index", currentIndex);

                modalImage.onload = () => {
                    loader.classList.add("hidden");
                    modalImage.classList.add("loaded");
                };
            }
        });
    }

    // Fermeture du modal via le bouton (croix)
    const span = document.getElementsByClassName("close")[0];
    if (span) {
        span.addEventListener("click", function () {
            modal.style.display = "none";
        });
    }

    // Fermeture du modal si clic en dehors de l’image
    window.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
}

// Gestion de l’ouverture/fermeture du menu hamburger en version mobile
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
