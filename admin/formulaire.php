<?php require_once 'auth.php'; ?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Upload d’image</title>
    <link rel="stylesheet" href="/src/css/style.css">
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
                        <a href="/src/php/galerie.php" class="active">Galerie</a>
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
    <h1>Ajouter une photo à la galerie</h1>
    <form action="upload.php" method="post" enctype="multipart/form-data">
        <label>Image : <input type="file" name="image" required></label><br>
        <label>Catégorie :
            <select name="categorie" required>
                <option value="mammal">Mammifères</option>
                <option value="bird">Oiseaux</option>
                <option value="insect">Insectes</option>
                <option value="reptile">Reptiles</option>
                <option value="paysage">Paysages</option>
            </select>
        </label><br>
        <label>Description : <input type="text" name="description" required></label><br>
        <button type="submit">Envoyer</button>
    </form>
</body>
</html>