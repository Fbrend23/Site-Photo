<?php require_once 'auth.php'; ?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Upload d’image</title>
    <link rel="stylesheet" href="/src/css/style.css">
</head>
<body class="content">

    <h1>Ajouter une photo à la galerie</h1>
    <form class="flex column center" action="/admin/upload.php" method="post" enctype="multipart/form-data">
        <label>Image : <input type="file" name="image" required></label>
        <label>Catégorie :
            <select name="category" required>
                <option value="mammal">Mammifères</option>
                <option value="bird">Oiseaux</option>
                <option value="insect">Insectes</option>
                <option value="reptile">Reptiles</option>
                <option value="paysage">Paysages</option>
            </select>
        </label>
        <label>Description : <input type="text" name="description" required></label>
        <button type="submit">Envoyer</button>
    </form>
</body>
</html>