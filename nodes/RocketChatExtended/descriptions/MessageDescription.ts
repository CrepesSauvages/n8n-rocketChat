import type { INodeProperties } from 'n8n-workflow';

export const messageOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['message'] } },
		options: [
			{ name: 'Delete', value: 'delete', description: 'Delete a message', action: 'Delete a message' },
			{ name: 'Edit', value: 'edit', description: 'Edit a message', action: 'Edit a message' },
			{ name: 'Follow', value: 'follow', description: 'Follow a message or thread', action: 'Follow a message' },
			{ name: 'Get', value: 'get', description: 'Get a single message by ID', action: 'Get a message' },
			{ name: 'Get History', value: 'getHistory', description: 'Get message history from a channel', action: 'Get message history' },
			{ name: 'Get Thread Messages', value: 'getThreadMessages', description: 'Get messages from a thread', action: 'Get thread messages' },
			{ name: 'Pin', value: 'pin', description: 'Pin a message', action: 'Pin a message' },
			{ name: 'React', value: 'react', description: 'Add or remove a reaction to a message', action: 'React to a message' },
			{ name: 'Reply (Thread)', value: 'replyThread', description: 'Reply to a message in a thread', action: 'Reply in a thread' },
			{ name: 'Report', value: 'report', description: 'Report a message to moderators', action: 'Report a message' },
			{ name: 'Schedule', value: 'schedule', description: 'Schedule a message to be sent later', action: 'Schedule a message' },
			{ name: 'Search', value: 'search', description: 'Search for messages in a channel', action: 'Search messages' },
			{ name: 'Send', value: 'send', description: 'Send a message to a channel', action: 'Send a message' },
			{ name: 'Star', value: 'star', description: 'Star a message', action: 'Star a message' },
			{ name: 'Unfollow', value: 'unfollow', description: 'Unfollow a message or thread', action: 'Unfollow a message' },
			{ name: 'Unpin', value: 'unpin', description: 'Unpin a message', action: 'Unpin a message' },
			{ name: 'Unstar', value: 'unstar', description: 'Unstar a message', action: 'Unstar a message' },
			{ name: 'Upload File', value: 'uploadFile', description: 'Upload a file to a channel', action: 'Upload a file' },
		],
		default: 'send',
	},
];

