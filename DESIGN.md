# n8n-nodes-rocketchat-extended — Design Document

> **Date** : 2026-02-27
> **Statut** : Validé — Prêt pour implémentation

---

## 1. Résumé

Community node n8n custom qui étend les capacités du node Rocket.Chat officiel avec une gestion complète des **canaux** (publics et privés) et des **messages avancés**.

### Ce qui est construit
- Un unique node `Rocket.Chat Extended` avec deux ressources (Channel, Message)
- Pattern multi-ressources standard n8n (comme Slack, Discord)

### Pourquoi
- Le node officiel n8n ne propose que le chat basique
- Besoin de fonctionnalités avancées : gestion complète des canaux, threads, réactions, messages programmés, etc.

### Pour qui
- Utilisateurs n8n souhaitant automatiser des workflows Rocket.Chat avancés

---

## 2. Contraintes techniques

| Aspect | Choix |
|--------|-------|
| **Auth** | User ID + Auth Token (headers `X-Auth-Token` / `X-User-Id`) |
| **API** | REST v1 (`/api/v1/*`) — compatible toutes versions |
| **Erreurs** | Comportement standard n8n (Continue On Fail toggle) |
| **Pagination** | Automatique avec option "Récupérer tout" (`offset` + `count`) |
| **Langage** | TypeScript (standard n8n community nodes) |
| **Distribution** | Package npm installable dans n8n |

---

## 3. Non-goals

- Gestion des utilisateurs (comptes, rôles globaux)
- Livechat / Omnichannel
- Administration serveur (stats, permissions globales)
- Webhooks / Triggers (events temps réel)

---

## 4. Structure du projet

```
n8n-nodes-rocketchat-extended/
├── package.json
├── tsconfig.json
├── .eslintrc.js
├── credentials/
│   └── RocketChatExtendedApi.credentials.ts
├── nodes/
│   └── RocketChatExtended/
│       ├── RocketChatExtended.node.ts
│       ├── RocketChatExtended.node.json
│       ├── rocketchat.svg
│       ├── GenericFunctions.ts
│       └── descriptions/
│           ├── ChannelDescription.ts
│           └── MessageDescription.ts
└── README.md
```

---

## 5. Credentials

### `RocketChatExtendedApi.credentials.ts`

| Champ | Type | Description |
|-------|------|-------------|
| Server URL | String | URL de l'instance (ex: `https://chat.example.com`) |
| User ID | String | Identifiant utilisateur Rocket.Chat |
| Auth Token | String (password) | Token d'authentification |

- Bouton **Test** : `GET /api/v1/me`

---

## 6. Couche API (`GenericFunctions.ts`)

### `rocketchatApiRequest(method, endpoint, body?, qs?)`
- Construit l'URL : `{serverUrl}/api/v1/{endpoint}`
- Ajoute les headers d'auth
- Gère les erreurs → `NodeApiError`

### `rocketchatApiRequestAllItems(propertyName, method, endpoint, body?, qs?)`
- Pagination automatique via `offset` + `count`
- S'arrête quand `total` est atteint
- `propertyName` = clé du tableau de résultats (ex: `channels`, `messages`)

### Gestion Channels vs Groups
- Dropdown `Type: Public Channel | Private Group`
- Switch transparent des endpoints (`channels.*` ↔ `groups.*`) dans les helpers

---

## 7. Opérations — Ressource Channel

| Opération | Endpoint API | Méthode | Paramètres principaux |
|-----------|-------------|---------|----------------------|
| Create | `/channels.create` | POST | name, members[], readOnly |
| Delete | `/channels.delete` | POST | roomId |
| Archive | `/channels.archive` | POST | roomId |
| Unarchive | `/channels.unarchive` | POST | roomId |
| Rename | `/channels.rename` | POST | roomId, name |
| Get | `/channels.info` | GET | roomId ou roomName |
| Get Many | `/channels.list` | GET | (paginé) |
| Set Topic | `/channels.setTopic` | POST | roomId, topic |
| Set Description | `/channels.setDescription` | POST | roomId, description |
| Set Read Only | `/channels.setReadOnly` | POST | roomId, readOnly |
| Invite | `/channels.invite` | POST | roomId, userId |
| Kick | `/channels.kick` | POST | roomId, userId |
| Set Role | `/channels.addModerator` / `addOwner` / `removeRole` | POST | roomId, userId |
| Get Members | `/channels.members` | GET | roomId (paginé) |

### Notes :
- **Get** : dropdown pour choisir identification par `roomId` ou `roomName`
- **Get Many** : pagination automatique + filtres optionnels
- **Create** : Additional Fields pour `members`, `readOnly`, `description`, `topic`
- **Set Role** : dropdown Owner / Moderator / retirer un rôle
- Tous les endpoints `channels.*` switchent vers `groups.*` si Type = Private Group

---

