import type { INodeProperties } from 'n8n-workflow';

export const dmOperations: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['directMessage'] } },
        options: [
            { name: 'Close', value: 'close', description: 'Close a direct message conversation', action: 'Close a DM' },
            { name: 'Create', value: 'create', description: 'Create a direct message session with a user', action: 'Create a DM' },
            { name: 'Get Messages', value: 'getMessages', description: 'Get messages from a direct message conversation', action: 'Get DM messages' },
            { name: 'Get Many', value: 'getAll', description: 'Get a list of direct message conversations', action: 'Get many DMs' },
            { name: 'Members', value: 'members', description: 'Get members of a direct message room', action: 'Get DM members' },
            { name: 'Open', value: 'open', description: 'Open or re-open a direct message conversation', action: 'Open a DM' },
            { name: 'Send', value: 'send', description: 'Send a message in a direct message conversation', action: 'Send a DM message' },
            { name: 'Set Topic', value: 'setTopic', description: 'Set the topic for a DM room', action: 'Set DM topic' },
            { name: 'Upload File', value: 'uploadFile', description: 'Upload a file to a DM room', action: 'Upload a file in DM' },
        ],
        default: 'send',
    },
];

export const dmFields: INodeProperties[] = [

    // ══════════════════════════════════════
    //  Create — target user(s)
    // ══════════════════════════════════════
    {
        displayName: 'Specify User Manually',
        name: 'specifyDmUserManually',
        type: 'boolean',
        default: false,
        description: 'Whether to specify the username manually instead of selecting from the list',
        displayOptions: { show: { resource: ['directMessage'], operation: ['create'] } },
    },
    {
        displayName: 'User',
        name: 'dmUsername',
        type: 'options',
        typeOptions: {
            loadOptionsMethod: 'getUsers',
        },
        required: true,
        default: '',
        description: 'Select the user to open a DM with',
        displayOptions: { show: { resource: ['directMessage'], operation: ['create'], specifyDmUserManually: [false] } },
    },
    {
        displayName: 'Username(s)',
        name: 'dmUsername',
        type: 'string',
        required: true,
        default: '',
        description: 'Username to open a DM with. For multi-party DMs, use comma-separated usernames.',
        displayOptions: { show: { resource: ['directMessage'], operation: ['create'], specifyDmUserManually: [true] } },
    },
    {
        displayName: 'Exclude Self',
        name: 'excludeSelf',
        type: 'boolean',
        default: false,
        description: 'Whether to exclude the authenticated user from the DM participant list',
        displayOptions: { show: { resource: ['directMessage'], operation: ['create'] } },
    },

    // ══════════════════════════════════════
    //  Room ID — shared by most DM ops
    // ══════════════════════════════════════
    {
        displayName: 'Room ID',
        name: 'roomId',
        type: 'string',
        required: true,
        default: '',
        description: 'The ID of the DM room. Returned by the Create operation.',
        displayOptions: {
            show: {
                resource: ['directMessage'],
                operation: ['close', 'open', 'getMessages', 'members', 'send', 'setTopic', 'uploadFile'],
            },
        },
    },

    // ══════════════════════════════════════
    //  Send — text + additional fields
    // ══════════════════════════════════════
    {
        displayName: 'Text',
        name: 'text',
        type: 'string',
        typeOptions: { rows: 4 },
        required: true,
        default: '',
        description: 'The text content of the message. Supports Markdown.',
        displayOptions: { show: { resource: ['directMessage'], operation: ['send'] } },
    },
    {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: { show: { resource: ['directMessage'], operation: ['send'] } },
        options: [
            { displayName: 'Alias', name: 'alias', type: 'string', default: '', description: 'A custom display name for the message sender' },
            { displayName: 'Emoji', name: 'emoji', type: 'string', default: '', placeholder: ':robot:', description: 'Emoji to use as avatar' },
            { displayName: 'Thread Message ID', name: 'tmid', type: 'string', default: '', description: 'Reply in a thread within this DM' },
        ],
    },

    // ══════════════════════════════════════
    //  Set Topic
    // ══════════════════════════════════════
    {
        displayName: 'Topic',
        name: 'topic',
        type: 'string',
        required: true,
        default: '',
        description: 'The topic for the DM room',
        displayOptions: { show: { resource: ['directMessage'], operation: ['setTopic'] } },
    },

    // ══════════════════════════════════════
    //  Upload File
    // ══════════════════════════════════════
    {
        displayName: 'Input Data Field Name',
        name: 'binaryPropertyName',
        type: 'string',
        default: 'data',
        required: true,
        description: 'The name of the binary field containing the file to be uploaded',
        displayOptions: { show: { resource: ['directMessage'], operation: ['uploadFile'] } },
    },
    {
        displayName: 'Additional Fields',
        name: 'uploadAdditionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: { show: { resource: ['directMessage'], operation: ['uploadFile'] } },
        options: [
            {
                displayName: 'Description',
                name: 'description',
                type: 'string',
                default: '',
                description: 'The description/message to send along with the file',
            },
            {
                displayName: 'Thread Message ID',
                name: 'tmid',
                type: 'string',
                default: '',
                description: 'ID of the thread message to reply to',
            },
        ],
    },

    // ══════════════════════════════════════
    //  Pagination — Get Messages, Get Many, Members
    // ══════════════════════════════════════
    {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        displayOptions: { show: { resource: ['directMessage'], operation: ['getMessages', 'getAll', 'members'] } },
        default: false,
        description: 'Whether to return all results or only up to a given limit',
    },
    {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        displayOptions: { show: { resource: ['directMessage'], operation: ['getMessages', 'getAll', 'members'], returnAll: [false] } },
        typeOptions: { minValue: 1, maxValue: 500 },
        default: 50,
        description: 'Max number of results to return',
    },
];