export const messageFields: INodeProperties[] = [

	// ══════════════════════════════════════
	//  Room ID (dynamic dropdown) — shared
	// ══════════════════════════════════════
	{
		displayName: 'Specify Room Manually',
		name: 'specifyRoomManually',
		type: 'boolean',
		default: false,
		description: 'Whether to specify the room ID manually instead of selecting from the list',
		displayOptions: { show: { resource: ['message'], operation: ['send', 'edit', 'delete', 'getHistory', 'search', 'replyThread', 'schedule', 'uploadFile'] } },
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
				resource: ['message'],
				operation: ['send', 'edit', 'delete', 'getHistory', 'search', 'replyThread', 'schedule', 'uploadFile'],
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
				resource: ['message'],
				operation: ['send', 'edit', 'delete', 'getHistory', 'search', 'replyThread', 'schedule', 'uploadFile'],
				specifyRoomManually: [true],
			},
		},
	},

	// ══════════════════════════════════════
	//  Message ID — shared by many ops
	// ══════════════════════════════════════
	{
		displayName: 'Message ID',
		name: 'messageId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the message',
		displayOptions: { show: { resource: ['message'], operation: ['edit', 'delete', 'get', 'pin', 'unpin', 'react', 'star', 'unstar', 'follow', 'unfollow', 'report'] } },
	},

	// ══════════════════════════════════════
	//  Send / Reply / Schedule — text
	// ══════════════════════════════════════
	{
		displayName: 'Text',
		name: 'text',
		type: 'string',
		typeOptions: { rows: 4 },
		required: true,
		default: '',
		description: 'The text content of the message. Supports Markdown.',
		displayOptions: { show: { resource: ['message'], operation: ['send', 'replyThread', 'schedule'] } },
	},

	// ══════════════════════════════════════
	//  Send — Additional Fields
	// ══════════════════════════════════════
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['message'], operation: ['send'] } },
		options: [
			{ displayName: 'Alias', name: 'alias', type: 'string', default: '', description: 'A custom display name for the message sender' },
			{ displayName: 'Attachments (JSON)', name: 'attachments', type: 'json', default: '[]', description: 'Array of attachment objects in JSON format' },
			{ displayName: 'Avatar URL', name: 'avatar', type: 'string', default: '', description: 'URL of an image to use as avatar' },
			{ displayName: 'Emoji', name: 'emoji', type: 'string', default: '', placeholder: ':robot:', description: 'Emoji to use as avatar (e.g. :rocket:)' },
		],
	},

	// ══════════════════════════════════════
	//  Edit — new text
	// ══════════════════════════════════════
	{
		displayName: 'New Text',
		name: 'newText',
		type: 'string',
		typeOptions: { rows: 4 },
		required: true,
		default: '',
		description: 'The new text content for the message',
		displayOptions: { show: { resource: ['message'], operation: ['edit'] } },
	},

	// ══════════════════════════════════════
	//  React — emoji + toggle
	// ══════════════════════════════════════
	{
		displayName: 'Emoji',
		name: 'emoji',
		type: 'string',
		required: true,
		default: '',
		placeholder: ':thumbsup:',
		description: 'The emoji to react with (e.g. :thumbsup:). Colons will be added automatically if missing.',
		displayOptions: { show: { resource: ['message'], operation: ['react'] } },
	},
	{
		displayName: 'Add Reaction',
		name: 'shouldReact',
		type: 'boolean',
		default: true,
		description: 'Whether to add (true) or remove (false) the reaction',
		displayOptions: { show: { resource: ['message'], operation: ['react'] } },
	},

	// ══════════════════════════════════════
	//  Reply Thread — thread msg ID
	// ══════════════════════════════════════
	{
		displayName: 'Thread Message ID',
		name: 'tmid',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the parent message (thread root) to reply to',
		displayOptions: { show: { resource: ['message'], operation: ['replyThread'] } },
	},

	// ══════════════════════════════════════
	//  Get Thread Messages
	// ══════════════════════════════════════
	{
		displayName: 'Thread Message ID',
		name: 'tmidThread',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the parent message (thread root)',
		displayOptions: { show: { resource: ['message'], operation: ['getThreadMessages'] } },
	},

	// ══════════════════════════════════════
	//  Report — description
	// ══════════════════════════════════════
	{
		displayName: 'Report Reason',
		name: 'reportDescription',
		type: 'string',
		typeOptions: { rows: 3 },
		required: true,
		default: '',
		description: 'The reason for reporting this message',
		displayOptions: { show: { resource: ['message'], operation: ['report'] } },
	},

	// ══════════════════════════════════════
	//  Upload File
	// ══════════════════════════════════════
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'The name of the binary property containing the file to upload. Connect a "Read Binary File" or "HTTP Request" node upstream.',
		displayOptions: { show: { resource: ['message'], operation: ['uploadFile'] } },
	},
	{
		displayName: 'Upload Additional Fields',
		name: 'uploadAdditionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['message'], operation: ['uploadFile'] } },
		options: [
			{ displayName: 'Description', name: 'description', type: 'string', default: '', description: 'A description for the uploaded file' },
			{ displayName: 'Thread Message ID', name: 'tmid', type: 'string', default: '', description: 'Upload the file as a reply in a thread' },
		],
	},

	// ══════════════════════════════════════
	//  Search
	// ══════════════════════════════════════
	{
		displayName: 'Search Text',
		name: 'searchText',
		type: 'string',
		required: true,
		default: '',
		description: 'The text to search for in messages',
		displayOptions: { show: { resource: ['message'], operation: ['search'] } },
	},

	// ══════════════════════════════════════
	//  Get History — options
	// ══════════════════════════════════════
	{
		displayName: 'Additional Options',
		name: 'historyOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { resource: ['message'], operation: ['getHistory'] } },
		options: [
			{ displayName: 'Inclusive', name: 'inclusive', type: 'boolean', default: false },
			{ displayName: 'Latest (ISO Date)', name: 'latest', type: 'dateTime', default: '', description: 'End date for the history range' },
			{ displayName: 'Oldest (ISO Date)', name: 'oldest', type: 'dateTime', default: '', description: 'Start date for the history range' },
		],
	},

	// ══════════════════════════════════════
	//  Schedule — date
	// ══════════════════════════════════════
	{
		displayName: 'Scheduled Date',
		name: 'scheduledAt',
		type: 'dateTime',
		required: true,
		default: '',
		description: 'The date and time to send the message (ISO 8601)',
		displayOptions: { show: { resource: ['message'], operation: ['schedule'] } },
	},

	// ══════════════════════════════════════
	//  Pagination — History, Search, Threads
	// ══════════════════════════════════════
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: { show: { resource: ['message'], operation: ['getHistory', 'search', 'getThreadMessages'] } },
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: { show: { resource: ['message'], operation: ['getHistory', 'search', 'getThreadMessages'], returnAll: [false] } },
		typeOptions: { minValue: 1, maxValue: 500 },
		default: 50,
		description: 'Max number of results to return',
	},
];
