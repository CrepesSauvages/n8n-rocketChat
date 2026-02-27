# n8n-nodes-rocketchat-extended

Community node n8n pour des opérations Rocket.Chat avancées : gestion complète des canaux et messages (threads, réactions, messages programmés, etc.).

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
| Get Members | Lister les membres d'un channel (paginé) |
| Set Topic | Définir le sujet du channel |
| Set Description | Définir la description du channel |
| Set Read Only | Activer/désactiver le mode lecture seule |
| Invite | Inviter un utilisateur dans un channel |
| Kick | Retirer un utilisateur d'un channel |
| Set Role | Ajouter/retirer un rôle (Owner, Moderator) |

### 💬 Resource: Message
| Opération | Description |
|-----------|-------------|
| Send | Envoyer un message (avec alias, emoji, avatar, attachments) |
| Edit | Modifier un message existant |
| Delete | Supprimer un message |
| Pin / Unpin | Épingler ou désépingler un message |
| React | Ajouter ou retirer une réaction emoji |
| Star / Unstar | Ajouter ou retirer une étoile |
| Reply (Thread) | Répondre dans un thread |
| Get Thread Messages | Récupérer les messages d'un thread (paginé) |
| Search | Rechercher des messages dans un channel (paginé) |
| Get History | Récupérer l'historique des messages (paginé, avec filtres de dates) |
| Schedule | Programmer un message pour envoi différé |

### Fonctionnalités transversales
- **Public Channel / Private Group** : switch transparent entre les deux types
- **Pagination automatique** : récupérer tous les résultats ou limiter
- **Continue On Fail** : support natif du toggle n8n
- **Blocs interactifs** : attachments JSON pour boutons/menus

## Installation

### Dans n8n (self-hosted)

```bash
# Depuis le dossier d'installation n8n
cd ~/.n8n
npm install /chemin/vers/n8n-nodes-rocketchat-extended

# Ou depuis npm (si publié)
npm install n8n-nodes-rocketchat-extended
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
│       ├── RocketChatExtended.node.ts         # Node principal (routing)
│       ├── GenericFunctions.ts                # Helpers API + pagination
│       └── descriptions/
│           ├── ChannelDescription.ts          # UI fields pour Channel
│           └── MessageDescription.ts          # UI fields pour Message
├── package.json
└── tsconfig.json
```

## API Rocket.Chat

Ce node utilise l'API REST v1 de Rocket.Chat. Documentation officielle :
- https://developer.rocket.chat/reference/api/rest-api

## Licence

MIT

