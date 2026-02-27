import {
	ILoadOptionsFunctions,
	IExecuteFunctions,
	IDataObject,
	IHttpRequestMethods,
	IHttpRequestOptions,
	NodeApiError,
} from 'n8n-workflow';

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
		const err = error as { message?: string; statusCode?: number };
		throw new NodeApiError(this.getNode(), {
			message: err.message || 'Rocket.Chat API request failed',
			status: err.statusCode ?? 0,
		});
	}
}

/**
 * Make an authenticated API request and return all items (handles pagination).
 *
 * @param propertyName - The key in the response that contains the array of results (e.g. 'channels', 'messages')
 * @param method - HTTP method
 * @param endpoint - API endpoint (without /api/v1/ prefix)
 * @param body - Request body for POST/PUT
 * @param qs - Query string parameters
 * @param limit - Maximum number of items to return (0 = all)
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
 * Public channels use 'channels.*', private groups use 'groups.*'.
 */
export function getChannelEndpoint(channelType: string): string {
	return channelType === 'group' ? 'groups' : 'channels';
}
