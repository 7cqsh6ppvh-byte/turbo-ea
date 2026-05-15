# Paramètres généraux

La page **Paramètres** (**Admin > Paramètres**) fournit une configuration centralisée pour l'apparence de la plateforme, l'e-mail et les bascules de modules.

![Paramètres généraux](../assets/img/fr/28_admin_parametres_general.png)

## Apparence

### Logo

Téléchargez un logo personnalisé qui apparaît dans la barre de navigation supérieure. Formats pris en charge : PNG, JPEG, SVG, WebP, GIF. Cliquez sur **Réinitialiser** pour revenir au logo Turbo EA par défaut.

### Favicon

Téléchargez une icône de navigateur personnalisée (favicon). Le changement prend effet au prochain chargement de page. Cliquez sur **Réinitialiser** pour revenir à l'icône par défaut.

### Devise

Sélectionnez la devise utilisée pour les champs de coût dans toute la plateforme. Cela affecte la manière dont les valeurs de coût sont formatées dans les pages de détail des fiches, les rapports et les exports. Plus de 20 devises sont prises en charge, incluant USD, EUR, GBP, JPY, CNY, CHF, INR, BRL, et plus.

### Format de date

Choisissez la manière dont les dates sont affichées dans toute l'application. Le format sélectionné s'applique aux dates de cycle de vie des fiches, à l'inventaire, aux signatures ADR et SoAW, au registre des risques, aux rapports et tâches PPM, aux versions de flux de processus BPM, aux commentaires, à l'historique, au flux d'activité du tableau de bord, aux notifications et aux pages d'administration. Cinq formats sont proposés avec un aperçu en direct :

- `MM/DD/YYYY` — style US (ex. `04/29/2026`)
- `DD/MM/YYYY` — style européen (ex. `29/04/2026`)
- `YYYY-MM-DD` — ISO 8601 (ex. `2026-04-29`)
- `DD MMM YYYY` — par défaut (ex. `29 avr. 2026`)
- `MMM DD, YYYY` (ex. `avr. 29, 2026`)

Les changements prennent effet immédiatement pour tous — aucun rechargement nécessaire.

### Langues activées

Basculez les langues disponibles pour les utilisateurs dans leur sélecteur de langue. Les huit langues supportées peuvent être activées ou désactivées individuellement :

- English, Deutsch, Français, Español, Italiano, Português, 中文, Русский

Au moins une langue doit rester activée en permanence.

### Début de l'exercice fiscal

Sélectionnez le mois de début de l'exercice fiscal de votre organisation (janvier à décembre). Ce paramètre affecte le regroupement des **lignes budgétaires** dans le module PPM par exercice fiscal. Par exemple, si l'exercice fiscal commence en avril, une ligne budgétaire de juin 2026 appartient à l'EF 2026–2027.

La valeur par défaut est **janvier** (année civile = exercice fiscal).

## E-mail (SMTP)

Configurez la livraison d'e-mails pour les e-mails d'invitation, les notifications d'enquête et autres messages système.

| Champ | Description |
|-------|-------------|
| **Hôte SMTP** | Le nom d'hôte de votre serveur de messagerie (par ex. `smtp.gmail.com`) |
| **Port SMTP** | Port du serveur (généralement 587 pour TLS) |
| **Utilisateur SMTP** | Nom d'utilisateur d'authentification |
| **Mot de passe SMTP** | Mot de passe d'authentification (stocké chiffré) |
| **Utiliser TLS** | Activer le chiffrement TLS (recommandé) |
| **Adresse d'expédition** | L'adresse e-mail de l'expéditeur pour les messages sortants |
| **URL de base de l'application** | L'URL publique de votre instance Turbo EA (utilisée dans les liens des e-mails) |

Après la configuration, cliquez sur **Envoyer un e-mail de test** pour vérifier que les paramètres fonctionnent correctement.

!!! note
    L'e-mail est optionnel. Si le SMTP n'est pas configuré, les fonctionnalités qui envoient des e-mails (invitations, notifications d'enquête) passeront gracieusement la livraison par e-mail.

## Module BPM

Activez ou désactivez le module **Gestion des processus métier**. Lorsqu'il est désactivé :

- L'élément de navigation **BPM** est masqué pour tous les utilisateurs
- Les fiches Processus Métier restent dans la base de données mais les fonctionnalités spécifiques au BPM (éditeur de flux de processus, tableau de bord BPM, rapports BPM) ne sont pas accessibles

Ceci est utile pour les organisations qui n'utilisent pas le BPM et souhaitent une expérience de navigation plus épurée.

## Module PPM

Activez ou désactivez le module **Gestion de portefeuille de projets** (PPM). Lorsqu'il est désactivé :

- L'élément de navigation **PPM** est masqué pour tous les utilisateurs
- Les fiches Initiative restent dans la base de données mais les fonctionnalités spécifiques au PPM (rapports de statut, suivi budgétaire et des coûts, registre des risques, tableau de tâches, diagramme de Gantt) ne sont pas accessibles

Lorsqu'il est activé, les fiches Initiative disposent d'un onglet **PPM** dans leur vue de détail et le tableau de bord du portefeuille PPM est disponible dans la navigation principale. Voir [Gestion de portefeuille de projets](../guide/ppm.md) pour le guide complet des fonctionnalités.

## Module GRC

Activez ou désactivez le module **Gouvernance, Risque et Conformité** (GRC). Lorsqu'il est désactivé :

- L'élément de navigation **GRC** est masqué pour tous les utilisateurs
- L'espace `/grc` (principes de Gouvernance et ADRs, registre des risques, constats de conformité) devient inaccessible et affiche le placeholder standard « module désactivé » pour toute personne arrivant par un lien direct
- Les onglets **Risques** et **Conformité** dans le détail des fiches sont masqués, afin que les fiches individuelles ne fassent plus apparaître de données GRC non plus
- Les risques et les constats de conformité restent dans la base de données — les permissions sous-jacentes `risks.*` et `security_compliance.*` sont inchangées, de sorte que les données sont préservées et réapparaissent telles quelles si le module est réactivé

Voir le [guide GRC](../guide/grc.md) pour la référence complète des fonctionnalités.