## 8. Opérations — Ressource Message

| Opération | Endpoint API | Méthode | Paramètres principaux |
|-----------|-------------|---------|----------------------|
| Send | `/chat.sendMessage` | POST | roomId, text, alias, emoji/avatar |
| Send (Attachment) | `/chat.sendMessage` | POST | roomId, text, attachments[] |
| Edit | `/chat.update` | POST | roomId, msgId, text |
| Delete | `/chat.delete` | POST | roomId, msgId |
| Pin | `/chat.pinMessage` | POST | messageId |
| Unpin | `/chat.unPinMessage` | POST | messageId |
| React | `/chat.react` | POST | messageId, emoji, shouldReact |
| Reply (Thread) | `/chat.sendMessage` | POST | roomId, text, tmid |
| Search | `/chat.search` | GET | roomId, searchText (paginé) |
| Get History | `/channels.history` | GET | roomId, latest, oldest (paginé) |
| Get Thread Messages | `/chat.getThreadMessages` | GET | tmid (paginé) |
| Schedule | `/chat.scheduleMessage` | POST | roomId, text, scheduledAt |
| Star | `/chat.starMessage` | POST | messageId |
| Unstar | `/chat.unStarMessage` | POST | messageId |

### Notes :
- **Send** : Additional Fields pour `alias`, `emoji`, `avatar`, `attachments`
- **Reply (Thread)** : Send avec `tmid` — opération séparée pour clarté UX
- **Get History** : filtres `latest`/`oldest` + pagination automatique
- **React** : champ texte emoji + toggle add/remove
- **Schedule** : date picker ISO
- **Blocs interactifs** : via champ JSON dans Additional Fields (YAGNI — builder UI reporté)

---

## 9. Decision Log

| # | Décision | Alternatives considérées | Raison |
|---|----------|--------------------------|--------|
| 1 | **Un seul node multi-ressources** | Deux nodes séparés, monolithique | Pattern standard n8n (Slack, Discord). UX familière. Maintenable. |
| 2 | **Auth par User ID + Token** | Username/Password, OAuth, les trois | Simple, direct, pas de flow OAuth à gérer. Suffisant pour le cas d'usage. |
| 3 | **API REST v1 standard** | Cibler une version spécifique | Compatibilité maximale, API stable. |
| 4 | **Pagination automatique** | Pagination manuelle, pas de pagination | Standard n8n pour gros volumes. Meilleure UX. |
| 5 | **Dropdown Channel/Group type** | Ressources séparées Channel et Group | Les endpoints sont quasi identiques. Un dropdown évite la duplication. |
| 6 | **Reply Thread = opération séparée** | Fusionner avec Send | Clarté UX — l'utilisateur comprend qu'il faut un Thread ID. |
| 7 | **Blocs interactifs = JSON brut** | Builder UI avec formulaire | YAGNI — peu d'utilisateurs en auront besoin immédiatement. Extensible plus tard. |
| 8 | **Descriptions dans fichiers séparés** | Tout dans le node principal | Maintenabilité — ~25 opérations seraient ingérables dans un seul fichier. |

---

## 10. Assumptions

- L'utilisateur a une instance Rocket.Chat fonctionnelle avec les permissions API nécessaires
- Le module est développé en TypeScript (standard n8n community nodes)
- Le module est installable via npm (`npm install n8n-nodes-rocketchat-extended`)
- Les endpoints API REST v1 documentés par Rocket.Chat sont stables et disponibles
- n8n version 1.x+ (support des community nodes)

---

## 11. Risques identifiés

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Certains endpoints peuvent varier entre versions RC | Moyen | Cibler l'API v1 stable, tester sur version récente |
| Messages programmés peuvent ne pas être supportés sur toutes les versions | Faible | Documenter la version minimale requise, gérer l'erreur gracieusement |
| Permissions insuffisantes pour certaines opérations | Moyen | Messages d'erreur clairs via NodeApiError |

---

## 12. Plan d'implémentation (proposé)

### Phase 1 — Fondations
1. Scaffolding du projet (package.json, tsconfig, etc.)
2. Credentials (auth + test de connexion)
3. GenericFunctions (appels API + pagination)

### Phase 2 — Resource Channel
4. Opérations basiques : Create, Get, Get Many, Delete
5. Opérations de gestion : Archive, Unarchive, Rename, Set Topic/Description/ReadOnly
6. Opérations membres : Invite, Kick, Set Role, Get Members
7. Support Groups (switch endpoints)

### Phase 3 — Resource Message
8. Opérations basiques : Send, Edit, Delete
9. Opérations avancées : Pin/Unpin, React, Star/Unstar
10. Threads : Reply, Get Thread Messages
11. Recherche et historique : Search, Get History
12. Schedule message

### Phase 4 — Finitions
13. Tests et validation
14. Documentation README
15. Build et packaging npm
