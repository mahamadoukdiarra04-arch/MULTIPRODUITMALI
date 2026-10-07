# Déploiement Hostinger — Multiproduit Mali

Ce projet est préparé pour une application Node.js Hostinger avec une base MySQL et Cloudinary pour les médias éditoriaux.

## Configuration de l’application

- Version de Node.js : 22 ou plus récente
- Commande de construction : `npm run build:hostinger`
- Commande de démarrage : `npm run start:hostinger`
- Dossier du dépôt : racine du projet

## Variables d’environnement

À créer dans hPanel, sans les enregistrer dans Git :

```text
NODE_ENV=production
DB_HOST=
DB_PORT=3306
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_CONNECTION_LIMIT=8

MULTIPRODUIT_BOOTSTRAP_ADMIN_EMAIL=
MULTIPRODUIT_BOOTSTRAP_ADMIN_PASSWORD=
MULTIPRODUIT_BOOTSTRAP_ADMIN_NAME=Équipe Multiproduit Mali

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

RESEND_API_KEY=
CONTACT_RECIPIENT_EMAIL=
CONTACT_FROM_EMAIL=
CONTACT_WHATSAPP_NUMBER=22376414349
```

Le mot de passe d’amorçage doit contenir au moins 12 caractères. Après la première connexion et la création du compte administrateur, supprimer `MULTIPRODUIT_BOOTSTRAP_ADMIN_PASSWORD` des variables Hostinger.

## Services à préparer

1. Créer une base MySQL dans hPanel puis reporter ses cinq paramètres `DB_*`.
2. Créer le compte Cloudinary gratuit et reporter les trois paramètres `CLOUDINARY_*`.
3. Ajouter l’adresse administrateur dans les variables d’amorçage.
4. Configurer l’envoi des formulaires avec Resend lorsque le domaine est relié.
5. Relier le dépôt GitHub privé à l’application Node.js Hostinger.

## Domaine

La mise en ligne peut d’abord être validée sur le sous-domaine temporaire Hostinger. Une fois la recette terminée, modifier chez Point.ml les enregistrements DNS ou les serveurs de noms indiqués par Hostinger pour `multiproduitmali.ml`. Aucun code EPP n’est nécessaire tant que le domaine reste chez Point.ml.
