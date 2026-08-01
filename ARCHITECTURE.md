# Site-Photo — architecture cible

Migration du site vitrine photo de PHP vanilla vers Nuxt en génération statique, avec les
médias stockés hors du dépôt, sur l'hébergement mutualisé Infomaniak.

Décisions arrêtées le 31 juillet 2026.

## Le principe

Le dépôt Git ne contient que du **texte** : code et métadonnées. Les photos vivent dans un
dossier privé de l'hébergement. À chaque publication, la CI récupère les masters, n'encode
que les nouveautés, génère le HTML et dépose le tout sur Apache. **Aucun code ne s'exécute
côté serveur en production.**

```
Script local  →  GitHub  →  Actions                    →  Infomaniak
master + fiche   commit     récupère, encode, generate    rsync vers /web
```

## Les briques

| Couche | Choix | Pourquoi |
|---|---|---|
| Framework | Nuxt 4 (Vue 3) | Vue déjà maîtrisé. Routing par fichiers, imports auto, écosystème de modules. |
| Rendu | SSG — `nuxt generate` | Le contenu ne change qu'à la publication. Meilleur SEO, zéro exécution serveur. |
| Contenu | `@nuxt/content` v3 | Collection `photos` typée : master, description, catégorie, lieu, date. |
| Médias | Dossier privé Infomaniak | Hors racine web. 250 Go déjà payés, trafic illimité, même clé SSH que le déploiement. |
| Images | `sharp`, cache par hash | AVIF + WebP multi-largeurs, encodés une seule fois par photo et par profil. |
| SEO | `@nuxtjs/seo` | Sitemap, robots.txt, Open Graph, JSON-LD. Nécessite `site.url` (voir plus bas). |
| Styles | CSS repris de l'existant | `style.css` réutilisable presque tel quel. Pas de refonte visuelle imposée. |
| Publication | Script local | Une commande : master, envoi, fiche, commit. Pas de CMS à maintenir. |
| CI | GitHub Actions | Le build tourne sur du CPU gratuit, pas sur le mutualisé. |
| Déploiement | `rsync` over SSH | Synchronisation du dossier de sortie, `--delete` pour purger l'obsolète. |
| Hébergement | Infomaniak mutualisé | Apache + `.htaccess`. Sert du statique. SSL Let's Encrypt inclus. |

**Gardé en réserve :** l'offre inclut 1 site Node.js et MariaDB illimité, tous deux
inutilisés. Délibéré — réserve pour une API Nitro authentifiée si un back-office web
devient nécessaire, sans rien changer au site public.

## Où vivent les fichiers

| Fichier | Emplacement | Rôle |
|---|---|---|
| RAW & pleine résolution | Catalogue Lightroom + sauvegarde | Source d'origine. Ne quitte jamais la machine. |
| Master web | Infomaniak, hors racine web | Export ~3000 px, qualité 85, 0,8 à 1,5 Mo. Source du pipeline. |
| Fiche métadonnées | Dépôt Git | Quelques centaines d'octets. |
| Variantes AVIF/WebP | Cache CI, puis `/web` | Produites au build, servies au visiteur. |

Conséquence : le dépôt reste à quelques mégaoctets quel que soit le nombre de photos.

> Note : l'historique Git actuel pèse ~380 Mo (les JPEG ont été commités avant l'ajout du
> `.gitignore`). Sans effet sur la CI — `actions/checkout` fait un clone superficiel par
> défaut. Purge éventuelle avec `git filter-repo` **après la phase 3**, jamais pendant.

## Le pipeline images

L'existant sert une seule WebP pleine résolution — jusqu'à **5,8 Mo** pour une vignette —
et les originaux JPEG de 8 à 22 Mo sont dans le dossier public.

### Les variantes

| Usage | Largeurs | Formats |
|---|---|---|
| Grille | 400, 800, 1200 | AVIF + WebP 800 en secours |
| Modale plein écran | 1600 | AVIF + WebP |

**La largeur de modale n'est pas optionnelle.** La galerie ouvre les images en plein écran :
c'est précisément le moment où le visiteur regarde la photo attentivement, et où du 1200 px
étiré se voit. Produire cette variante dès la phase 1 évite de tout réencoder en phase 2.

Le WebP est doublé sur la largeur de modale pour la même raison — un navigateur sans AVIF
ne doit pas recevoir du 800 px en plein écran.

Soit **6 variantes par photo**. Ordres de grandeur attendus :

