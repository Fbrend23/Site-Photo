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
        <?php
        $metaPath = __DIR__ . '/../src/php/metadonnees.json';
        $imgDir = '../src/img/galerie/';

        if (file_exists($metaPath)) {
            $photos = json_decode(file_get_contents($metaPath), true);

            foreach ($photos as $photo) {
                $src = $imgDir . $photo['filename'];
                $cat = htmlspecialchars($photo['category']);
                $desc = htmlspecialchars($photo['description']);

                echo "<div class='container-img item $cat'>";
                echo "<img src='$src' alt='$desc'>";
                echo "<div class='description'>$desc</div>";
                echo "</div>";
            }
        } else {
            echo "<p>📂 Aucun fichier de métadonnées trouvé.</p>";
        }
        ?>
    </div>

    <div class="modal" id="myModal">
        <span class="close">&times;</span>
        <span class="previous">&#9665</span>
        <span class="next">&#9655</span>
        <img class="modal-content" id="modalImage">
    </div>
</section>
<script src="/src/js/galerie.js"></script>
