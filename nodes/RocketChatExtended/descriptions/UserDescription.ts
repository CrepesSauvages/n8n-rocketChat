import { INodeProperties } from 'n8n-workflow';

export const userOperations: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ['user'],
            },
        },
        options: [
            { name: 'Avatar', value: 'setAvatar', description: 'Set a user\'s avatar', action: 'Set an avatar' },
            { name: 'Create', value: 'create', description: 'Create a new user', action: 'Create a user' },
            { name: 'Delete', value: 'delete', description: 'Delete a user', action: 'Delete a user' },
            { name: 'Get', value: 'get', description: 'Get a user by ID or Username', action: 'Get a user' },
            { name: 'Get Many', value: 'getAll', description: 'Get many users', action: 'Get many users' },
            { name: 'Update', value: 'update', description: 'Update a user\'s properties', action: 'Update a user' },
        ],
        default: 'create',
    },
];

export const userFields: INodeProperties[] = [
    // ══════════════════════════════════════
    //  Create
    // ══════════════════════════════════════
    {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        required: true,
        default: '',
        description: 'The display name of the user',
        displayOptions: { show: { resource: ['user'], operation: ['create'] } },
    },
    {
        displayName: 'Email',
        name: 'email',
        type: 'string',
        required: true,
        default: '',
        description: 'The email address of the user',
        displayOptions: { show: { resource: ['user'], operation: ['create'] } },
    },
    {
        displayName: 'Username',
        name: 'username',
        type: 'string',
        required: true,
        default: '',
        description: 'The username of the user',
        displayOptions: { show: { resource: ['user'], operation: ['create'] } },
    },
    {
        displayName: 'Password',
        name: 'password',
        type: 'string',
        typeOptions: { password: true },
        required: true,
        default: '',
        description: 'The password for the user',
        displayOptions: { show: { resource: ['user'], operation: ['create'] } },
    },
    {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: { show: { resource: ['user'], operation: ['create'] } },
        options: [
            { displayName: 'Active', name: 'active', type: 'boolean', default: true },
            { displayName: 'Join Default Channels', name: 'joinDefaultChannels', type: 'boolean', default: true },
            { displayName: 'Require Password Change', name: 'requirePasswordChange', type: 'boolean', default: false },
            { displayName: 'Roles (Comma Separated)', name: 'roles', type: 'string', default: 'user' },
            { displayName: 'Send Welcome Email', name: 'sendWelcomeEmail', type: 'boolean', default: false },
            { displayName: 'Verified', name: 'verified', type: 'boolean', default: false },
        ],
    },

    // ══════════════════════════════════════
    //  User ID (dropdown/manual)
    // ══════════════════════════════════════
    {
        displayName: 'Specify User Manually',
        name: 'specifyUserManually',
        type: 'boolean',
        default: false,
        displayOptions: { show: { resource: ['user'], operation: ['delete', 'get', 'setAvatar', 'update'] } },
    },
    {
        displayName: 'User',
        name: 'userId',
        type: 'options',
        typeOptions: { loadOptionsMethod: 'getUsers' },
        required: true,
        default: '',
        displayOptions: { show: { resource: ['user'], operation: ['delete', 'get', 'setAvatar', 'update'], specifyUserManually: [false] } },
    },
    {
        displayName: 'User ID',
        name: 'userId',
        type: 'string',
        required: true,
        default: '',
        displayOptions: { show: { resource: ['user'], operation: ['delete', 'get', 'setAvatar', 'update'], specifyUserManually: [true] } },
    },

    // ══════════════════════════════════════
    //  Update
    // ══════════════════════════════════════
    {
        displayName: 'Update Fields',
        name: 'updateFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: { show: { resource: ['user'], operation: ['update'] } },
        options: [
            { displayName: 'Active', name: 'active', type: 'boolean', default: true },
            { displayName: 'Email', name: 'email', type: 'string', default: '' },
            { displayName: 'Name', name: 'name', type: 'string', default: '' },
            { displayName: 'Password', name: 'password', type: 'string', typeOptions: { password: true }, default: '' },
            { displayName: 'Require Password Change', name: 'requirePasswordChange', type: 'boolean', default: false },
            { displayName: 'Roles (Comma Separated)', name: 'roles', type: 'string', default: '' },
            { displayName: 'Username', name: 'username', type: 'string', default: '' },
            { displayName: 'Verified', name: 'verified', type: 'boolean', default: false },
        ],
    },

    // ══════════════════════════════════════
    //  Set Avatar
    // ══════════════════════════════════════
    {
        displayName: 'Avatar URL',
        name: 'avatarUrl',
        type: 'string',
        required: true,
        default: '',
        description: 'The URL of the avatar image to set',
        displayOptions: { show: { resource: ['user'], operation: ['setAvatar'] } },
    },

    // ══════════════════════════════════════
    //  Pagination (Get Many)
    // ══════════════════════════════════════
    {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        displayOptions: { show: { resource: ['user'], operation: ['getAll'] } },
        default: false,
    },
    {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        displayOptions: { show: { resource: ['user'], operation: ['getAll'], returnAll: [false] } },
        typeOptions: { minValue: 1, maxValue: 500 },
        default: 50,
    },
];
