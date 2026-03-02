# n8n-nodes-rocketchat-extended

Community node n8n pour des opérations Rocket.Chat avancées : gestion complète des canaux et messages (threads, réactions, messages programmés, upload de fichiers, et plus).

[![Node.js CI](https://github.com/CrepesSauvages/n8n-rocketChat/actions/workflows/node.js.yml/badge.svg)](https://github.com/CrepesSauvages/n8n-rocketChat/actions/workflows/node.js.yml)

## Fonctionnalités

### 🏠 Resource: Channel
| Opération | Description |
|-----------|-------------|
| Create | Créer un channel public ou group privé |
| Delete | Supprimer un channel |
| Archive / Unarchive | Archiver ou désarchiver un channel |
| Rename | Renommer un channel |
| Get | Obtenir les infos d'un channel (par ID ou nom) |
| Get Many | Lister tous les channels (paginé) |
| Get Joined | Lister les channels auxquels l'utilisateur a rejoint (paginé) |
| Get Members | Lister les membres d'un channel (paginé) |
| Join | Rejoindre un channel public (avec code optionnel) |
| Leave | Quitter un channel |
| Set Topic | Définir le sujet du channel |
| Set Description | Définir la description du channel |
| Set Read Only | Activer/désactiver le mode lecture seule |
| Invite | Inviter un utilisateur dans un channel |
| Kick | Retirer un utilisateur d'un channel |
| Set Role | Ajouter/retirer un rôle (Owner, Moderator) |

### 💬 Resource: Message
| Opération | Description |
|-----------|-------------|

### ✉️ Resource: Direct Message
| Opération | Description |
|-----------|-------------|
| Create | Créer une conversation DM (1-to-1 ou multi-party) |
| Close | Fermer une conversation DM |
| Open | Ré-ouvrir une conversation DM fermée |
| Send | Envoyer un message dans un DM (alias, emoji, thread) |
| Get Messages | Récupérer les messages d'un DM (paginé) |
| Get Many | Lister toutes les conversations DM (paginé) |
| Members | Lister les membres d'un DM room (paginé) |
| Set Topic | Définir le sujet d'un DM room |
| Send | Envoyer un message (avec alias, emoji, avatar, attachments) |
| Edit | Modifier un message existant |
| Delete | Supprimer un message |
| Get | Récupérer un message par son ID |
| Pin / Unpin | Épingler ou désépingler un message |
| React | Ajouter ou retirer une réaction emoji (auto-format `:emoji:`) |
| Star / Unstar | Ajouter ou retirer une étoile |
| Follow / Unfollow | Suivre ou ne plus suivre un message/thread |
| Report | Signaler un message aux modérateurs |
| Reply (Thread) | Répondre dans un thread |
| Get Thread Messages | Récupérer les messages d'un thread (paginé) |
| Search | Rechercher des messages dans un channel (paginé) |
| Get History | Récupérer l'historique des messages (paginé, avec filtres de dates) |
| Schedule | Programmer un message pour envoi différé |
| Upload File | Uploader un fichier dans un channel (via binary data n8n) |

### ✨ Améliorations UX (v0.2.0)
- **Dropdowns dynamiques** : les Room ID et User ID sont proposés via des listes déroulantes (avec fallback "Specify Manually")
- **Erreurs enrichies** : les codes d'erreur Rocket.Chat sont mappés vers des messages lisibles
- **Validation des inputs** : format emoji `:name:` auto-corrigé, validation ISO 8601 pour les dates

### Fonctionnalités transversales
- **Public Channel / Private Group** : switch transparent entre les deux types
- **Pagination automatique** : récupérer tous les résultats ou limiter
- **Continue On Fail** : support natif du toggle n8n
- **Blocs interactifs** : attachments JSON pour boutons/menus

## Installation

### Dans n8n (self-hosted)

```bash
# Depuis GitHub
npm install --prefix /home/pi/n8n-docker/n8n_data/custom \
  github:CrepesSauvages/n8n-rocketChat
```

Puis redémarrer n8n.

### Configuration

1. Dans n8n, aller dans **Credentials** → **New Credential**
2. Chercher **Rocket.Chat Extended API**
3. Remplir :
   - **Server URL** : l'URL de votre instance Rocket.Chat (ex: `https://chat.example.com`)
   - **User ID** : votre User ID Rocket.Chat
   - **Auth Token** : votre Auth Token Rocket.Chat
4. Cliquer sur **Test** pour vérifier la connexion

### Obtenir User ID et Auth Token

Dans Rocket.Chat :
1. Aller dans **Administration** → **Mon compte** → **Sécurité**
2. Ou via l'API : `POST /api/v1/login` avec username/password

## Développement

```bash
# Installer les dépendances
npm install

# Build
npm run build

# Watch mode (développement)
npm run dev
```

## Structure du projet

```
├── credentials/
│   └── RocketChatExtendedApi.credentials.ts   # Auth (User ID + Token + URL)
├── nodes/
│   └── RocketChatExtended/
│       ├── RocketChatExtended.node.ts         # Node principal (routing + loadOptions)
│       ├── GenericFunctions.ts                # Helpers API + pagination + upload + validation
│       └── descriptions/
│           ├── ChannelDescription.ts          # UI fields pour Channel (16 ops)
│           └── MessageDescription.ts          # UI fields pour Message (18 ops)
├── .github/
│   └── workflows/
│       └── node.js.yml                        # CI (Node 18/20/22)
├── package.json
└── tsconfig.json
```

## API Rocket.Chat

Ce node utilise l'API REST v1 de Rocket.Chat. Documentation officielle :
- https://developer.rocket.chat/reference/api/rest-api

## Changelog

### v0.3.0
- **Nouvelle resource : Direct Message** — 8 opérations (Create, Close, Open, Send, Get Messages, Get Many, Members, Set Topic)
- Support DM multi-party (comma-separated usernames)
- Tests DM (11 tests)

### v0.2.0
- **Nouvelles opérations Channel** : Join, Leave, Get Joined
- **Nouvelles opérations Message** : Get, Upload File, Follow, Unfollow, Report
- **Dropdowns dynamiques** : sélection de channels/users via l'API
- **Erreurs enrichies** : mapping des codes d'erreur RC
- **Validation** : emoji auto-format, dates ISO validées
- **CI** : GitHub Actions workflow (Node 18/20/22)

### v0.1.0
- Release initiale : 13 ops Channel + 13 ops Message

## Licence

MIT
