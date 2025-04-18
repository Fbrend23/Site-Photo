<?php
require_once 'auth.php'; // Protège la page

$metaPath = __DIR__ . '/../src/php/metadonnees.json';
$imgDir = '../src/img/galerie/';
$photos = [];

if (file_exists($metaPath)) {
    $photos = json_decode(file_get_contents($metaPath), true) ?? [];
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Back-Office - Galerie</title>
    <link rel="stylesheet" href="../src/css/backoffice.css"> 
</head>
<body class="backoffice">
    <h1>🎛️ Back-Office Galerie</h1>
    <p><a href="formulaire.php">📤 Ajouter une nouvelle image</a> | <a href="logout.php">🔒 Se déconnecter</a></p>

    <?php if (empty($photos)): ?>
        <p>📂 Aucune image dans la galerie.</p>
    <?php else: ?>
        <table>
            <thead>
                <tr>
                    <th>Image</th>
                    <th>Description</th>
                    <th>Catégorie</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($photos as $index => $photo): ?>
                    <tr>
                        <td><img src="<?= $imgDir . $photo['filename'] ?>" alt="img"></td>
                        <td>
                            <form action="edit.php" method="post">
                                <input type="hidden" name="index" value="<?= $index ?>">
                                <input type="text" name="description" value="<?= htmlspecialchars($photo['description']) ?>">
                        </td>
                        <td>
                                <select name="category">
                                    <?php foreach (['mammal','bird','insect','reptile','paysage','uncategorized'] as $cat): ?>
                                        <option value="<?= $cat ?>" <?= $photo['category'] === $cat ? 'selected' : '' ?>><?= ucfirst($cat) ?></option>
                                    <?php endforeach; ?>
                                </select>
                        </td>
                        <td>
                                <button type="submit">💾 Enregistrer</button>
                            </form>
                            <form action="delete.php" method="post" onsubmit="return confirm('Supprimer cette image ?');">
                                <input type="hidden" name="index" value="<?= $index ?>">
                                <button type="submit">🗑️ Supprimer</button>
                            </form>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    <?php endif; ?>
</body>
</html>
