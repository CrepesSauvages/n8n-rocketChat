import {
    validateEmoji,
    validateISODate,
    getChannelEndpoint,
} from '../GenericFunctions';

// ═══════════════════════════════════════════
//  validateEmoji
// ═══════════════════════════════════════════

describe('validateEmoji', () => {
    it('returns already formatted emoji unchanged', () => {
        expect(validateEmoji(':thumbsup:')).toBe(':thumbsup:');
    });

    it('wraps emoji name missing both colons', () => {
        expect(validateEmoji('rocket')).toBe(':rocket:');
    });

    it('wraps emoji missing trailing colon', () => {
        expect(validateEmoji(':rocket')).toBe(':rocket:');
    });

    it('wraps emoji missing leading colon', () => {
        expect(validateEmoji('rocket:')).toBe(':rocket:');
    });

    it('trims whitespace and wraps', () => {
        expect(validateEmoji('  fire  ')).toBe(':fire:');
    });

    it('handles already valid emoji with spaces', () => {
        expect(validateEmoji('  :smile:  ')).toBe(':smile:');
    });
});

// ═══════════════════════════════════════════
//  validateISODate
// ═══════════════════════════════════════════

describe('validateISODate', () => {
    it('accepts valid ISO 8601 date', () => {
        expect(() => validateISODate('2026-01-01T00:00:00.000Z', 'testField')).not.toThrow();
    });

    it('accepts valid short ISO date', () => {
        expect(() => validateISODate('2026-03-02', 'testField')).not.toThrow();
    });

    it('throws on invalid date string', () => {
        expect(() => validateISODate('not-a-date', 'Scheduled Date'))
            .toThrow('Invalid date format for "Scheduled Date"');
    });

    it('throws on empty string', () => {
        expect(() => validateISODate('', 'Latest')).toThrow('Invalid date format');
    });

    it('includes the field name in error message', () => {
        expect(() => validateISODate('abc', 'Oldest'))
            .toThrow('"Oldest"');
    });
});

// ═══════════════════════════════════════════
//  getChannelEndpoint
// ═══════════════════════════════════════════

describe('getChannelEndpoint', () => {
    it('returns "channels" for channel type', () => {
        expect(getChannelEndpoint('channel')).toBe('channels');
    });

    it('returns "groups" for group type', () => {
        expect(getChannelEndpoint('group')).toBe('groups');
    });

    it('returns "channels" for unknown type (fallback)', () => {
        expect(getChannelEndpoint('unknown')).toBe('channels');
    });
});

// ═══════════════════════════════════════════
//  rocketchatApiRequest (mocked)
// ═══════════════════════════════════════════

describe('rocketchatApiRequest', () => {
    // We need to test this with a mocked context
    const mockCredentials = {
        serverUrl: 'https://chat.example.com',
        userId: 'test-user-id',
        authToken: 'test-auth-token',
    };

    const createMockContext = (httpResponse: any, shouldThrow = false) => {
        const ctx = {
            getCredentials: jest.fn().mockResolvedValue(mockCredentials),
            getNode: jest.fn().mockReturnValue({ name: 'TestNode', type: 'test' }),
            helpers: {
                httpRequestWithAuthentication: jest.fn(),
            },
        };

        if (shouldThrow) {
            ctx.helpers.httpRequestWithAuthentication.mockRejectedValue(httpResponse);
        } else {
            ctx.helpers.httpRequestWithAuthentication.mockResolvedValue(httpResponse);
        }

        return ctx;
    };

    it('makes a GET request with correct URL and no body', async () => {
        const { rocketchatApiRequest } = require('../GenericFunctions');
        const mockCtx = createMockContext({ success: true, channels: [] });

        const result = await rocketchatApiRequest.call(mockCtx, 'GET', 'channels.list', {}, { count: 10 });

        expect(result).toEqual({ success: true, channels: [] });

        const callArgs = mockCtx.helpers.httpRequestWithAuthentication.mock.calls[0];
        expect(callArgs[0]).toBe('rocketChatExtendedApi');

        const options = callArgs[1];
        expect(options.method).toBe('GET');
        expect(options.url).toBe('https://chat.example.com/api/v1/channels.list');
        expect(options.body).toBeUndefined();
        expect(options.qs).toEqual({ count: 10 });
    });

    it('makes a POST request with body', async () => {
        const { rocketchatApiRequest } = require('../GenericFunctions');
        const mockCtx = createMockContext({ success: true });

        await rocketchatApiRequest.call(mockCtx, 'POST', 'channels.create', { name: 'test-channel' });

        const options = mockCtx.helpers.httpRequestWithAuthentication.mock.calls[0][1];
        expect(options.method).toBe('POST');
        expect(options.body).toEqual({ name: 'test-channel' });
    });

    it('strips trailing slash from server URL', async () => {
        const { rocketchatApiRequest } = require('../GenericFunctions');
        const mockCtx = createMockContext({ success: true });
        mockCtx.getCredentials.mockResolvedValue({ ...mockCredentials, serverUrl: 'https://chat.example.com/' });

        await rocketchatApiRequest.call(mockCtx, 'GET', 'me');

        const options = mockCtx.helpers.httpRequestWithAuthentication.mock.calls[0][1];
        expect(options.url).toBe('https://chat.example.com/api/v1/me');
    });

    it('throws NodeApiError on failure', async () => {
        const { rocketchatApiRequest } = require('../GenericFunctions');
        const mockCtx = createMockContext(
            { message: 'Unauthorized', statusCode: 401, body: { errorType: 'error-not-authorized' } },
            true,
        );

        await expect(rocketchatApiRequest.call(mockCtx, 'GET', 'me')).rejects.toThrow();
    });
});

