import { INodeProperties } from 'n8n-workflow';

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
			{ name: 'Get History', value: 'getHistory', description: 'Get message history from a channel', action: 'Get message history' },
			{ name: 'Get Thread Messages', value: 'getThreadMessages', description: 'Get messages from a thread', action: 'Get thread messages' },
			{ name: 'Pin', value: 'pin', description: 'Pin a message', action: 'Pin a message' },
			{ name: 'React', value: 'react', description: 'Add or remove a reaction to a message', action: 'React to a message' },
			{ name: 'Reply (Thread)', value: 'replyThread', description: 'Reply to a message in a thread', action: 'Reply in a thread' },
			{ name: 'Schedule', value: 'schedule', description: 'Schedule a message to be sent later', action: 'Schedule a message' },
			{ name: 'Search', value: 'search', description: 'Search for messages in a channel', action: 'Search messages' },
			{ name: 'Send', value: 'send', description: 'Send a message to a channel', action: 'Send a message' },
			{ name: 'Star', value: 'star', description: 'Star a message', action: 'Star a message' },
			{ name: 'Unpin', value: 'unpin', description: 'Unpin a message', action: 'Unpin a message' },
			{ name: 'Unstar', value: 'unstar', description: 'Unstar a message', action: 'Unstar a message' },
		],
		default: 'send',
	},
];

export const messageFields: INodeProperties[] = [
	// Shared Room ID
	{
		displayName: 'Room ID',
		name: 'roomId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the channel/group',
		displayOptions: { show: { resource: ['message'], operation: ['send', 'edit', 'delete', 'getHistory', 'search', 'replyThread', 'schedule'] } },
	},
	// Shared Message ID
	{
		displayName: 'Message ID',
		name: 'messageId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the message',
		displayOptions: { show: { resource: ['message'], operation: ['edit', 'delete', 'pin', 'unpin', 'react', 'star', 'unstar'] } },
	},
	// Send / Reply / Schedule text
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
	// Send Additional Fields
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
	// Edit text
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
	// React
	{
		displayName: 'Emoji',
		name: 'emoji',
		type: 'string',
		required: true,
		default: '',
		placeholder: ':thumbsup:',
		description: 'The emoji to react with (e.g. :thumbsup:)',
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
	// Reply Thread
	{
		displayName: 'Thread Message ID',
		name: 'tmid',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the parent message (thread root) to reply to',
		displayOptions: { show: { resource: ['message'], operation: ['replyThread'] } },
	},
	// Get Thread Messages
	{
		displayName: 'Thread Message ID',
		name: 'tmidThread',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the parent message (thread root)',
		displayOptions: { show: { resource: ['message'], operation: ['getThreadMessages'] } },
	},
	// Search
	{
		displayName: 'Search Text',
		name: 'searchText',
		type: 'string',
		required: true,
		default: '',
		description: 'The text to search for in messages',
		displayOptions: { show: { resource: ['message'], operation: ['search'] } },
	},
	// Get History Options
	{
		displayName: 'Additional Options',
		name: 'historyOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { resource: ['message'], operation: ['getHistory'] } },
		options: [
			{ displayName: 'Inclusive', name: 'inclusive', type: 'boolean', default: false },
			{ displayName: 'Latest (ISO Date)', name: 'latest', type: 'string', default: '', placeholder: '2026-01-01T00:00:00.000Z' },
			{ displayName: 'Oldest (ISO Date)', name: 'oldest', type: 'string', default: '', placeholder: '2025-01-01T00:00:00.000Z' },
		],
	},
	// Schedule
	{
		displayName: 'Scheduled Date',
		name: 'scheduledAt',
		type: 'dateTime',
		required: true,
		default: '',
		description: 'The date and time to send the message (ISO 8601)',
		displayOptions: { show: { resource: ['message'], operation: ['schedule'] } },
	},
	// Pagination
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
