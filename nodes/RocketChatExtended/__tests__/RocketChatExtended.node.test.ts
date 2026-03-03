/**
 * Unit tests for RocketChatExtended.node.ts execute() logic.
 * All API calls are mocked — no real Rocket.Chat instance required.
 */

// ── Mock GenericFunctions before imports ──
const mockRocketchatApiRequest = jest.fn();
const mockRocketchatApiRequestAllItems = jest.fn();
const mockRocketchatApiRequestUpload = jest.fn();

jest.mock('../GenericFunctions', () => ({
    rocketchatApiRequest: mockRocketchatApiRequest,
    rocketchatApiRequestAllItems: mockRocketchatApiRequestAllItems,
    rocketchatApiRequestUpload: mockRocketchatApiRequestUpload,
    getChannelEndpoint: jest.requireActual('../GenericFunctions').getChannelEndpoint,
    getChannels: jest.fn().mockResolvedValue([]),
    getJoinedChannels: jest.fn().mockResolvedValue([]),
    getUsers: jest.fn().mockResolvedValue([]),
    validateEmoji: jest.requireActual('../GenericFunctions').validateEmoji,
    validateISODate: jest.requireActual('../GenericFunctions').validateISODate,
}));

import { RocketChatExtended } from '../RocketChatExtended.node';

// ── Helpers ──

function createMockExecuteFunctions(overrides: {
    resource: string;
    operation: string;
    params?: Record<string, any>;
    items?: any[];
}) {
    const { resource, operation, params = {}, items = [{}] } = overrides;

    const paramMap: Record<string, any> = {
        resource,
        operation,
        channelType: 'channel',
        returnAll: false,
        limit: 50,
        ...params,
    };

    return {
        getInputData: () => items.map((item: any) => ({ json: item })),
        getNodeParameter: (name: string, _idx: number, fallback?: any) => {
            if (name in paramMap) { return paramMap[name]; }
            if (fallback !== undefined) { return fallback; }
            return '';
        },
        continueOnFail: () => false,
        getNode: () => ({ name: 'TestNode', type: 'test' }),
        helpers: {
            assertBinaryData: (_idx: number, _propertyName: string) => ({
                fileName: 'test.pdf',
                mimeType: 'application/pdf',
                data: 'base64data',
            }),
            getBinaryDataBuffer: jest.fn().mockResolvedValue(Buffer.from('test file content')),
        },
    };
}

// ═══════════════════════════════════════════
//  Channel operations
// ═══════════════════════════════════════════

describe('RocketChatExtended — Channel', () => {
    const node = new RocketChatExtended();

    beforeEach(() => {
        jest.clearAllMocks();
        mockRocketchatApiRequest.mockResolvedValue({ success: true });
        mockRocketchatApiRequestAllItems.mockResolvedValue([]);
    });

    it('create — sends POST with name and additional fields', async () => {
        const ctx = createMockExecuteFunctions({
            resource: 'channel',
            operation: 'create',
            params: {
                name: 'test-channel',
                additionalFields: { members: 'user1, user2', readOnly: true, topic: 'Test' },
            },
        });

        mockRocketchatApiRequest.mockResolvedValue({ channel: { _id: 'abc123' } });
        const result = await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequest).toHaveBeenCalledWith(
            'POST', 'channels.create',
            { name: 'test-channel', members: ['user1', 'user2'], readOnly: true, topic: 'Test' },
        );
        expect(result[0]).toHaveLength(1);
    });

    it('delete — sends POST with roomId', async () => {
        const ctx = createMockExecuteFunctions({
            resource: 'channel',
            operation: 'delete',
            params: { roomId: 'room123' },
        });

        await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequest).toHaveBeenCalledWith(
            'POST', 'channels.delete', { roomId: 'room123' },
        );
    });

    it('join — sends POST with roomId and optional joinCode', async () => {
        const ctx = createMockExecuteFunctions({
            resource: 'channel',
            operation: 'join',
            params: { roomId: 'room123', joinCode: 'secret' },
        });

        await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequest).toHaveBeenCalledWith(
            'POST', 'channels.join', { roomId: 'room123', joinCode: 'secret' },
        );
    });

    it('leave — sends POST with roomId', async () => {
        const ctx = createMockExecuteFunctions({
            resource: 'channel',
            operation: 'leave',
            params: { roomId: 'room123' },
        });

        await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequest).toHaveBeenCalledWith(
            'POST', 'channels.leave', { roomId: 'room123' },
        );
    });

    it('getJoined — paginates joined channels', async () => {
        const ctx = createMockExecuteFunctions({
            resource: 'channel',
            operation: 'getJoined',
            params: { returnAll: true },
        });

        mockRocketchatApiRequestAllItems.mockResolvedValue([{ _id: '1' }, { _id: '2' }]);
        const result = await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequestAllItems).toHaveBeenCalledWith(
            'channels', 'GET', 'channels.list.joined', {}, {}, 0,
        );
        expect(result[0]).toHaveLength(2);
    });

    it('getAll — uses groups prefix for private groups', async () => {
        const ctx = createMockExecuteFunctions({
            resource: 'channel',
            operation: 'getAll',
            params: { channelType: 'group', returnAll: false, limit: 10 },
        });

        mockRocketchatApiRequestAllItems.mockResolvedValue([{ _id: 'g1' }]);
        await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequestAllItems).toHaveBeenCalledWith(
            'groups', 'GET', 'groups.list', {}, {}, 10,
        );
    });

    it('invite — sends POST with roomId and userId', async () => {
        const ctx = createMockExecuteFunctions({
            resource: 'channel',
            operation: 'invite',
            params: { roomId: 'room123', userId: 'user456' },
        });

        await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequest).toHaveBeenCalledWith(
            'POST', 'channels.invite', { roomId: 'room123', userId: 'user456' },
        );
    });

    it('setRole — uses roleAction as endpoint suffix', async () => {
        const ctx = createMockExecuteFunctions({
            resource: 'channel',
            operation: 'setRole',
            params: { roomId: 'room123', userId: 'user456', roleAction: 'addModerator' },
        });

        await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequest).toHaveBeenCalledWith(
            'POST', 'channels.addModerator', { roomId: 'room123', userId: 'user456' },
        );
    });

    it('setAnnouncement — sends POST with roomId and announcement', async () => {
        const ctx = createMockExecuteFunctions({
            resource: 'channel',
            operation: 'setAnnouncement',
            params: { roomId: 'room123', announcement: 'Breaking news!' },
        });

        await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequest).toHaveBeenCalledWith(
            'POST', 'channels.setAnnouncement', { roomId: 'room123', announcement: 'Breaking news!' }
        );
    });
});

