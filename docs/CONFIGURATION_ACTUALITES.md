# Actualités & événements — mise en service

## Stockage

Le site déclare maintenant le binding D1 `DB` dans `.openai/hosting.json`. La migration à appliquer est `drizzle/0000_shocking_loki.sql`. Les tables sont également initialisées de manière sûre au premier accès local pour faciliter l’aperçu.

Les publications de démonstration se créent une seule fois sur une base vide. Elles sont modifiables ou remplaçables dans `/actualites/back-office`.

## Accès équipe

L’espace interne est `/actualites/back-office`. Il utilise l’identification de l’environnement Sites, puis vérifie côté serveur la variable secrète suivante :

```text
MULTIPRODUIT_EDITOR_EMAILS=prenom.nom@entreprise.ml,autre.membre@entreprise.ml
```

Sans cette liste, aucune adresse n’obtient l’accès ou le badge `ÉQUIPE MULTIPRODUIT MALI`. Elle ne doit pas être exposée dans le navigateur ni enregistrée dans le dépôt.

## Traduction automatique

Le site détecte la langue des commentaires et conserve toujours le message source. Une traduction n’est déclenchée qu’au clic, puis elle est enregistrée dans D1 pour les demandes suivantes.

Avant la mise en ligne, connecter un service de traduction français–anglais via ces variables secrètes :

```text
TRANSLATION_API_URL=https://votre-service-de-traduction/translate
TRANSLATION_API_TOKEN=jeton-optionnel
```

Le service doit accepter un `POST` JSON de la forme :

```json
{ "q": "Texte du commentaire", "source": "fr", "target": "en", "format": "text" }
```

et retourner l’un des champs texte `translatedText`, `translation` ou `text`. Tant qu’un service n’est pas configuré, le bouton indique clairement que la traduction automatique doit être connectée ; le commentaire original reste consultable.
