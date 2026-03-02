import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class RocketChatExtendedApi implements ICredentialType {
	name = 'rocketChatExtendedApi';
	displayName = 'Rocket.Chat Extended API';
	documentationUrl = 'https://developer.rocket.chat/reference/api/rest-api';

	properties: INodeProperties[] = [
		{
			displayName: 'Server URL',
			name: 'serverUrl',
			type: 'string',
			default: 'https://',
			placeholder: 'https://chat.example.com',
			description: 'The URL of your Rocket.Chat instance (without trailing slash)',
			required: true,
		},
		{
			displayName: 'User ID',
			name: 'userId',
			type: 'string',
			default: '',
			description: 'Your Rocket.Chat User ID',
			required: true,
		},
		{
			displayName: 'Auth Token',
			name: 'authToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Your Rocket.Chat Auth Token',
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-Auth-Token': '={{$credentials.authToken}}',
				'X-User-Id': '={{$credentials.userId}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.serverUrl}}',
			url: '/api/v1/me',
			method: 'GET',
		},
	};
}