// ═══════════════════════════════════════════
//  Message operations
// ═══════════════════════════════════════════

describe('RocketChatExtended — Message', () => {
    const node = new RocketChatExtended();

    beforeEach(() => {
        jest.clearAllMocks();
        mockRocketchatApiRequest.mockResolvedValue({ success: true });
        mockRocketchatApiRequestAllItems.mockResolvedValue([]);
        mockRocketchatApiRequestUpload.mockResolvedValue({ success: true });
    });

    it('send — builds message object with additional fields', async () => {
        const ctx = createMockExecuteFunctions({
            resource: 'message',
            operation: 'send',
            params: {
                roomId: 'room123',
                text: 'Hello world',
                additionalFields: { alias: 'Bot', emoji: ':robot:' },
            },
        });

        await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequest).toHaveBeenCalledWith(
            'POST', 'chat.sendMessage',
            { message: { rid: 'room123', msg: 'Hello world', alias: 'Bot', emoji: ':robot:' } },
        );
    });

    it('get — fetches a single message by ID', async () => {
        const ctx = createMockExecuteFunctions({
            resource: 'message',
            operation: 'get',
            params: { messageId: 'msg123' },
        });

        mockRocketchatApiRequest.mockResolvedValue({ message: { _id: 'msg123', msg: 'test' } });
        await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequest).toHaveBeenCalledWith(
            'GET', 'chat.getMessage', {}, { msgId: 'msg123' },
        );
    });

    it('react — auto-formats emoji', async () => {
        const ctx = createMockExecuteFunctions({
            resource: 'message',
            operation: 'react',
            params: { messageId: 'msg123', emoji: 'thumbsup', shouldReact: true },
        });

        await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequest).toHaveBeenCalledWith(
            'POST', 'chat.react',
            { messageId: 'msg123', emoji: ':thumbsup:', shouldReact: true },
        );
    });

    it('follow — sends POST with mid', async () => {
        const ctx = createMockExecuteFunctions({
            resource: 'message',
            operation: 'follow',
            params: { messageId: 'msg123' },
        });

        await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequest).toHaveBeenCalledWith(
            'POST', 'chat.followMessage', { mid: 'msg123' },
        );
    });

    it('unfollow — sends POST with mid', async () => {
        const ctx = createMockExecuteFunctions({
            resource: 'message',
            operation: 'unfollow',
            params: { messageId: 'msg123' },
        });

        await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequest).toHaveBeenCalledWith(
            'POST', 'chat.unfollowMessage', { mid: 'msg123' },
        );
    });

    it('report — sends POST with messageId and description', async () => {
        const ctx = createMockExecuteFunctions({
            resource: 'message',
            operation: 'report',
            params: { messageId: 'msg123', reportDescription: 'Spam content' },
        });

        await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequest).toHaveBeenCalledWith(
            'POST', 'chat.reportMessage',
            { messageId: 'msg123', description: 'Spam content' },
        );
    });

    it('replyThread — sends message with tmid', async () => {
        const ctx = createMockExecuteFunctions({
            resource: 'message',
            operation: 'replyThread',
            params: { roomId: 'room123', text: 'Thread reply', tmid: 'parent123' },
        });

        await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequest).toHaveBeenCalledWith(
            'POST', 'chat.sendMessage',
            { message: { rid: 'room123', msg: 'Thread reply', tmid: 'parent123' } },
        );
    });

    it('uploadFile — calls upload function with binary data', async () => {
        const ctx = createMockExecuteFunctions({
            resource: 'message',
            operation: 'uploadFile',
            params: {
                roomId: 'room123',
                binaryPropertyName: 'data',
                uploadAdditionalFields: { description: 'My file', tmid: '' },
            },
        });

        await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequestUpload).toHaveBeenCalledWith(
            'room123',
            expect.any(Buffer),
            'test.pdf',
            'My file',
            '',
        );
    });

    it('schedule — validates date and sends', async () => {
        const ctx = createMockExecuteFunctions({
            resource: 'message',
            operation: 'schedule',
            params: { roomId: 'room123', text: 'Later!', scheduledAt: '2026-12-25T10:00:00.000Z' },
        });

        await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequest).toHaveBeenCalledWith(
            'POST', 'chat.scheduleMessage',
            { roomId: 'room123', msg: 'Later!', scheduledAt: '2026-12-25T10:00:00.000Z' },
        );
    });

    it('search — paginates search results', async () => {
        const ctx = createMockExecuteFunctions({
            resource: 'message',
            operation: 'search',
            params: { roomId: 'room123', searchText: 'hello', returnAll: false, limit: 20 },
        });

        mockRocketchatApiRequestAllItems.mockResolvedValue([{ _id: 'm1' }]);
        await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequestAllItems).toHaveBeenCalledWith(
            'messages', 'GET', 'chat.search', {}, { roomId: 'room123', searchText: 'hello' }, 20,
        );
    });
});

