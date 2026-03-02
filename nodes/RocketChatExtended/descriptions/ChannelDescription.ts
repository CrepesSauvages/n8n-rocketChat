import { INodeProperties } from 'n8n-workflow';

export const channelOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['channel'],
			},
		},
		options: [
			{ name: 'Archive', value: 'archive', description: 'Archive a channel', action: 'Archive a channel' },
			{ name: 'Create', value: 'create', description: 'Create a new channel', action: 'Create a channel' },
			{ name: 'Delete', value: 'delete', description: 'Delete a channel', action: 'Delete a channel' },
			{ name: 'Get', value: 'get', description: 'Get information about a channel', action: 'Get a channel' },
			{ name: 'Get Joined', value: 'getJoined', description: 'Get channels the user has joined', action: 'Get joined channels' },
			{ name: 'Get Many', value: 'getAll', description: 'Get many channels', action: 'Get many channels' },
			{ name: 'Get Members', value: 'getMembers', description: 'Get members of a channel', action: 'Get members of a channel' },
			{ name: 'Invite', value: 'invite', description: 'Invite a user to a channel', action: 'Invite a user to a channel' },
			{ name: 'Join', value: 'join', description: 'Join a public channel', action: 'Join a channel' },
			{ name: 'Kick', value: 'kick', description: 'Remove a user from a channel', action: 'Kick a user from a channel' },
			{ name: 'Leave', value: 'leave', description: 'Leave a channel', action: 'Leave a channel' },
			{ name: 'Rename', value: 'rename', description: 'Rename a channel', action: 'Rename a channel' },
			{ name: 'Set Description', value: 'setDescription', description: 'Set the description of a channel', action: 'Set description of a channel' },
			{ name: 'Set Read Only', value: 'setReadOnly', description: 'Set a channel as read only', action: 'Set read only on a channel' },
			{ name: 'Set Role', value: 'setRole', description: 'Set the role of a user in a channel', action: 'Set role of a user in a channel' },
			{ name: 'Set Topic', value: 'setTopic', description: 'Set the topic of a channel', action: 'Set topic of a channel' },
			{ name: 'Unarchive', value: 'unarchive', description: 'Unarchive a channel', action: 'Unarchive a channel' },
		],
		default: 'getAll',
	},
];

