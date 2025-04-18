<?php require_once 'auth.php';

$metaPath = __DIR__ . '/../src/php/metadonnees.json';
$imgDir = __DIR__ . '/../src/img/galerie/';

if (!isset($_POST['index'])) {
    http_response_code(400);
    die('❌ Requête invalide.');
}

$index = intval($_POST['index']);

// Charger les métadonnées
if (!file_exists($metaPath)) {
    http_response_code(500);
    die('❌ Fichier de métadonnées introuvable.');
}

$photos = json_decode(file_get_contents($metaPath), true);

if (!isset($photos[$index])) {
    http_response_code(404);
    die('❌ Image introuvable.');
}

$filename = $photos[$index]['filename'];
$imagePath = $imgDir . $filename;

// Supprimer l'image si elle existe
if (file_exists($imagePath)) {
    unlink($imagePath);
}

// Supprimer l'entrée du tableau
array_splice($photos, $index, 1);

// Réécrire le fichier
file_put_contents($metaPath, json_encode($photos, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

// Rediriger vers l’admin
header('Location: dashboard.php');
exit;
