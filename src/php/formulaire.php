<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Upload d’image</title>
    <link rel="stylesheet" href="/src/css/style.css">
</head>
<body class="content">
    <h1>Ajouter une photo à la galerie</h1>
    <form action="upload.php" method="post" enctype="multipart/form-data">
        <label>Image : <input type="file" name="image" required></label><br>
        <label>Catégorie :
            <select name="categorie" required>
                <option value="mammal">Mammifères</option>
                <option value="bird">Oiseaux</option>
                <option value="insect">Insectes</option>
                <option value="reptile">Reptiles</option>
                <option value="paysage">Paysages</option>
            </select>
        </label><br>
        <label>Description : <input type="text" name="description" required></label><br>
        <button type="submit">Envoyer</button>
    </form>
</body>
</html>