# Site-Photo — contexte projet

Site vitrine de photographie animalière de Brendan Fleurdelys (brendanfleurdelys.ch).
**Migration en cours : PHP vanilla → Nuxt 4 en génération statique.**

Voir `ARCHITECTURE.md` pour le détail complet, les justifications et le plan de migration.

## Décisions verrouillées

Ne pas les remettre en question sans demande explicite — elles ont été arbitrées.

- **Nuxt 4 (Vue 3), rendu SSG** via `nuxt generate`. Pas de SSR, pas de React.
- **Structure `app/`** (srcDir Nuxt 4) — le `pages/` legacy en PHP entrerait en collision
  avec celui de Nuxt. Écart assumé pendant la cohabitation.
- **Contenu** dans `@nuxt/content` v3, collection `photos` typée, fiches YAML.
  Catégories : `bird`, `mammal`, `insect`, `reptile`, `paysage`.
- **Les images ne sont JAMAIS commitées.** Les masters vivent dans `~/masters/galerie/`
  sur le serveur Infomaniak, hors racine web. Le dépôt ne contient que du texte.
- **Encodage découplé de la prérendue Nuxt** : `scripts/build-images.mjs`, idempotent,
  exécuté avant `nuxt generate`.
- **Publication par script local** (`scripts/ajouter-photo.mjs`), pas de CMS.
- **Déploiement** : GitHub Actions → `lftp mirror --delete` en FTPS. Deux comptes FTP
  restreints chacun à leur dossier (site préprod, masters) — Infomaniak ne gère pas les
  clés SSH, aucun accès SSH en CI. Cache Actions indexé sur
  `content/photos/**` (les fiches sont dans le dépôt, donc leur hash est connu avant tout
  téléchargement des masters).
- **URL conservées à l'identique** : `/accueil`, `/galerie`, `/mentions-legales`.

## Règles non négociables

Ces quatre points ont chacun causé ou éviteront un défaut réel. Les respecter tels quels.

1. **La clé de cache d'images inclut le hash du profil d'encodage**, pas seulement le
   sha256 du master. Sans ça, changer `quality`, `effort` ou ajouter une largeur resservira
   silencieusement les anciennes variantes.
2. **Le `--delete` du déploiement ne peut jamais atteindre la production.** La publication
   passe par un compte FTP restreint au dossier du site préprod (seule restriction par
   dossier possible chez Infomaniak), et le workflow vérifie un marqueur `.preprod-cible`
   sur la cible avant toute écriture. `--dry-run` au premier déploiement.
3. **Une variante 1600 px est produite dès la phase 1** pour la modale plein écran, en AVIF
   *et* en WebP. Sans elle, phase 2 impose de tout réencoder.
4. **Ne jamais ajouter de binaire lourd au dépôt.** `*.jpg` et `*.webp` restent dans
   `.gitignore` comme garde-fou. Pour tester localement, récupérer des masters (scp ou
   client FTP) dans `masters/` (ignoré).

## Hébergement

Hébergement Web mutualisé Infomaniak : Apache, SSH, cron, 250 Go SSD, trafic illimité,
Let's Encrypt. Inclut aussi 1 site Node.js et MariaDB illimité, **volontairement
inutilisés** — réserve pour un éventuel back-office API plus tard.

Le back-office PHP actuel est protégé à deux niveaux : `admin/auth.php` (présent en local,
exclu du dépôt par `.gitignore`) et la protection de répertoire Infomaniak, au niveau
serveur. **Ce n'est pas un sujet de sécurité ouvert** — ne pas conclure le contraire en
lisant le code du dépôt, où le fichier d'authentification est absent.

## Contraintes techniques

- Node ≥ 22.12 ou ≥ 24.11 (exigence Nuxt 4.4). La CI utilise Node 24 ; local en 24.11.1.
  Ne pas durcir `engines` à `>=24.11` sans raison.
- **Pas de `window` ni `document` hors de `onMounted`** — le code s'exécute au build.
- `site.url` est obligatoire pour `@nuxtjs/seo`, avec une **valeur distincte en préprod**,
  plus un `robots.txt` bloquant sur le sous-domaine de test.
- `/` est canonique ; `/accueil` est conservée avec un `<link rel="canonical">` vers `/`.
  Pas de redirection côté client.
- `.gitignore` : `*.lock` a été retiré (il excluait `pnpm-lock.yaml`, ce qui casse
  `pnpm install --frozen-lockfile`).
- Les identifiants FTP (hôte, comptes, mots de passe) sont dans les GitHub Secrets,
  jamais dans le dépôt.
- Publication (`lftp mirror`) uniquement après un `generate` réussi.

## État actuel du dépôt

Le site PHP est encore en production et ne doit pas être cassé pendant la migration.
La cible est validée sur un sous-domaine de préprod avant toute bascule.

L'historique Git pèse ~380 Mo (JPEG commités avant l'ajout du `.gitignore`). Sans effet sur
la CI — `actions/checkout` clone en superficiel. Purge éventuelle avec `git filter-repo`
**après la phase 3**, jamais pendant.

Legacy à supprimer en fin de migration, pas avant :
`index.php`, `layout.php`, `admin/`, `pages/`, `src/`, `docker-compose.yml`,
`Dockerfile`, `php.ini`.

## Tâche en cours — Phase 1

1. Corriger `.gitignore`, initialiser `package.json` et les dépendances
2. `scripts/build-images.mjs` — encodage idempotent, cache contenu + profil
3. Squelette Nuxt minimal (`app/`), `content.config.ts`, 2–3 fiches d'exemple
4. `.github/workflows/deploy.yml`
5. **Générer les masters 3000 px depuis les 21 JPG locaux, PUIS mesurer l'encodage
   sur eux.** Mesurer sur les originaux de 8–22 Mo donnerait un chiffre inexploitable :
   sharp décode ~4× plus de pixels et le décodage domine le temps total. Cette génération
   est de toute façon le one-shot nécessaire pour peupler `~/masters/galerie/`.

Vérifications attendues : second run à 0 encodage (idempotence), fichier 0 octet →
`exit 1` explicite, `pnpm generate` produit les routes et les variantes, `git status`
ne montre aucun binaire.

## Dettes de l'existant à ne pas reporter

- `src/img/galerie/DSC00146.webp` fait 0 octet — image invalide
- 21 JPG en local pour un `metadonnees.json` qui en référence davantage : fiches orphelines
  ou fichiers manquants, à réconcilier en phase 2
- `upload.php` et `dashboard.php` lisent deux chemins différents pour `metadonnees.json`
- `index.php` route `/contact` vers un fichier inexistant ; le lien réel pointe vers
  `contact.brendanfleurdelys.ch`
- `docker-compose.yml` lance MySQL + phpMyAdmin qu'aucune ligne de code n'utilise
