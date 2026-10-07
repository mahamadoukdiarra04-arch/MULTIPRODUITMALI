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
MULTIPRODUIT_BOOTSTRAP_ADMIN_PASSWORD=mot-de-passe-initial-d-au-moins-12-caracteres
MULTIPRODUIT_BOOTSTRAP_ADMIN_NAME=Équipe Multiproduit Mali
```

Après la première connexion réussie, supprimer `MULTIPRODUIT_BOOTSTRAP_ADMIN_PASSWORD` dans hPanel, puis redéployer l’application. Le compte déjà créé dans MySQL reste utilisable.

## Médias

L’interface permet de préparer des publications avec images ou vidéos. Les fichiers sont envoyés directement vers Cloudinary après la configuration suivante dans hPanel :

```text
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Sans ces variables, les contenus existants restent consultables, mais l’import de nouveaux médias est volontairement désactivé.

## Modération

Les visiteurs peuvent commenter sans compte. Depuis le back-office, l’équipe peut visualiser l’impact d’une publication, publier, archiver et modérer les commentaires signalés.

## Mise en ligne

Les réglages complets de l’application Hostinger sont documentés dans `docs/DEPLOIEMENT_HOSTINGER.md`. Les secrets ne doivent jamais être ajoutés au dépôt GitHub.
