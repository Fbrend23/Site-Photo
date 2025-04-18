<?php
require_once 'auth.php';

$uploadDir = __DIR__ . '/../src/img/galerie/';
$metaPath = __DIR__ . '/../src/php/metadonnees.json';
$photos = [];

if (file_exists($metaPath)) {
    $photos = json_decode(file_get_contents($metaPath), true) ?? [];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['image'])) {
    $file = $_FILES['image'];
    $originalName = basename($file['name']);
    $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'gif'];

    if (!in_array($ext, $allowed)) {
        die("❌ Format de fichier non autorisé.");
    }

    // Récupération du nom personnalisé s'il existe
    $nomFichier = isset($_POST['nom']) && trim($_POST['nom']) !== ''
        ? preg_replace('/[^a-zA-Z0-9_-]/', '_', pathinfo($_POST['nom'], PATHINFO_FILENAME)) . '.' . $ext
        : 'img_' . uniqid('', true) . '.' . $ext;

    $targetPath = $uploadDir . $nomFichier;

    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        // Nettoyage des champs texte
        $description = isset($_POST['description']) ? trim($_POST['description']) : '';
        $categorie = isset($_POST['category']) ? trim($_POST['category']) : 'uncategorized';

        // Ajout à la galerie
        $photos[] = [
            'filename' => $nomFichier,
            'description' => htmlspecialchars($description),
            'category' => htmlspecialchars($categorie)
        ];

        file_put_contents($metaPath, json_encode($photos, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        header("Location: formulaire.php");
        exit;
    } else {
        echo "❌ Erreur lors du déplacement du fichier.";
    }
}
?>