export const channelFields: INodeProperties[] = [
	// ── Channel Type (shared across all channel ops) ──
	{
		displayName: 'Channel Type',
		name: 'channelType',
		type: 'options',
		options: [
			{ name: 'Public Channel', value: 'channel' },
			{ name: 'Private Group', value: 'group' },
		],
		default: 'channel',
		description: 'Whether to target a public channel or a private group',
		displayOptions: { show: { resource: ['channel'] } },
	},

	// ── Create ──
	{
		displayName: 'Channel Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		description: 'The name of the channel to create',
		displayOptions: { show: { resource: ['channel'], operation: ['create'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['channel'], operation: ['create'] } },
		options: [
			{ displayName: 'Description', name: 'description', type: 'string', default: '' },
			{ displayName: 'Members (comma-separated usernames)', name: 'members', type: 'string', default: '' },
			{ displayName: 'Read Only', name: 'readOnly', type: 'boolean', default: false },
			{ displayName: 'Topic', name: 'topic', type: 'string', default: '' },
		],
	},

	// ── Room ID (dynamic dropdown) — used by many ops ──
	{
		displayName: 'Specify Room Manually',
		name: 'specifyRoomManually',
		type: 'boolean',
		default: false,
		description: 'Whether to specify the room ID manually instead of selecting from the list',
		displayOptions: {
			show: {
				resource: ['channel'],
				operation: ['archive', 'delete', 'invite', 'join', 'kick', 'leave', 'rename', 'setDescription', 'setReadOnly', 'setRole', 'setTopic', 'unarchive', 'getMembers'],
			},
		},
	},
	{
		displayName: 'Room',
		name: 'roomId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getChannels',
		},
		required: true,
		default: '',
		description: 'Select the channel from the list. Choose from the list, or switch to manual mode to enter the ID.',
		displayOptions: {
			show: {
				resource: ['channel'],
				operation: ['archive', 'delete', 'invite', 'join', 'kick', 'leave', 'rename', 'setDescription', 'setReadOnly', 'setRole', 'setTopic', 'unarchive', 'getMembers'],
				specifyRoomManually: [false],
			},
		},
	},
	{
		displayName: 'Room ID',
		name: 'roomId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the channel/group',
		displayOptions: {
			show: {
				resource: ['channel'],
				operation: ['archive', 'delete', 'invite', 'join', 'kick', 'leave', 'rename', 'setDescription', 'setReadOnly', 'setRole', 'setTopic', 'unarchive', 'getMembers'],
				specifyRoomManually: [true],
			},
		},
	},

	// ── Join — additional fields ──
	{
		displayName: 'Join Code',
		name: 'joinCode',
		type: 'string',
		default: '',
		description: 'The join code if the channel requires one',
		displayOptions: { show: { resource: ['channel'], operation: ['join'] } },
	},

	// ── Get (by ID or Name) ──
	{
		displayName: 'Identify By',
		name: 'identifyBy',
		type: 'options',
		options: [
			{ name: 'Room ID', value: 'roomId' },
			{ name: 'Room Name', value: 'roomName' },
		],
		default: 'roomId',
		displayOptions: { show: { resource: ['channel'], operation: ['get'] } },
	},
	{
		displayName: 'Room ID',
		name: 'roomIdGet',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['channel'], operation: ['get'], identifyBy: ['roomId'] } },
	},
	{
		displayName: 'Room Name',
		name: 'roomNameGet',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['channel'], operation: ['get'], identifyBy: ['roomName'] } },
	},

	// ── Pagination (Get Many, Get Members, Get Joined) ──
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: { show: { resource: ['channel'], operation: ['getAll', 'getMembers', 'getJoined'] } },
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: { show: { resource: ['channel'], operation: ['getAll', 'getMembers', 'getJoined'], returnAll: [false] } },
		typeOptions: { minValue: 1, maxValue: 500 },
		default: 50,
		description: 'Max number of results to return',
	},

	// ── User ID (dynamic dropdown) — Invite, Kick, Set Role ──
	{
		displayName: 'Specify User Manually',
		name: 'specifyUserManually',
		type: 'boolean',
		default: false,
		description: 'Whether to specify the user ID manually instead of selecting from the list',
		displayOptions: { show: { resource: ['channel'], operation: ['invite', 'kick', 'setRole'] } },
	},
	{
		displayName: 'User',
		name: 'userId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getUsers',
		},
		required: true,
		default: '',
		description: 'Select the user from the list. Choose from the list, or switch to manual mode to enter the ID.',
		displayOptions: { show: { resource: ['channel'], operation: ['invite', 'kick', 'setRole'], specifyUserManually: [false] } },
	},
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the user',
		displayOptions: { show: { resource: ['channel'], operation: ['invite', 'kick', 'setRole'], specifyUserManually: [true] } },
	},

	// ── Rename ──
	{
		displayName: 'New Name',
		name: 'newName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['channel'], operation: ['rename'] } },
	},

	// ── Set Description ──
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['channel'], operation: ['setDescription'] } },
	},

	// ── Set Read Only ──
	{
		displayName: 'Read Only',
		name: 'readOnly',
		type: 'boolean',
		required: true,
		default: true,
		displayOptions: { show: { resource: ['channel'], operation: ['setReadOnly'] } },
	},

	// ── Set Role ──
	{
		displayName: 'Role Action',
		name: 'roleAction',
		type: 'options',
		options: [
			{ name: 'Add Moderator', value: 'addModerator' },
			{ name: 'Add Owner', value: 'addOwner' },
			{ name: 'Remove Moderator', value: 'removeModerator' },
			{ name: 'Remove Owner', value: 'removeOwner' },
		],
		default: 'addModerator',
		displayOptions: { show: { resource: ['channel'], operation: ['setRole'] } },
	},

	// ── Set Topic ──
	{
		displayName: 'Topic',
		name: 'topic',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['channel'], operation: ['setTopic'] } },
	},
];
