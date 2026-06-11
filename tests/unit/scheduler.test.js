jest.mock('../../worker/src/prober.js');
jest.mock('../../worker/src/db/conPool.js');
jest.mock('../../worker/src/services/email.js');

const {checkMonitors,resetFailureCounts} = require('../../worker/src/scheduler');
const {probeUrl} = require('../../worker/src/prober');
const pool = require('../../worker/src/db/conPool');
const {sendEmailAlert} = require('../../worker/src/services/email');

const mockMonitor = {
    id: 1,
    name: 'Test Monitor',
    url: 'https://example.com',
}

describe('checkMonitors', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
        resetFailureCounts();

        pool.query.mockResolvedValue({ rows: [] });
    });

    it('writes an "up" ping result to ping_logs and doesn nott send an alert', async ()=>{

        probeUrl.mockResolvedValue({
            status: 'up',
            status_code: 200,
            latency_ms: 100,
            error_message: null,
        });

        await checkMonitors(mockMonitor);

        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO ping_logs'),
            [1, 'up', 200, 100, null]    
        )

        expect(sendEmailAlert).not.toHaveBeenCalled();
    });

    it('does not send an alert on the 1st consecutive failure', async ()=>{

        probeUrl.mockResolvedValue({
            status: 'down',
            status_code: 500,
            latency_ms: 100,
            error_message: 'ETIMEDOUT',
        });

        await checkMonitors(mockMonitor);

        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO ping_logs'),
            [1, 'down', 500, 100, 'ETIMEDOUT'],    
        )

        expect(sendEmailAlert).not.toHaveBeenCalled();
        
    });   

    it('does not send an alert on the 2nd consecutive failure', async ()=>{

        probeUrl.mockResolvedValue({
            status: 'down',
            status_code: 500,
            latency_ms: 100,
            error_message: 'ETIMEDOUT',
        });

        await checkMonitors(mockMonitor);
        await checkMonitors(mockMonitor);

        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO ping_logs'),
            [1, 'down', 500, 100, 'ETIMEDOUT'],
        )


        expect(sendEmailAlert).not.toHaveBeenCalled();
        
    });

    it('send an alert on the 3rd consecutive failure', async ()=>{

        probeUrl.mockResolvedValue({
            status: 'down',
            status_code: 500,
            latency_ms: 100,
            error_message: 'ETIMEDOUT',
        });

        await checkMonitors(mockMonitor);
        await checkMonitors(mockMonitor);
        await checkMonitors(mockMonitor);

        

        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO ping_logs'),
            [1, 'down', 500, 100, 'ETIMEDOUT'],
        )

        expect(sendEmailAlert).toHaveBeenCalledWith(

            expect.objectContaining({
                monitor: mockMonitor,
                status: 'down',
                error_message: 'ETIMEDOUT',
            })
        );
        
    });       

    it('doesn not send a duplicate alert on the 4th,5th... consecutive failure', async ()=>{
        probeUrl.mockResolvedValue({
            status: 'down',
            status_code: 500,
            latency_ms: 100,
            error_message: 'ETIMEDOUT',
        });
        
        await checkMonitors(mockMonitor);
        await checkMonitors(mockMonitor);
        await checkMonitors(mockMonitor);
        await checkMonitors(mockMonitor);
        await checkMonitors(mockMonitor);


        expect(sendEmailAlert).toHaveBeenCalledTimes(1);

        });

    it('send a RECOVERY alert when the status returns to "up" after 3+ failures', async ()=>{

        probeUrl.mockResolvedValue({
            status: 'down',
            status_code: 500,
            latency_ms: 100,
            error_message: 'ETIMEDOUT',
        });

        await checkMonitors(mockMonitor);
        await checkMonitors(mockMonitor);
        await checkMonitors(mockMonitor);

        probeUrl.mockResolvedValue({
            status: 'up',
            status_code: 200,
            latency_ms: 100,
            error_message: null,
        });

        await checkMonitors(mockMonitor);

        expect(sendEmailAlert).toHaveBeenCalledWith({
            monitor: mockMonitor,
            status: 'up',
            latency_ms: 100,

        })
    });

    it('resets the failure count when the status returns to "up" after 3+ failures', async ()=>{

        probeUrl.mockResolvedValue({
            status: 'down',
            status_code: 500,
            latency_ms: 100,
            error_message: 'ETIMEDOUT',
        });

        await checkMonitors(mockMonitor);
        await checkMonitors(mockMonitor);
        await checkMonitors(mockMonitor);

        probeUrl.mockResolvedValue({
            status: 'up',
            status_code: 200,
            latency_ms: 100,
            error_message: null,
        });

        await checkMonitors(mockMonitor);

        jest.clearAllMocks();

        probeUrl.mockResolvedValue({
            status: 'down',
            status_code: 500,
            latency_ms: 100,
            error_message: 'ETIMEDOUT',
        });

        await checkMonitors(mockMonitor);

        expect(sendEmailAlert).not.toHaveBeenCalled();

    });

})
