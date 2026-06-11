const axios = require('axios');
const { probeUrl } = require('../../worker/src/prober');

jest.mock('axios');

describe('probeUrl', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('returns "up" status with latency for a successful response', async () => {
        axios.get.mockResolvedValue({
            status: 200,
        });

        const result = await probeUrl('https://example.com');

        expect(result.status).toBe ('up');
        expect(result.status_code).toBe(200);
        expect(result.error_message).toBeNull();
        expect(typeof result.latency_ms).toBe('number');
        expect(result.latency_ms).toBeGreaterThanOrEqual(0);
    });

    it('returns "down" status for a failed server response a 500 server error', async () => {
        
        axios.get.mockResolvedValue({
            status: 500,
        });

        const result = await probeUrl('https://example.com');
        expect(result.status).toBe ('down');
        expect(result.status_code).toBe(500);
        expect(result.error_message).toBe('Received status code 500');

    });

    it('returns "down" status for a non 2xx response', async () => {
        
        axios.get.mockResolvedValue({
            status: 404,
        });

        const result = await probeUrl('https://example.com');
        expect(result.status).toBe ('down');
        expect(result.status_code).toBe(404);
        expect(result.error_message).toBe('Received status code 404');  
        
    });

    it('returns "down" status for a timeout with error code when the connection times out', async () => {
        const timeoutError = new Error('timeout of 10000ms exceeded');
        timeoutError.code = 'ECONNABORTED';
        axios.get.mockRejectedValue(timeoutError);
        
        const result = await probeUrl('https://example.com');
        expect(result.status).toBe ('down');
        expect(result.status_code).toBe(null);
        expect(result.error_message).toBe('ECONNABORTED');
    });

    it('returns "down" status with error when the domain is not found or does not exist', async () => {
        const dnsError = new Error('getaddrinfo ENOTFOUND example.com');
        dnsError.code = 'ENOTFOUND';
        axios.get.mockRejectedValue(dnsError);
        
        const result = await probeUrl('https://example.com');
        expect(result.status).toBe ('down');
        expect(result.status_code).toBe(null);
        expect(result.error_message).toBe('ENOTFOUND');
    });

    it('returns "down" status with the raw error when no error code exists', async()=>{
        const genericError = new Error('Something unexpected happened');
        axios.get.mockRejectedValue(genericError);
        
        const result = await probeUrl('https://example.com');
        expect(result.status).toBe ('down');
        expect(result.status_code).toBe(null);
        expect(result.error_message).toBe('Something unexpected happened');
    });

    it('call axios.get with a correct url', async()=>{
        axios.get.mockResolvedValue({status: 200});
        await probeUrl('https://api.github.com');
        expect(axios.get).toHaveBeenCalledWith('https://api.github.com', {
            timeout: 10000,
            maxRedirects: 5,
            validateStatus: expect.any(Function), });


        
    });

})