```
w_400  AVIF   ~ 25 Ko
w_800  AVIF   ~ 70 Ko
w_1200 AVIF   ~140 Ko
w_1600 AVIF   ~230 Ko
w_800  WebP   secours grille
w_1600 WebP   secours modale
```

Une vignette de grille passe à environ **100 à 200 Ko**, le navigateur choisit via `srcset`.

### Le temps de build est le facteur limitant

L'encodage AVIF est lent et son coût croît linéairement avec le catalogue.

**Piège à éviter :** mettre `actions/cache` sur la sortie d'images de Nuxt ne sert à rien —
la prérendue régénère ses images à chaque `generate` sans consulter de cache préexistant.
D'où un script d'encodage découplé, en amont de `nuxt generate`.

### Le cache doit être indexé sur le contenu ET sur le profil

Point critique, source d'un bug silencieux si on l'omet : indexer uniquement sur le hash du
master signifie qu'un changement de réglage d'encodage (qualité, `effort`, ajout d'une
largeur) **resservira les anciennes variantes** sans rien signaler.

```js
// scripts/build-images.mjs — le principe
const PROFILE = {
  avif:   { quality: 55, effort: 3 },
  webp:   { quality: 80 },
  widths: { grille: [400, 800, 1200], modale: [1600] },
}
const profileHash = sha256(JSON.stringify(PROFILE)).slice(0, 8)

for (const master of masters) {
  const h = sha256(master)                              // hash du contenu
  for (const { w, fmt } of variantes) {
    const out = `.cache/images/${h}-${profileHash}-w${w}.${fmt}`
    if (!exists(out))                                   // seul le neuf est encodé
      await sharp(master).rotate().resize(w, null, { withoutEnlargement: true })
        .toFormat(fmt, PROFILE[fmt]).toFile(out)
  }
}
```

Changer un réglage invalide alors proprement tout le cache — comportement voulu.
Ajouter une photo à un catalogue de mille, c'est 6 encodages, pas 6000.

Autres exigences du script :

- `.rotate()` pour respecter l'orientation EXIF, `withoutEnlargement` pour ne jamais
  agrandir un master trop petit.
- Un fichier de 0 octet ou illisible par sharp → message explicite et `exit 1`, afin que
  la CI échoue **avant** le déploiement.
- Publication sous `public/images/galerie/<stem>.<hash12>.w<W>.<ext>` — nom immuable, donc
  cache HTTP long sans risque. Purge des orphelins du dossier public.
- Manifest `app/assets/generated/images-manifest.json` : par master, le hash, les
  dimensions intrinsèques (ratio connu → pas de layout shift) et la liste des variantes.
- Statistiques en sortie : encodées vs servies du cache, temps mur, temps moyen par
  variante, poids total par format comparé au poids des masters.

Quotas : le cache Actions plafonne à **10 Go par dépôt**, éviction des entrées inutilisées
depuis plus de 7 jours. Un projet en sommeil réencode tout à la build suivante.

## Publier une photo

```bash
pnpm photo:add ~/Exports/DSC03412.jpg \
  --description "Martin-pêcheur en vol" \
  --categorie bird --lieu "Étang de la Gruère"
```

Le script redimensionne l'export en master 3000 px si nécessaire, l'envoie par SSH dans le
dossier privé, écrit la fiche dans `content/photos/`, commit et pousse. Le déploiement part
tout seul.

Catégories existantes : `bird`, `mammal`, `insect`, `reptile`, `paysage`.

## Le workflow de déploiement

```yaml
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
  with: { node-version: 24, cache: pnpm }   # Nuxt 4.4 exige >=22.12 ou >=24.11
- run: pnpm install --frozen-lockfile

# 0 · garde-fou : --delete sur le mauvais chemin efface le site en production
- name: Vérifier la cible de déploiement
  env: { DEPLOY_PATH: "${{ secrets.DEPLOY_PATH }}" }
  run: |
    [[ "$DEPLOY_PATH" == *preprod* ]] \
      || { echo "::error::DEPLOY_PATH inattendu — abandon"; exit 1; }

# 1 · masters : le cache évite de tout retélécharger
#     À l'échelle (>200 photos) c'est le premier poste à couper : on sauvegarde
#     l'intégralité des masters à chaque run, contre un plafond de 10 Go par dépôt.
- uses: actions/cache@v4
  with:
    path: masters
    key: src-${{ hashFiles('content/photos/**') }}
    restore-keys: src-
- run: rsync -az $USER@$HOST:~/masters/ masters/

# 2 · variantes : seul le neuf est encodé
- uses: actions/cache@v4
  with:
    path: .cache/images
    key: img-${{ hashFiles('content/photos/**') }}
    restore-keys: img-
- run: node scripts/build-images.mjs

# 3 · build puis déploiement (séquentiel : pas de rsync si generate échoue)
- run: pnpm generate
- run: rsync -az --delete .output/public/ $USER@$HOST:$DEPLOY_PATH/
```

