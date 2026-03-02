import {
	ILoadOptionsFunctions,
	IExecuteFunctions,
	IDataObject,
	IHttpRequestMethods,
	IHttpRequestOptions,
	INodePropertyOptions,
	NodeApiError,
} from 'n8n-workflow';

// ─── Error code mapping for enriched error messages ───
const RC_ERROR_MAP: Record<string, string> = {
	'error-not-allowed': 'Permission denied — you do not have the required role for this action.',
	'error-invalid-room': 'Invalid room — the room ID does not exist or you do not have access.',
	'error-action-not-allowed': 'Action not allowed — this operation is restricted by server policy.',
	'error-room-not-found': 'Room not found — verify the room ID or name.',
	'error-user-not-found': 'User not found — verify the user ID or username.',
	'error-invalid-message': 'Invalid message — the message ID does not exist.',
	'error-message-deleting-blocked': 'Message deletion is blocked by server configuration.',
	'error-pinning-message': 'Pinning failed — pinning may be disabled for this channel.',
	'error-not-authorized': 'Not authorized — your auth token may be expired or invalid.',
	'totp-required': 'Two-factor authentication is required for this action.',
};

/**
 * Enrich a Rocket.Chat error with a human-readable description.
 */
function enrichErrorMessage(errorBody: IDataObject): string {
	const errorType = (errorBody.errorType || errorBody.error) as string;
	if (errorType && RC_ERROR_MAP[errorType]) {
		return `${RC_ERROR_MAP[errorType]} (RC code: ${errorType})`;
	}
	return (errorBody.message || errorBody.error || 'Rocket.Chat API request failed') as string;
}

/**
 * Validate emoji format (:name:).
 */
export function validateEmoji(emoji: string): string {
	const trimmed = emoji.trim();
	if (!trimmed.startsWith(':') || !trimmed.endsWith(':')) {
		return `:${trimmed.replace(/^:/, '').replace(/:$/, '')}:`;
	}
	return trimmed;
}

/**
 * Validate ISO date string.
 */
export function validateISODate(dateStr: string, fieldName: string): void {
	const parsed = Date.parse(dateStr);
	if (isNaN(parsed)) {
		throw new Error(`Invalid date format for "${fieldName}". Expected ISO 8601 (e.g. 2026-01-01T00:00:00.000Z), got: "${dateStr}"`);
	}
}

/**
 * Make an authenticated API request to Rocket.Chat REST API v1.
 */
export async function rocketchatApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<IDataObject> {
	const credentials = await this.getCredentials('rocketChatExtendedApi');
	const serverUrl = (credentials.serverUrl as string).replace(/\/$/, '');

	const options: IHttpRequestOptions = {
		method,
		url: `${serverUrl}/api/v1/${endpoint}`,
		headers: {
			'Content-Type': 'application/json',
		},
		body,
		qs,
		json: true,
	};

	if (method === 'GET') {
		delete options.body;
	}

	try {
		const response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'rocketChatExtendedApi',
			options,
		);
		return response as IDataObject;
	} catch (error) {
		const err = error as { message?: string; statusCode?: number; body?: IDataObject; description?: string };
		const errorBody = (err.body || {}) as IDataObject;
		const enriched = enrichErrorMessage(errorBody);

		throw new NodeApiError(this.getNode(), {
			message: enriched,
			description: err.description || enriched,
			status: err.statusCode ?? 0,
		});
	}
}

/**
 * Make an authenticated API request and return all items (handles pagination).
 */
export async function rocketchatApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	propertyName: string,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	limit = 0,
): Promise<IDataObject[]> {
	const returnData: IDataObject[] = [];
	const pageSize = 100;
	let offset = 0;

	qs.count = pageSize;

	do {
		qs.offset = offset;
		const responseData = await rocketchatApiRequest.call(this, method, endpoint, body, qs);

		const items = responseData[propertyName] as IDataObject[];
		if (!items || !Array.isArray(items)) {
			break;
		}

		returnData.push(...items);
		offset += pageSize;

		const total = responseData.total as number;
		if (offset >= total) {
			break;
		}

		if (limit > 0 && returnData.length >= limit) {
			return returnData.slice(0, limit);
		}
	} while (true);

	if (limit > 0 && returnData.length > limit) {
		return returnData.slice(0, limit);
	}

	return returnData;
}

/**
 * Resolve the correct API endpoint prefix based on channel type.
 */
export function getChannelEndpoint(channelType: string): string {
	return channelType === 'group' ? 'groups' : 'channels';
}

/**
 * Upload a file to a Rocket.Chat room via rooms.upload (multipart/form-data).
 */
export async function rocketchatApiRequestUpload(
	this: IExecuteFunctions,
	roomId: string,
	fileBuffer: Buffer,
	fileName: string,
	description?: string,
	tmid?: string,
): Promise<IDataObject> {
	const credentials = await this.getCredentials('rocketChatExtendedApi');
	const serverUrl = (credentials.serverUrl as string).replace(/\/$/, '');

	const FormData = await import('form-data').then((m) => m.default || m);
	const formData = new FormData();
	formData.append('file', fileBuffer, { filename: fileName, contentType: 'application/octet-stream' });
	if (description) formData.append('description', description);
	if (tmid) formData.append('tmid', tmid);

	const uploadOptions: IHttpRequestOptions = {
		method: 'POST',
		url: `${serverUrl}/api/v1/rooms.upload/${roomId}`,
		headers: {
			...formData.getHeaders(),
			'X-Auth-Token': credentials.authToken as string,
			'X-User-Id': credentials.userId as string,
		},
		body: formData,
		returnFullResponse: true,
	};

	try {
		const raw = await this.helpers.httpRequest(uploadOptions);
		const parsed = typeof raw === 'string' ? JSON.parse(raw) : (raw.body ? (typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body) : raw);
		return parsed as IDataObject;
	} catch (error) {
		const err = error as { message?: string; statusCode?: number };
		throw new NodeApiError(this.getNode(), {
			message: `File upload failed: ${err.message || 'Unknown error'}`,
			status: err.statusCode ?? 0,
		});
	}
}

// ════════════════════════════════════════════
//  loadOptions methods (used by the node)
// ════════════════════════════════════════════

/**
 * Fetch all public channels for a dynamic dropdown.
 */
export async function getChannels(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const data = await rocketchatApiRequestAllItems.call(this, 'channels', 'GET', 'channels.list');
	return data.map((ch) => ({
		name: (ch.name || ch._id) as string,
		value: ch._id as string,
	}));
}

/**
 * Fetch all joined channels for a dynamic dropdown.
 */
export async function getJoinedChannels(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const data = await rocketchatApiRequestAllItems.call(this, 'channels', 'GET', 'channels.list.joined');
	return data.map((ch) => ({
		name: (ch.name || ch._id) as string,
		value: ch._id as string,
	}));
}

/**
 * Fetch all users for a dynamic dropdown.
 */
export async function getUsers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const data = await rocketchatApiRequestAllItems.call(this, 'users', 'GET', 'users.list');
	return data.map((u) => ({
		name: (`${u.username || ''} (${u.name || ''})` as string).trim(),
		value: u._id as string,
	}));
}
