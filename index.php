<?php
$uri = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$segments = explode('/', $uri);
$page = $segments[0] ?? 'accueil';

switch ($uri) {
    case '':
    case 'accueil':
        $page = 'accueil';
        break;
    case 'galerie':
        $page = 'galerie';
        break;
        
    case 'admin':
        $subPage = $segments[1] ?? 'dashboard';
        $file = __DIR__ . "/admin/{$subPage}.php";
        break;
    default:
        http_response_code(404);
        $page = null;
        $content = "<h1>404 - Page non trouvée</h1>";
}

if ($page !== null) {
    ob_start();
    include __DIR__ . "/pages/$page.php";
    $content = ob_get_clean();
}

include __DIR__ . '/layout.php';