**Détail qui compte :** les deux caches sont indexés sur `content/photos/**`, pas sur les
masters. Les fiches sont dans le dépôt, donc leur hash est connu *avant* tout
téléchargement — sinon il faudrait télécharger pour savoir quoi ne pas télécharger.

Une entrée de cache GitHub étant **immuable**, la clé doit changer à chaque photo ajoutée.
C'est le `restore-keys` en préfixe qui permet de récupérer le cache précédent, celui qui
contient déjà l'essentiel du travail. Éditer une description invalide la clé mais ne
réencode rien : le préfixe restaure les variantes, le script les trouve et les saute.

**Le tout premier déploiement se fait en `--dry-run`.** `rsync -az --delete` vers un chemin
erroné efface le site PHP vivant, sans corbeille. C'est le risque à plus grand rayon
d'impact de toute la migration.

Secrets : `SSH_PRIVATE_KEY`, `SSH_HOST`, `SSH_USER`, `SSH_KNOWN_HOSTS`, `DEPLOY_PATH`.
La clé publique est déposée côté Infomaniak via le manager.

Le `.htaccess` ne sert plus qu'à trois choses : `DirectoryIndex`, cache long et `immutable`
sur les assets aux noms hashés, redirection HTTPS.

## SEO

- **`site.url` est obligatoire** pour `@nuxtjs/seo` : sans lui, sitemap et URL canoniques
  sortent en relatif ou en `localhost`.
- **Valeur distincte entre préprod et production**, sinon la préprod publie un sitemap
  pointant vers le domaine principal. Prévoir un `robots.txt` bloquant sur le sous-domaine
  de test pour éviter qu'il ne soit indexé.
- **`/` et `/accueil` servent le même contenu.** C'est déjà le cas aujourd'hui dans
  `index.php`, sans balise canonique — donc du contenu dupliqué en production. À corriger
  pendant la migration : `/` canonique, `/accueil` conservée pour les liens existants avec
  un `<link rel="canonical">` vers `/`. Pas de redirection côté client : sur un site
  statique elle coûte un aller-retour et brouille l'indexation.

## Arborescence cible

```
Site-Photo/                    ← quelques Mo, texte uniquement
├─ content/
│  └─ photos/                  une fiche YAML par photo
├─ app/                        srcDir Nuxt 4
│  ├─ app.vue
│  ├─ error.vue                404
│  ├─ pages/
│  │  ├─ index.vue             /  (canonique)
│  │  ├─ accueil.vue           /accueil  (conservée, canonical → /)
│  │  ├─ galerie.vue
│  │  └─ mentions-legales.vue
│  ├─ components/
│  │  ├─ GalerieGrille.vue     grille + filtres par catégorie
│  │  ├─ GalerieModale.vue     remplace les 170 lignes de galerie.js
│  │  └─ SiteHeader.vue
│  └─ assets/
│     ├─ css/style.css         repris de l'existant
│     └─ generated/            manifest d'images (ignoré par Git)
├─ public/images/galerie/      variantes publiées (ignoré par Git)
├─ scripts/
│  ├─ ajouter-photo.mjs        publication depuis la machine locale
│  └─ build-images.mjs         encodage idempotent, cache contenu + profil
├─ .github/workflows/deploy.yml
├─ content.config.ts
└─ nuxt.config.ts

Sur le serveur Infomaniak :
~/masters/galerie/             hors racine web — non servi par Apache
~/web/                         production (site PHP aujourd'hui)
~/<preprod>/                   cible de la phase 1
```

**Pourquoi `app/` :** le `pages/` legacy en PHP entrerait en collision avec le `pages/` de
Nuxt. `app/` est le `srcDir` par défaut de Nuxt 4, ce qui règle le problème sans
configuration. Écart assumé pendant la cohabitation, résorbable en fin de migration.

## Configuration du dépôt

`.gitignore` — deux corrections nécessaires :

