<?php
$uri = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title><?= $title ?? 'Admin' ?></title>
    <link rel="stylesheet" href="/src/css/style.css">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body class="content">
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
    <section class="admin-header" style="background:#222; padding: 1rem; color: white;">
        <strong>🎛️ Back-Office</strong> |
        <a href="/admin/admin.php" style="color: white;">Tableau de bord</a> |
        <a href="/admin/formulaire.php" style="color: white;">Ajouter</a> |
        <a href="/admin/logout.php" style="color: white;">Déconnexion</a>
    </section>

    <!-- 🧱 CONTENU -->
    <main class="container" style="padding: 2rem;">
        <?= $content ?>
    </main>

    <script src="/src/js/index.js"></script>
</body>
</html>