// ═══════════════════════════════════════════
//  Error handling
// ═══════════════════════════════════════════

describe('RocketChatExtended — Error handling', () => {
    const node = new RocketChatExtended();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('continueOnFail — returns error json instead of throwing', async () => {
        mockRocketchatApiRequest.mockRejectedValue(new Error('API failure'));

        const ctx = createMockExecuteFunctions({
            resource: 'channel',
            operation: 'delete',
            params: { roomId: 'room123' },
        });
        (ctx as any).continueOnFail = () => true;

        const result = await node.execute.call(ctx as any);

        expect(result[0][0].json).toEqual({ error: 'API failure' });
    });

    it('throws when continueOnFail is false', async () => {
        mockRocketchatApiRequest.mockRejectedValue(new Error('API failure'));

        const ctx = createMockExecuteFunctions({
            resource: 'channel',
            operation: 'delete',
            params: { roomId: 'room123' },
        });

        await expect(node.execute.call(ctx as any)).rejects.toThrow('API failure');
    });
});

// ═══════════════════════════════════════════
//  Multiple items
// ═══════════════════════════════════════════

describe('RocketChatExtended — Multiple items', () => {
    const node = new RocketChatExtended();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('processes multiple items in a single execution', async () => {
        mockRocketchatApiRequest
            .mockResolvedValueOnce({ success: true, msg: 'sent1' })
            .mockResolvedValueOnce({ success: true, msg: 'sent2' });

        const ctx = createMockExecuteFunctions({
            resource: 'message',
            operation: 'send',
            params: { roomId: 'room123', text: 'Hello', additionalFields: {} },
            items: [{}, {}],
        });

        const result = await node.execute.call(ctx as any);

        expect(result[0]).toHaveLength(2);
        expect(mockRocketchatApiRequest).toHaveBeenCalledTimes(2);
    });

    it('handles array responses (getAll)', async () => {
        mockRocketchatApiRequestAllItems.mockResolvedValue([
            { _id: 'ch1', name: 'general' },
            { _id: 'ch2', name: 'random' },
        ]);

        const ctx = createMockExecuteFunctions({
            resource: 'channel',
            operation: 'getAll',
            params: { returnAll: true },
        });

        const result = await node.execute.call(ctx as any);

        expect(result[0]).toHaveLength(2);
        expect(result[0][0].json).toEqual({ _id: 'ch1', name: 'general' });
        expect(result[0][1].json).toEqual({ _id: 'ch2', name: 'random' });
    });
});
