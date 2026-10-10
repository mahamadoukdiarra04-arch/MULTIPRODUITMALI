# Déploiement Hostinger — Multiproduit Mali

Ce projet est préparé pour une application Node.js Hostinger avec une base MySQL et un stockage média local persistant.

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

MEDIA_STORAGE_DIR=

RESEND_API_KEY=
CONTACT_RECIPIENT_EMAIL=
CONTACT_FROM_EMAIL=
CONTACT_WHATSAPP_NUMBER=22376414349
```

Le mot de passe d’amorçage doit contenir au moins 8 caractères ; aucune règle de casse ou de symbole n’est imposée. Après la première connexion et la création du compte administrateur, supprimer `MULTIPRODUIT_BOOTSTRAP_ADMIN_PASSWORD` des variables Hostinger.

Les médias importés sont enregistrés par défaut dans `~/domains/multiproduitmali.ml/media-uploads`, un emplacement persistant hors du build. Images : 10 Mo maximum ; vidéos MP4/WebM : 20 Mo maximum. Si Hostinger utilise un chemin de compte différent, définir `MEDIA_STORAGE_DIR` sur un dossier persistant hors du dossier de déploiement.

## Services à préparer

1. Créer une base MySQL dans hPanel puis reporter ses cinq paramètres `DB_*`.
2. Ajouter l’adresse et le mot de passe administrateur temporaire dans les variables d’amorçage ; le compte sera créé au premier accès authentifié à MySQL.
3. Configurer l’envoi des formulaires avec Resend (`RESEND_API_KEY`, `CONTACT_RECIPIENT_EMAIL`, `CONTACT_FROM_EMAIL`). Le destinataire du site est `multiproduitmali@gmail.com`.
4. Relier la repository GitHub à l’application Node.js Hostinger si le déploiement automatique est souhaité.

## Domaine

La mise en ligne peut d’abord être validée sur le sous-domaine temporaire Hostinger. Une fois la recette terminée, modifier chez Point.ml les enregistrements DNS ou les serveurs de noms indiqués par Hostinger pour `multiproduitmali.ml`. Aucun code EPP n’est nécessaire tant que le domaine reste chez Point.ml.
