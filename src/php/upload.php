<?php
$uploadDir = '../../img/gallerie/';
$metaFile = 'metadonnees.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (
        isset($_FILES['image']) &&
        isset($_POST['categorie']) &&
        isset($_POST['description'])
    ) {
        $file = $_FILES['image'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'webp'];

        if (in_array($ext, $allowed) && $file['error'] === 0) {
            $newName = uniqid('img_') . '.' . $ext;
            $destination = $uploadDir . $newName;

            if (move_uploaded_file($file['tmp_name'], $destination)) {
                // Enregistrer les métadonnées
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

                file_put_contents($metaPath, json_encode($metadonnees, JSON_PRETTY_PRINT));

                header("Location: /gallerie.php?upload=success");
                exit;
            }
        }
    }
    header("Location: /formulaire.php?upload=error");
}