// ═══════════════════════════════════════════
//  rocketchatApiRequestAllItems (mocked)
// ═══════════════════════════════════════════

describe('rocketchatApiRequestAllItems', () => {
    const mockCredentials = {
        serverUrl: 'https://chat.example.com',
        userId: 'test-user-id',
        authToken: 'test-auth-token',
    };

    it('paginates and collects all items', async () => {
        const { rocketchatApiRequestAllItems } = require('../GenericFunctions');

        // pageSize is 100 internally, so total must exceed first batch to trigger page 2
        const page1 = { channels: Array.from({ length: 100 }, (_, i) => ({ _id: `${i}` })), total: 150 };
        const page2 = { channels: Array.from({ length: 50 }, (_, i) => ({ _id: `${100 + i}` })), total: 150 };

        const mockCtx = {
            getCredentials: jest.fn().mockResolvedValue(mockCredentials),
            getNode: jest.fn().mockReturnValue({ name: 'TestNode', type: 'test' }),
            helpers: {
                httpRequestWithAuthentication: jest.fn()
                    .mockResolvedValueOnce(page1)
                    .mockResolvedValueOnce(page2),
            },
        };

        const result = await rocketchatApiRequestAllItems.call(mockCtx, 'channels', 'GET', 'channels.list');
        expect(result).toHaveLength(150);
        expect(mockCtx.helpers.httpRequestWithAuthentication).toHaveBeenCalledTimes(2);
    });

    it('respects limit parameter', async () => {
        const { rocketchatApiRequestAllItems } = require('../GenericFunctions');

        const page1 = { channels: [{ _id: '1' }, { _id: '2' }, { _id: '3' }], total: 10 };

        const mockCtx = {
            getCredentials: jest.fn().mockResolvedValue(mockCredentials),
            getNode: jest.fn().mockReturnValue({ name: 'TestNode', type: 'test' }),
            helpers: {
                httpRequestWithAuthentication: jest.fn().mockResolvedValue(page1),
            },
        };

        const result = await rocketchatApiRequestAllItems.call(mockCtx, 'channels', 'GET', 'channels.list', {}, {}, 2);
        expect(result).toHaveLength(2);
    });

    it('stops when response has no items array', async () => {
        const { rocketchatApiRequestAllItems } = require('../GenericFunctions');

        const mockCtx = {
            getCredentials: jest.fn().mockResolvedValue(mockCredentials),
            getNode: jest.fn().mockReturnValue({ name: 'TestNode', type: 'test' }),
            helpers: {
                httpRequestWithAuthentication: jest.fn().mockResolvedValue({ success: true }),
            },
        };

        const result = await rocketchatApiRequestAllItems.call(mockCtx, 'channels', 'GET', 'channels.list');
        expect(result).toHaveLength(0);
    });
});
