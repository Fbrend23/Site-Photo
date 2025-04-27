<?php
$uri = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title><?= $title ?? 'Admin' ?></title>
    <link rel="stylesheet" href="/src/css/style.css">
    <link rel="stylesheet" href="/src/css/backoffice.css">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body class="content backoffice">
    <!-- 🔝 HEADER PUBLIC -->
    <header class="site-header">
        <a href="/accueil"><img class="logo mobile" src="/src/img/logo.png" alt="logo"></a>
        <div class="nav-container">
            <nav class="navigation">
                <ul class="main-list">
                    <li>
                        <a href="/accueil" class="<?= ($uri === '' || $uri === 'accueil') ? 'active' : '' ?>">Accueil</a>
                    </li>
                    <li>
                        <a href="/galerie" class="<?= ($uri === 'galerie') ? 'active' : '' ?>">Galerie</a>
                    </li>
                    <li>
                        <a href="#" class="contact">Contact</a>
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

    <!-- 🛠️ NAV ADMIN -->
    <section class="admin-header">
        <strong>🎛️ Back-Office</strong> | 
        <a href="/admin/admin.php">Tableau de bord</a> | 
        <a href="/admin/formulaire.php">Ajouter</a> | 
        <a href="/accueil">Déconnexion</a>
    </section>

    <!-- 🧱 CONTENU -->
    <main class="container">
        <?= $content ?>
    </main>

    <script src="/src/js/index.js"></script>
</body>
</html>
