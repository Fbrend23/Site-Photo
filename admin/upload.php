<?php
require_once 'auth.php';

$metaPath = __DIR__ . '/metadonnees.json';
$uploadDir = '../src/img/galerie/';
$photos = [];

if (file_exists($metaPath)) {
    $photos = json_decode(file_get_contents($metaPath), true) ?? [];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['image'])) {
    $description = trim($_POST['description']);
    $category = trim($_POST['category']);
    $file = $_FILES['image'];
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'img_' . uniqid('', true) . '.' . $extension;
    $destination = $uploadDir . $filename;

    if (move_uploaded_file($file['tmp_name'], $destination)) {

        // Convertir l'image en WebP
        $webpPath = $uploadDir . pathinfo($filename, PATHINFO_FILENAME) . '.webp';
        $image = null;
        switch (strtolower($extension)) {
            case 'jpg':
            case 'jpeg':
                $image = imagecreatefromjpeg($destination);
                break;
            case 'png':
                $image = imagecreatefrompng($destination);
                break;
        }

        if ($image) {
            imagewebp($image, $webpPath, 80);
            imagedestroy($image);
        }

        $photos[] = [
            'filename' => $filename,
            'description' => $description,
            'category' => $category
        ];
        file_put_contents($metaPath, json_encode($photos, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        header("Location: dashboard.php");
        exit;
    } else {
        echo "❌ Erreur lors du déplacement du fichier";
    }
}
?>
