<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$uploadDir = realpath(__DIR__ . '/../img/gallerie/') . '/';
$metaFile = 'metadonnees.json';

session_start();

if (
    $_SERVER['REQUEST_METHOD'] === 'POST' &&
    isset($_FILES['image']) &&
    isset($_POST['categorie']) &&
    isset($_POST['description'])
) {
    $file = $_FILES['image'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'webp'];

    if (in_array($ext, $allowed) && $file['error'] === 0) {
        $newName = uniqid('img_', true) . '.' . $ext;
        $destination = $uploadDir . $newName;

        if (move_uploaded_file($file['tmp_name'], $destination)) {
            echo "✅ Image déplacée avec succès<br>";

            // ➕ Enregistrement dans le JSON
            $metaPath = __DIR__ . '/' . $metaFile;
            $metadonnees = [];

            if (file_exists($metaPath)) {
                $json = file_get_contents($metaPath);
                $metadonnees = json_decode($json, true) ?? [];
            }

            $metadonnees[] = [
                'filename' => $newName,
                'category' => $_POST['categorie'],
                'description' => htmlspecialchars($_POST['description'])
            ];

            file_put_contents($metaPath, json_encode($metadonnees, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

            echo "📝 Métadonnées enregistrées avec succès<br>";
        } else {
            echo "❌ Erreur lors du déplacement du fichier<br>";
        }
    } else {
        echo "❌ Fichier non valide ou erreur à l’upload.<br>";
    }
} else {
    echo "❌ Formulaire incomplet.";
}
