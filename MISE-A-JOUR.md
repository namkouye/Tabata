# Publier une mise à jour

1. Modifie ce que tu veux (`index.html`, `bell.wav`, etc.).
2. Ouvre `version.js` et change le numéro : `1.0.0` devient `1.0.1`.
3. Envoie les fichiers modifiés **et `version.js`** sur GitHub (Add file → Upload files → Commit changes).

C'est tout : au prochain lancement de l'app (ou au retour dessus), le téléphone détecte la nouvelle version,
la télécharge en arrière-plan et s'y met tout seul. Une séance en cours n'est jamais interrompue : la mise à jour
s'installe quand tu reviens à l'écran des réglages.

Sans changer le numéro dans `version.js`, les téléphones ne se mettent PAS à jour.

Un bouton « Vérifier les mises à jour » est en bas de l'écran des réglages pour forcer la vérification.
