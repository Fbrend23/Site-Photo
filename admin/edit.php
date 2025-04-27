<?php


$metaPath = __DIR__ . '/../src/php/metadonnees.json'; // Corriger le chemin

if (
    isset($_POST['index']) &&
    isset($_POST['description']) &&
    isset($_POST['category'])
) {
    $index = intval($_POST['index']);
    $desc = trim($_POST['description']);
    $cat = trim($_POST['category']);

    if (file_exists($metaPath)) {
        $photos = json_decode(file_get_contents($metaPath), true) ?? [];

        if (isset($photos[$index])) {
            $photos[$index]['description'] = htmlspecialchars($desc);
            $photos[$index]['category'] = htmlspecialchars($cat);

            file_put_contents($metaPath, json_encode($photos, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        }
    }
}

header("Location: dashboard.php");
exit;
