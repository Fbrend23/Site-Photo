<!-- layout.php -->
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="/src/css/style.css">
    <title>Portfolio Brendan</title>
    <link rel="icon" type="image/x-icon" href="/src/img/logo.png">
</head>
<body class="content">

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

<?= $content ?>

<footer></footer>
</body>
</html>