- **retirer `*.lock`** : il exclurait `pnpm-lock.yaml`, ce qui casse
  `pnpm install --frozen-lockfile` en CI ;
- **ajouter** `.nuxt/`, `.output/`, `.cache/`, `masters/`, `public/images/galerie/`,
  `app/assets/generated/` ;
- **conserver `*.jpg` et `*.webp`** — c'est le garde-fou « jamais d'image commitée ».

`package.json` : `engines.node` doit rester `>=22.12` (l'exigence réelle de Nuxt 4.4), pas
`>=24.11` — inutile de bloquer une machine en Node 22 LTS. La CI utilise Node 24.

## Ce qui disparaît

- `index.php` — routeur maison en `switch`, remplacé par le routing par fichiers
- `layout.php` — devient `app.vue` + composants
- `admin/` — les 7 fichiers PHP du back-office, et la protection de répertoire qui va avec
- `docker-compose.yml` — MySQL et phpMyAdmin n'étaient utilisés par aucune ligne de code
- `src/php/metadonnees.json` — remplacé par la collection `@nuxt/content`
- `src/js/galerie.js` — filtre et modale deviennent du Vue réactif
- `src/img/galerie/` — les originaux sortent du dépôt et de l'espace public

## Ce qu'on corrige au passage

| Problème actuel | Résolution |
|---|---|
| Back-office exposé | Protégé par `admin/auth.php` (hors dépôt) et par la protection de répertoire Infomaniak. Après migration, plus rien à protéger. |
| Upload sans validation | `upload.php` accepte n'importe quelle extension. Sans conséquence derrière un mot de passe, mais la surface disparaît. |
| Chemins JSON incohérents | `upload.php` écrivait dans `admin/`, `dashboard.php` lisait dans `src/php/` — les uploads n'apparaissaient jamais. |
| `DSC00146.webp` à 0 octet | Le script d'encodage échoue proprement sur fichier invalide. |
| Route `/contact` morte | `index.php` pointait vers un fichier inexistant. Le lien va vers le sous-domaine dédié. |
| `/` et `/accueil` dupliqués | Balise canonique (voir section SEO). |
| Originaux exposés | Les fichiers de 8 à 22 Mo quittent l'espace public. |

## Plan de migration

**Phase 1 — Squelette sur un sous-domaine de préprod.** Nuxt, dossier de masters sur le
serveur, pipeline d'images avec cache, workflow de déploiement.

Ordre imposé pour la mesure : **générer d'abord les masters 3000 px** à partir des 21 JPG
locaux, *puis* mesurer l'encodage sur eux. Mesurer directement sur les originaux de 8 à
22 Mo donnerait un chiffre inexploitable — sharp décode ~4× plus de pixels, et le décodage
domine le temps total. Cette génération de masters est de toute façon le one-shot
nécessaire pour peupler `~/masters/galerie/`.

**Phase 2 — Contenu, galerie, SEO.** Migration des photos et métadonnées, portage de la
grille, des filtres et de la modale en Vue, puis sitemap et métadonnées sociales.
Réconcilier au passage les fiches de `metadonnees.json` avec les 21 fichiers réellement
présents — il y a des orphelins d'un côté ou de l'autre.

**Phase 3 — Bascule.** Le domaine principal pointe vers le nouveau site. Les URL sont
conservées à l'identique, aucune redirection à gérer. Suppression du legacy PHP, puis
purge éventuelle de l'historique Git.

**Phase 4 — CMS, si besoin.** Uniquement pour publier sans la machine locale. Il faudra
alors une API S3 côté médias (kDrive ou stockage objet) : un CMS web ne peut pas déposer
par SSH. Sveltia CMS gère nativement le stockage de médias externe.

## Points de vigilance

- **Pas de `window` ni `document` hors de `onMounted`** — le code s'exécute d'abord au
  build, sans navigateur. Seul vrai écart avec le Vue classique.
- **`rsync --delete` vers un mauvais chemin efface la production.** Garde-fou dans le
  workflow, `--dry-run` au premier déploiement.
- **Le cache d'images doit inclure le hash du profil d'encodage**, sinon les changements de
  réglage sont silencieusement ignorés.
- **Les masters ne sont pas une sauvegarde** — dérivés du catalogue et régénérables, mais
  une copie unique sur le serveur reste une copie unique.
- **Prévoir une page 404** : `app/error.vue`.
- **Le cache Actions s'évapore après 7 jours d'inactivité.**
