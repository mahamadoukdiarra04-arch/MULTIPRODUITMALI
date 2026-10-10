# Actualités & espace équipe — mise en service Hostinger

## Stockage

Les publications, commentaires, signalements, comptes administrateurs et sessions sont stockés dans MySQL. Les tables sont créées automatiquement au premier accès lorsque les variables `DB_*` sont présentes.

Les publications de démonstration restent visibles tant que la base ne contient pas de contenu. Elles peuvent ensuite être remplacées depuis l’espace interne.

## Accès équipe

- Connexion : `/equipe/connexion`
- Gestion des actualités : `/actualites/back-office`

L’accès repose sur un compte administrateur MySQL et une session HTTP sécurisée. Pour créer le premier compte, renseigner dans hPanel :

```text
MULTIPRODUIT_BOOTSTRAP_ADMIN_EMAIL=adresse-administrateur@domaine.ml
MULTIPRODUIT_BOOTSTRAP_ADMIN_PASSWORD=mot-de-passe-initial-d-au-moins-8-caracteres
MULTIPRODUIT_BOOTSTRAP_ADMIN_NAME=Équipe Multiproduit Mali
```

Après la première connexion réussie, supprimer `MULTIPRODUIT_BOOTSTRAP_ADMIN_PASSWORD` dans hPanel, puis redéployer l’application. Le compte déjà créé dans MySQL reste utilisable.

## Médias

L’interface permet de préparer des publications avec images ou vidéos. Les fichiers sont conservés sur le disque persistant de l’hébergement Hostinger, hors du répertoire remplacé lors des déploiements. La limite est de 10 Mo par image et 20 Mo par vidéo (MP4 ou WebM). `MEDIA_STORAGE_DIR` peut définir explicitement le dossier ; sinon l’application utilise `~/domains/multiproduitmali.ml/media-uploads`.

```text
MEDIA_STORAGE_DIR=
```

Le dossier doit rester disponible après chaque redéploiement. Prévoir une sauvegarde des fichiers en plus de la sauvegarde MySQL.

## Modération

Les visiteurs peuvent commenter sans compte. Depuis le back-office, l’équipe peut visualiser l’impact d’une publication, publier, archiver et modérer les commentaires signalés.

## Mise en ligne

Les réglages complets de l’application Hostinger sont documentés dans `docs/DEPLOIEMENT_HOSTINGER.md`. Les secrets ne doivent jamais être ajoutés au dépôt GitHub.
