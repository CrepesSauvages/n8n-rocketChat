import type {
	IExecuteFunctions,
	IDataObject,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import {
	rocketchatApiRequest,
	rocketchatApiRequestAllItems,
	rocketchatApiRequestUpload,
	getChannelEndpoint,
	getChannels,
	getJoinedChannels,
	getUsers,
	validateEmoji,
	validateISODate,
} from './GenericFunctions';

import { channelOperations, channelFields } from './descriptions/ChannelDescription';
import { messageOperations, messageFields } from './descriptions/MessageDescription';
import { dmOperations, dmFields } from './descriptions/DmDescription';
import { userOperations, userFields } from './descriptions/UserDescription';

export class RocketChatExtended implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Rocket.Chat Extended',
		name: 'rocketChatExtended',
		icon: 'file:rocketchat.svg',
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Extended Rocket.Chat operations: channels, messages, threads, reactions, file upload, and more',
		defaults: { name: 'Rocket.Chat Extended' },
		inputs: ['main'],
		outputs: ['main'],
		credentials: [{ name: 'rocketChatExtendedApi', required: true }],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Channel', value: 'channel' },
					{ name: 'Direct Message', value: 'directMessage' },
					{ name: 'Message', value: 'message' },
					{ name: 'User', value: 'user' },
				],
				default: 'message',
			},
			...channelOperations,
			...channelFields,
			...dmOperations,
			...dmFields,
			...messageOperations,
			...messageFields,
			...userOperations,
			...userFields,
		],
	};

	methods = {
		loadOptions: {
			getChannels,
			getJoinedChannels,
			getUsers,
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject | IDataObject[] = {};

				// ========================================
				//           RESOURCE: CHANNEL
				// ========================================
				if (resource === 'channel') {
					const channelType = this.getNodeParameter('channelType', i) as string;
					const prefix = getChannelEndpoint(channelType);

					if (operation === 'create') {
						const name = this.getNodeParameter('name', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						const body: IDataObject = { name };
						if (additionalFields.members) {
							body.members = (additionalFields.members as string).split(',').map((m: string) => m.trim());
						}
						if (additionalFields.readOnly !== undefined) body.readOnly = additionalFields.readOnly;
						if (additionalFields.description) body.description = additionalFields.description;
						if (additionalFields.topic) body.topic = additionalFields.topic;
						responseData = await rocketchatApiRequest.call(this, 'POST', `${prefix}.create`, body);
					}
					else if (operation === 'delete') {
						const roomId = this.getNodeParameter('roomId', i) as string;
						responseData = await rocketchatApiRequest.call(this, 'POST', `${prefix}.delete`, { roomId });
					}
					else if (operation === 'archive') {
						const roomId = this.getNodeParameter('roomId', i) as string;
						responseData = await rocketchatApiRequest.call(this, 'POST', `${prefix}.archive`, { roomId });
					}
					else if (operation === 'unarchive') {
						const roomId = this.getNodeParameter('roomId', i) as string;
						responseData = await rocketchatApiRequest.call(this, 'POST', `${prefix}.unarchive`, { roomId });
					}
					else if (operation === 'rename') {
						const roomId = this.getNodeParameter('roomId', i) as string;
						const newName = this.getNodeParameter('newName', i) as string;
						responseData = await rocketchatApiRequest.call(this, 'POST', `${prefix}.rename`, { roomId, name: newName });
					}
					else if (operation === 'get') {
						const identifyBy = this.getNodeParameter('identifyBy', i) as string;
						const qs: IDataObject = {};
						if (identifyBy === 'roomId') {
							qs.roomId = this.getNodeParameter('roomIdGet', i) as string;
						} else {
							qs.roomName = this.getNodeParameter('roomNameGet', i) as string;
						}
						responseData = await rocketchatApiRequest.call(this, 'GET', `${prefix}.info`, {}, qs);
					}
					else if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const itemKey = channelType === 'group' ? 'groups' : 'channels';
						const limit = returnAll ? 0 : (this.getNodeParameter('limit', i) as number);
						responseData = await rocketchatApiRequestAllItems.call(this, itemKey, 'GET', `${prefix}.list`, {}, {}, limit);
					}
					else if (operation === 'getJoined') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const limit = returnAll ? 0 : (this.getNodeParameter('limit', i) as number);
						const endpoint = channelType === 'group' ? 'groups.listAll' : 'channels.list.joined';
						const itemKey = channelType === 'group' ? 'groups' : 'channels';
						responseData = await rocketchatApiRequestAllItems.call(this, itemKey, 'GET', endpoint, {}, {}, limit);
					}
					else if (operation === 'getMembers') {
						const roomId = this.getNodeParameter('roomId', i) as string;
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const limit = returnAll ? 0 : (this.getNodeParameter('limit', i) as number);
						responseData = await rocketchatApiRequestAllItems.call(this, 'members', 'GET', `${prefix}.members`, {}, { roomId }, limit);
					}
					else if (operation === 'join') {
						const roomId = this.getNodeParameter('roomId', i) as string;
						const joinCode = this.getNodeParameter('joinCode', i, '') as string;
						const body: IDataObject = { roomId };
						if (joinCode) body.joinCode = joinCode;
						responseData = await rocketchatApiRequest.call(this, 'POST', `${prefix}.join`, body);
					}
					else if (operation === 'leave') {
						const roomId = this.getNodeParameter('roomId', i) as string;
						responseData = await rocketchatApiRequest.call(this, 'POST', `${prefix}.leave`, { roomId });
					}
					else if (operation === 'setTopic') {
						const roomId = this.getNodeParameter('roomId', i) as string;
						const topic = this.getNodeParameter('topic', i) as string;
						responseData = await rocketchatApiRequest.call(this, 'POST', `${prefix}.setTopic`, { roomId, topic });
					}
					else if (operation === 'setDescription') {
						const roomId = this.getNodeParameter('roomId', i) as string;
						const description = this.getNodeParameter('description', i) as string;
						responseData = await rocketchatApiRequest.call(this, 'POST', `${prefix}.setDescription`, { roomId, description });
					}
					else if (operation === 'setReadOnly') {
						const roomId = this.getNodeParameter('roomId', i) as string;
						const readOnly = this.getNodeParameter('readOnly', i) as boolean;
						responseData = await rocketchatApiRequest.call(this, 'POST', `${prefix}.setReadOnly`, { roomId, readOnly });
					}
					else if (operation === 'invite') {
						const roomId = this.getNodeParameter('roomId', i) as string;
						const userId = this.getNodeParameter('userId', i) as string;
						responseData = await rocketchatApiRequest.call(this, 'POST', `${prefix}.invite`, { roomId, userId });
					}
					else if (operation === 'kick') {
						const roomId = this.getNodeParameter('roomId', i) as string;
						const userId = this.getNodeParameter('userId', i) as string;
						responseData = await rocketchatApiRequest.call(this, 'POST', `${prefix}.kick`, { roomId, userId });
					}
					else if (operation === 'setRole') {
						const roomId = this.getNodeParameter('roomId', i) as string;
						const userId = this.getNodeParameter('userId', i) as string;
						const roleAction = this.getNodeParameter('roleAction', i) as string;
						responseData = await rocketchatApiRequest.call(this, 'POST', `${prefix}.${roleAction}`, { roomId, userId });
					}
				}

				// ======================================
				//        RESOURCE: DIRECT MESAGE
				// ========================================
				else if (resource === 'directMessage') {
					if (operation === 'create') {
						const username = this.getNodeParameter('dmUsername', i) as string;
						const excludeSelf = this.getNodeParameter('excludeSelf', i) as boolean;
						const body: IDataObject = { excludeSelf };
						if (username.includes(',')) {
							body.usernames = username;
						} else {
							body.username = username;
						}
						responseData = await rocketchatApiRequest.call(this, 'POST', 'dm.create', body);
					}
					else if (operation === 'close') {
						const roomId = this.getNodeParameter('roomId', i) as string;
						responseData = await rocketchatApiRequest.call(this, 'POST', 'dm.close', { roomId });
					}
					else if (operation === 'open') {
						const roomId = this.getNodeParameter('roomId', i) as string;
						responseData = await rocketchatApiRequest.call(this, 'POST', 'dm.open', { roomId });
					}
					else if (operation === 'send') {
						const roomId = this.getNodeParameter('roomId', i) as string;
						const text = this.getNodeParameter('text', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						const message: IDataObject = { rid: roomId, msg: text };
						if (additionalFields.alias) message.alias = additionalFields.alias;
						if (additionalFields.emoji) message.emoji = additionalFields.emoji;
						if (additionalFields.tmid) message.tmid = additionalFields.tmid;
						responseData = await rocketchatApiRequest.call(this, 'POST', 'chat.sendMessage', { message });
					}
					else if (operation === 'getMessages') {
						const roomId = this.getNodeParameter('roomId', i) as string;
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const limit = returnAll ? 0 : (this.getNodeParameter('limit', i) as number);
						responseData = await rocketchatApiRequestAllItems.call(this, 'messages', 'GET', 'dm.messages', {}, { roomId }, limit);
					}
					else if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const limit = returnAll ? 0 : (this.getNodeParameter('limit', i) as number);
						responseData = await rocketchatApiRequestAllItems.call(this, 'ims', 'GET', 'dm.list', {}, {}, limit);
					}
					else if (operation === 'members') {
						const roomId = this.getNodeParameter('roomId', i) as string;
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const limit = returnAll ? 0 : (this.getNodeParameter('limit', i) as number);
						responseData = await rocketchatApiRequestAllItems.call(this, 'members', 'GET', 'dm.members', {}, { roomId }, limit);
					}
					else if (operation === 'setTopic') {
						const roomId = this.getNodeParameter('roomId', i) as string;
						const topic = this.getNodeParameter('topic', i) as string;
						responseData = await rocketchatApiRequest.call(this, 'POST', 'dm.setTopic', { roomId, topic });
					}
					else if (operation === 'uploadFile') {
						const roomId = this.getNodeParameter('roomId', i) as string;
						const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
						const uploadAdditionalFields = this.getNodeParameter('uploadAdditionalFields', i) as IDataObject;

						const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
						const fileBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
						const fileName = binaryData.fileName || 'file';

						responseData = await rocketchatApiRequestUpload.call(
							this,
							roomId,
							fileBuffer,
							fileName,
							uploadAdditionalFields.description as string | undefined,
							uploadAdditionalFields.tmid as string | undefined,
						);
					}
				}

				// ========================================
				//           RESOURCE: MESSAGE
				// ========================================
				else if (resource === 'message') {
					if (operation === 'send') {
						const roomId = this.getNodeParameter('roomId', i) as string;
						const text = this.getNodeParameter('text', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						const message: IDataObject = { rid: roomId, msg: text };
						if (additionalFields.alias) message.alias = additionalFields.alias;
						if (additionalFields.emoji) message.emoji = additionalFields.emoji;
						if (additionalFields.avatar) message.avatar = additionalFields.avatar;
						if (additionalFields.attachments) {
							try { message.attachments = JSON.parse(additionalFields.attachments as string); }
							catch { message.attachments = additionalFields.attachments; }
						}
						responseData = await rocketchatApiRequest.call(this, 'POST', 'chat.sendMessage', { message });
					}
					else if (operation === 'edit') {
						const roomId = this.getNodeParameter('roomId', i) as string;
						const messageId = this.getNodeParameter('messageId', i) as string;
						const newText = this.getNodeParameter('newText', i) as string;
						responseData = await rocketchatApiRequest.call(this, 'POST', 'chat.update', { roomId, msgId: messageId, text: newText });
					}
					else if (operation === 'delete') {
						const roomId = this.getNodeParameter('roomId', i) as string;
						const messageId = this.getNodeParameter('messageId', i) as string;
						responseData = await rocketchatApiRequest.call(this, 'POST', 'chat.delete', { roomId, msgId: messageId });
					}
					else if (operation === 'get') {
						const messageId = this.getNodeParameter('messageId', i) as string;
						responseData = await rocketchatApiRequest.call(this, 'GET', 'chat.getMessage', {}, { msgId: messageId });
					}
					else if (operation === 'pin') {
						const messageId = this.getNodeParameter('messageId', i) as string;
						responseData = await rocketchatApiRequest.call(this, 'POST', 'chat.pinMessage', { messageId });
					}
					else if (operation === 'unpin') {
						const messageId = this.getNodeParameter('messageId', i) as string;
						responseData = await rocketchatApiRequest.call(this, 'POST', 'chat.unPinMessage', { messageId });
					}
					else if (operation === 'react') {
						const messageId = this.getNodeParameter('messageId', i) as string;
						const rawEmoji = this.getNodeParameter('emoji', i) as string;
						const emoji = validateEmoji(rawEmoji);
						const shouldReact = this.getNodeParameter('shouldReact', i) as boolean;
						responseData = await rocketchatApiRequest.call(this, 'POST', 'chat.react', { messageId, emoji, shouldReact });
					}
					else if (operation === 'star') {
						const messageId = this.getNodeParameter('messageId', i) as string;
						responseData = await rocketchatApiRequest.call(this, 'POST', 'chat.starMessage', { messageId });
					}
					else if (operation === 'unstar') {
						const messageId = this.getNodeParameter('messageId', i) as string;
						responseData = await rocketchatApiRequest.call(this, 'POST', 'chat.unStarMessage', { messageId });
					}
					else if (operation === 'follow') {
						const messageId = this.getNodeParameter('messageId', i) as string;
						responseData = await rocketchatApiRequest.call(this, 'POST', 'chat.followMessage', { mid: messageId });
					}
					else if (operation === 'unfollow') {
						const messageId = this.getNodeParameter('messageId', i) as string;
						responseData = await rocketchatApiRequest.call(this, 'POST', 'chat.unfollowMessage', { mid: messageId });
					}
					else if (operation === 'report') {
						const messageId = this.getNodeParameter('messageId', i) as string;
						const description = this.getNodeParameter('reportDescription', i) as string;
						responseData = await rocketchatApiRequest.call(this, 'POST', 'chat.reportMessage', { messageId, description });
					}
					else if (operation === 'replyThread') {
						const roomId = this.getNodeParameter('roomId', i) as string;
						const text = this.getNodeParameter('text', i) as string;
						const tmid = this.getNodeParameter('tmid', i) as string;
						responseData = await rocketchatApiRequest.call(this, 'POST', 'chat.sendMessage', { message: { rid: roomId, msg: text, tmid } });
					}
					else if (operation === 'search') {
						const roomId = this.getNodeParameter('roomId', i) as string;
						const searchText = this.getNodeParameter('searchText', i) as string;
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const limit = returnAll ? 0 : (this.getNodeParameter('limit', i) as number);
						responseData = await rocketchatApiRequestAllItems.call(this, 'messages', 'GET', 'chat.search', {}, { roomId, searchText }, limit);
					}
					else if (operation === 'getHistory') {
						const roomId = this.getNodeParameter('roomId', i) as string;
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const historyOptions = this.getNodeParameter('historyOptions', i) as IDataObject;
						const qs: IDataObject = { roomId };
						if (historyOptions.latest) {
							validateISODate(historyOptions.latest as string, 'Latest');
							qs.latest = historyOptions.latest;
						}
						if (historyOptions.oldest) {
							validateISODate(historyOptions.oldest as string, 'Oldest');
							qs.oldest = historyOptions.oldest;
						}
						if (historyOptions.inclusive !== undefined) qs.inclusive = historyOptions.inclusive;
						const limit = returnAll ? 0 : (this.getNodeParameter('limit', i) as number);
						responseData = await rocketchatApiRequestAllItems.call(this, 'messages', 'GET', 'channels.history', {}, qs, limit);
					}
					else if (operation === 'getThreadMessages') {
						const tmid = this.getNodeParameter('tmidThread', i) as string;
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const limit = returnAll ? 0 : (this.getNodeParameter('limit', i) as number);
						responseData = await rocketchatApiRequestAllItems.call(this, 'messages', 'GET', 'chat.getThreadMessages', {}, { tmid }, limit);
					}
					else if (operation === 'schedule') {
						const roomId = this.getNodeParameter('roomId', i) as string;
						const text = this.getNodeParameter('text', i) as string;
						const scheduledAt = this.getNodeParameter('scheduledAt', i) as string;
						validateISODate(scheduledAt, 'Scheduled Date');
						responseData = await rocketchatApiRequest.call(this, 'POST', 'chat.scheduleMessage', { roomId, msg: text, scheduledAt });
					}
					else if (operation === 'uploadFile') {
						const roomId = this.getNodeParameter('roomId', i) as string;
						const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
						const uploadAdditionalFields = this.getNodeParameter('uploadAdditionalFields', i) as IDataObject;

						const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
						const fileBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
						const fileName = binaryData.fileName || 'file';

						responseData = await rocketchatApiRequestUpload.call(
							this,
							roomId,
							fileBuffer,
							fileName,
							uploadAdditionalFields.description as string | undefined,
							uploadAdditionalFields.tmid as string | undefined,
						);
					}
				}

				// ========================================
				//           RESOURCE: USER
				// ========================================
				else if (resource === 'user') {
					if (operation === 'create') {
						const email = this.getNodeParameter('email', i) as string;
						const name = this.getNodeParameter('name', i) as string;
						const password = this.getNodeParameter('password', i) as string;
						const username = this.getNodeParameter('username', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						const body: IDataObject = { email, name, password, username, ...additionalFields };

						if (body.roles) {
							body.roles = (body.roles as string).split(',').map((role) => role.trim());
						}

						responseData = await rocketchatApiRequest.call(this, 'POST', 'users.create', body);
					}
					else if (operation === 'delete') {
						const userId = this.getNodeParameter('userId', i) as string;
						responseData = await rocketchatApiRequest.call(this, 'POST', 'users.delete', { userId });
					}
					else if (operation === 'get') {
						const userId = this.getNodeParameter('userId', i) as string;
						responseData = await rocketchatApiRequest.call(this, 'GET', 'users.info', {}, { userId });
					}
					else if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const limit = returnAll ? 0 : (this.getNodeParameter('limit', i) as number);
						responseData = await rocketchatApiRequestAllItems.call(this, 'users', 'GET', 'users.list', {}, {}, limit);
					}
					else if (operation === 'setAvatar') {
						const userId = this.getNodeParameter('userId', i) as string;
						const avatarUrl = this.getNodeParameter('avatarUrl', i) as string;
						responseData = await rocketchatApiRequest.call(this, 'POST', 'users.setAvatar', { userId, avatarUrl });
					}
					else if (operation === 'update') {
						const userId = this.getNodeParameter('userId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
						const body: IDataObject = { userId, data: { ...updateFields } };

						if (updateFields.roles) {
							(body.data as IDataObject).roles = (updateFields.roles as string).split(',').map((role) => role.trim());
						}

						responseData = await rocketchatApiRequest.call(this, 'POST', 'users.update', body);
					}
				}

				if (Array.isArray(responseData)) {
					returnData.push(...responseData.map((item) => ({ json: item, pairedItem: { item: i } })));
				} else {
					returnData.push({ json: responseData, pairedItem: { item: i } });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
