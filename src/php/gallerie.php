<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" type="text/css" href="/src/css/style.css">
    <title>Portfolio Brendan</title>
    <link rel="icon" type="image/x-icon" href="../img/logo.png">
</head>

<body class="content">
    <header class="site-header">
        <a href="/index.html"><img class="logo mobile" src="/src/img/logo.png" alt="logo"> </a>
        <div class="nav-container">
            <nav class="navigation">
                <ul class="main-list">
                    <li>
                        <a href="/index.html" class="">Accueil</a>
                    </li>
                    <!-- <li>
                    <a href="#">Biographie</a>
                </li> -->
                    <li>
                        <a href="/src/php/gallerie.php" class="active">Gallerie</a>
                    </li>
                    <li>
                        <a href="#" class="contact" href="#">Contact</a>
                    </li>
                </ul>
            </nav>
        </div>

        <div id="hamburger">
            <div class="bar1"></div>
            <div class="bar2"></div>
            <div class="bar3"></div>
        </div>
    </header>
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
            $metaPath = __DIR__ . '/metadonnees.json';
            $imgDir = '/src/img/gallerie/';

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
    <script src="/src/js/gallerie.js"></script>
</body>

</html>