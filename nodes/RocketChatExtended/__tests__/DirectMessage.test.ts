/**
 * Unit tests for Direct Message operations.
 */

const mockRocketchatApiRequest = jest.fn();
const mockRocketchatApiRequestAllItems = jest.fn();

jest.mock('../GenericFunctions', () => ({
    rocketchatApiRequest: mockRocketchatApiRequest,
    rocketchatApiRequestAllItems: mockRocketchatApiRequestAllItems,
    rocketchatApiRequestUpload: jest.fn(),
    getChannelEndpoint: jest.requireActual('../GenericFunctions').getChannelEndpoint,
    getChannels: jest.fn().mockResolvedValue([]),
    getJoinedChannels: jest.fn().mockResolvedValue([]),
    getUsers: jest.fn().mockResolvedValue([]),
    validateEmoji: jest.requireActual('../GenericFunctions').validateEmoji,
    validateISODate: jest.requireActual('../GenericFunctions').validateISODate,
}));

import { RocketChatExtended } from '../RocketChatExtended.node';

function createDmContext(operation: string, params: Record<string, any> = {}, items: any[] = [{}]) {
    const paramMap: Record<string, any> = {
        resource: 'directMessage',
        operation,
        returnAll: false,
        limit: 50,
        excludeSelf: false,
        ...params,
    };

    return {
        getInputData: () => items.map((item: any) => ({ json: item })),
        getNodeParameter: (name: string, _idx: number, fallback?: any) => {
            if (name in paramMap) {return paramMap[name];}
            if (fallback !== undefined) {return fallback;}
            return '';
        },
        continueOnFail: () => false,
        getNode: () => ({ name: 'TestNode', type: 'test' }),
        helpers: {},
    };
}

describe('RocketChatExtended — Direct Message', () => {
    const node = new RocketChatExtended();

    beforeEach(() => {
        jest.clearAllMocks();
        mockRocketchatApiRequest.mockResolvedValue({ success: true });
        mockRocketchatApiRequestAllItems.mockResolvedValue([]);
    });

    it('create — single user sends username', async () => {
        const ctx = createDmContext('create', { dmUsername: 'bob' });
        mockRocketchatApiRequest.mockResolvedValue({ room: { _id: 'dm123' } });

        const result = await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequest).toHaveBeenCalledWith(
            'POST', 'dm.create', { username: 'bob', excludeSelf: false },
        );
        expect(result[0]).toHaveLength(1);
    });

    it('create — multi-party DM sends usernames', async () => {
        const ctx = createDmContext('create', { dmUsername: 'bob,alice,carl' });

        await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequest).toHaveBeenCalledWith(
            'POST', 'dm.create', { usernames: 'bob,alice,carl', excludeSelf: false },
        );
    });

    it('create — excludeSelf flag', async () => {
        const ctx = createDmContext('create', { dmUsername: 'bob', excludeSelf: true });

        await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequest).toHaveBeenCalledWith(
            'POST', 'dm.create', { username: 'bob', excludeSelf: true },
        );
    });

    it('close — sends POST with roomId', async () => {
        const ctx = createDmContext('close', { roomId: 'dm123' });

        await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequest).toHaveBeenCalledWith(
            'POST', 'dm.close', { roomId: 'dm123' },
        );
    });

    it('open — sends POST with roomId', async () => {
        const ctx = createDmContext('open', { roomId: 'dm123' });

        await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequest).toHaveBeenCalledWith(
            'POST', 'dm.open', { roomId: 'dm123' },
        );
    });

    it('send — builds message with additional fields', async () => {
        const ctx = createDmContext('send', {
            roomId: 'dm123',
            text: 'Hello!',
            additionalFields: { alias: 'Bot', tmid: 'thread1' },
        });

        await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequest).toHaveBeenCalledWith(
            'POST', 'chat.sendMessage',
            { message: { rid: 'dm123', msg: 'Hello!', alias: 'Bot', tmid: 'thread1' } },
        );
    });

    it('send — minimal message without additional fields', async () => {
        const ctx = createDmContext('send', {
            roomId: 'dm123',
            text: 'Hi',
            additionalFields: {},
        });

        await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequest).toHaveBeenCalledWith(
            'POST', 'chat.sendMessage',
            { message: { rid: 'dm123', msg: 'Hi' } },
        );
    });

    it('getMessages — paginates dm messages', async () => {
        const ctx = createDmContext('getMessages', { roomId: 'dm123', returnAll: false, limit: 20 });

        mockRocketchatApiRequestAllItems.mockResolvedValue([{ _id: 'm1' }]);
        await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequestAllItems).toHaveBeenCalledWith(
            'messages', 'GET', 'dm.messages', {}, { roomId: 'dm123' }, 20,
        );
    });

    it('getAll — lists dm conversations', async () => {
        const ctx = createDmContext('getAll', { returnAll: true });

        mockRocketchatApiRequestAllItems.mockResolvedValue([{ _id: 'dm1' }, { _id: 'dm2' }]);
        const result = await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequestAllItems).toHaveBeenCalledWith(
            'ims', 'GET', 'dm.list', {}, {}, 0,
        );
        expect(result[0]).toHaveLength(2);
    });

    it('members — lists dm room members', async () => {
        const ctx = createDmContext('members', { roomId: 'dm123', returnAll: false, limit: 10 });

        mockRocketchatApiRequestAllItems.mockResolvedValue([{ _id: 'u1' }]);
        await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequestAllItems).toHaveBeenCalledWith(
            'members', 'GET', 'dm.members', {}, { roomId: 'dm123' }, 10,
        );
    });

    it('setTopic — sends POST with roomId and topic', async () => {
        const ctx = createDmContext('setTopic', { roomId: 'dm123', topic: 'Project sync' });

        await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequest).toHaveBeenCalledWith(
            'POST', 'dm.setTopic', { roomId: 'dm123', topic: 'Project sync' },
        );
    });

    it('uploadFile — calls rocketchatApiRequestUpload', async () => {
        const ctx = createDmContext('uploadFile', {
            roomId: 'dm123',
            binaryPropertyName: 'data',
            uploadAdditionalFields: { description: 'test file', tmid: 'thread1' },
        });

        // Mock binary helpers
        ctx.helpers = {
            assertBinaryData: jest.fn().mockReturnValue({ fileName: 'test.png' }),
            getBinaryDataBuffer: jest.fn().mockResolvedValue(Buffer.from('dummy')),
        };

        const mockRocketchatApiRequestUpload = jest.requireMock('../GenericFunctions').rocketchatApiRequestUpload;
        mockRocketchatApiRequestUpload.mockResolvedValue({ success: true });

        await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequestUpload).toHaveBeenCalledWith(
            'dm123',
            Buffer.from('dummy'),
            'test.png',
            'test file',
            'thread1'
        );
    });
});
