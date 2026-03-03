/**
 * Unit tests for User operations.
 */

const mockRocketchatApiRequest = jest.fn();
const mockRocketchatApiRequestAllItems = jest.fn();

jest.mock('../GenericFunctions', () => ({
    rocketchatApiRequest: mockRocketchatApiRequest,
    rocketchatApiRequestAllItems: mockRocketchatApiRequestAllItems,
    getChannelEndpoint: jest.fn(),
    getChannels: jest.fn().mockResolvedValue([]),
    getJoinedChannels: jest.fn().mockResolvedValue([]),
    getUsers: jest.fn().mockResolvedValue([]),
    validateEmoji: jest.fn(),
    validateISODate: jest.fn(),
}));

import { RocketChatExtended } from '../RocketChatExtended.node';

function createUserContext(operation: string, params: Record<string, any> = {}, items: any[] = [{}]) {
    const paramMap: Record<string, any> = {
        resource: 'user',
        operation,
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
        helpers: {},
    };
}

describe('RocketChatExtended — User', () => {
    const node = new RocketChatExtended();

    beforeEach(() => {
        jest.clearAllMocks();
        mockRocketchatApiRequest.mockResolvedValue({ success: true, user: { _id: 'user123' } });
        mockRocketchatApiRequestAllItems.mockResolvedValue([]);
    });

    it('create — sends required fields', async () => {
        const ctx = createUserContext('create', {
            email: 'test@example.com',
            name: 'Test User',
            password: 'secretpassword',
            username: 'testuser',
            additionalFields: {},
        });

        const result = await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequest).toHaveBeenCalledWith(
            'POST', 'users.create',
            { email: 'test@example.com', name: 'Test User', password: 'secretpassword', username: 'testuser' },
        );
        expect(result[0]).toHaveLength(1);
    });

    it('create — processes roles correctly', async () => {
        const ctx = createUserContext('create', {
            email: 'admin@example.com',
            name: 'Admin User',
            password: 'secretpassword',
            username: 'adminuser',
            additionalFields: {
                roles: 'admin, user , moderator',
            },
        });

        await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequest).toHaveBeenCalledWith(
            'POST', 'users.create',
            {
                email: 'admin@example.com',
                name: 'Admin User',
                password: 'secretpassword',
                username: 'adminuser',
                roles: ['admin', 'user', 'moderator'],
            },
        );
    });

    it('delete — uses POST with userId', async () => {
        const ctx = createUserContext('delete', { userId: 'u123' });

        await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequest).toHaveBeenCalledWith(
            'POST', 'users.delete', { userId: 'u123' },
        );
    });

    it('get — uses GET with userId', async () => {
        const ctx = createUserContext('get', { userId: 'u123' });

        await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequest).toHaveBeenCalledWith(
            'GET', 'users.info', {}, { userId: 'u123' },
        );
    });

    it('getAll — delegates to rocketchatApiRequestAllItems', async () => {
        const ctx = createUserContext('getAll', { returnAll: false, limit: 10 });
        mockRocketchatApiRequestAllItems.mockResolvedValue([{ _id: 'u1' }, { _id: 'u2' }]);

        const result = await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequestAllItems).toHaveBeenCalledWith(
            'users', 'GET', 'users.list', {}, {}, 10,
        );
        expect(result[0]).toHaveLength(2);
    });

    it('getPresence — uses GET with userId', async () => {
        const ctx = createUserContext('getPresence', { userId: 'u123' });

        await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequest).toHaveBeenCalledWith(
            'GET', 'users.getPresence', {}, { userId: 'u123' },
        );
    });

    it('setAvatar — uses POST with userId and avatarUrl', async () => {
        const ctx = createUserContext('setAvatar', { userId: 'u123', avatarUrl: 'https://example.com/avatar.png' });

        await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequest).toHaveBeenCalledWith(
            'POST', 'users.setAvatar', { userId: 'u123', avatarUrl: 'https://example.com/avatar.png' },
        );
    });

    it('setStatus — uses POST with message and status', async () => {
        const ctx = createUserContext('setStatus', { message: 'Out to lunch', status: 'away' });

        await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequest).toHaveBeenCalledWith(
            'POST', 'users.setStatus', { message: 'Out to lunch', status: 'away' },
        );
    });

    it('update — structures payload correctly', async () => {
        const ctx = createUserContext('update', {
            userId: 'u123',
            updateFields: {
                name: 'New Name',
                active: false,
            },
        });

        await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequest).toHaveBeenCalledWith(
            'POST', 'users.update',
            {
                userId: 'u123',
                data: { name: 'New Name', active: false },
            },
        );
    });

    it('update — processes roles correctly', async () => {
        const ctx = createUserContext('update', {
            userId: 'u123',
            updateFields: {
                roles: 'admin, user',
            },
        });

        await node.execute.call(ctx as any);

        expect(mockRocketchatApiRequest).toHaveBeenCalledWith(
            'POST', 'users.update',
            {
                userId: 'u123',
                data: { roles: ['admin', 'user'] },
            },
        );
    });
});
