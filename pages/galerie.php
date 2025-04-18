<?php
$metaPath = __DIR__ . '/../src/php/metadonnees.json';
$imgDir = '/src/img/galerie/';
$photos = [];

if (file_exists($metaPath)) {
    $photos = json_decode(file_get_contents($metaPath), true) ?? [];
}
?>

<section>
    <div id="category">
        <button class="btn selected" data-filter="all">Tous</button>
        <button class="btn mammal" data-filter="mammal">Mammifères</button>
        <button class="btn bird" data-filter="bird">Oiseaux</button>
        <button class="btn insect" data-filter="insect">Insectes</button>
        <button class="btn reptile" data-filter="reptile">Reptiles</button>
        <button class="btn paysage" data-filter="paysage">Paysages</button>
    </div>

    <div class="portfolio">
        <?php foreach ($photos as $photo): ?>
            <div class="container-img item <?= htmlspecialchars($photo['category']) ?>">
                <picture>
                    <source srcset="<?= $imgDir . pathinfo($photo['filename'], PATHINFO_FILENAME) ?>.webp" type="image/webp">
                    <img src="<?= $imgDir . $photo['filename'] ?>" loading="lazy" alt="<?= htmlspecialchars($photo['description']) ?>">
                </picture>
                <div class="description"><?= htmlspecialchars($photo['description']) ?></div>
            </div>
        <?php endforeach; ?>
    </div>
</section>
<!-- MODAL GALLERY -->
<div id="myModal" class="modal">
    <span class="close">&times;</span>
    <img class="modal-content" id="modalImage">
    <div class="caption"></div>
    <a class="previous">&#10094;</a>
    <a class="next">&#10095;</a>
</div>

<script src="/src/js/galerie.js"></script>
