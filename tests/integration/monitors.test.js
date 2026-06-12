const request = require('supertest');
const app = require('../../api/src/index');
const pool = require('../../api/src/db/conPool');

describe('Monitor API', () => {

    beforeEach(async () => {
        await pool.query('DELETE FROM ping_logs');
        await pool.query('DELETE FROM monitors');
    });

    afterAll(async () => {
        await pool.end();
    });

        describe('POST /monitors', () => {

            it('create a monitor with valid data', async () => {
                
                const response = await request(app)
                    .post('/monitors')
                    .send({
                        name: 'Test Monitor',
                        url: 'https://example.com',
                        interval_seconds: 60,
                    });

                    expect(response.status).toBe(201);
                    expect(response.body.data).toMatchObject({
                        name: 'Test Monitor',
                        url: 'https://example.com',
                        interval_seconds: 60,
                        is_active: true
                    });

                    expect(response.body.data.id).toBeDefined();
        
            });

            it('create a monitor without interval_seconds defaults should be set to 60', async () => {
                const response = await request(app)

                    .post('/monitors')
                    .send({
                        name: 'Test Monitor',
                        url: 'https://example.com',
                    });

                    expect(response.status).toBe(201);
                    expect(response.body.data.interval_seconds).toBe(60);
            });
                    

            it('reject a monitor with no name', async () => {
                const response = await request(app)

                    .post('/monitors')
                    .send({
                        url: 'https://example.com',
                    });

                    expect(response.status).toBe(400);
                    expect(response.body.error.message).toMatch(/name/i);

                    });

            it('reject a monitor with no url', async () => {
                const response = await request(app)

                    .post('/monitors')
                    .send({
                        name: 'Test Monitor',
                    });

                    expect(response.status).toBe(400);
                    expect(response.body.error.message).toMatch(/url/i);
            });

            it('reject interval_seconds below 30',async()=>{
                const response = await request(app)

                    .post('/monitors')
                    .send({
                        name: 'Test Monitor',
                        url: 'https://example.com',
                        interval_seconds: 29
                    });

                    expect(response.status).toBe(400);
                    expect(response.body.error.message).toMatch(/interval/i);

            });

            it('reject interval_seconds above 3600',async()=>{
                const response = await request(app)

                    .post('/monitors')
                    .send({
                        name: 'Test Monitor',
                        url: 'https://example.com',
                        interval_seconds: 3601
                    });

                    expect(response.status).toBe(400);
                    expect(response.body.error.message).toMatch(/interval/i);
            })            
            
        });


        describe('GET /monitors', () => {
            it('return empty array when no monitors exist',async()=>{
                const response = await request(app)
                    .get('/monitors');

                    expect(response.status).toBe(200);
                    expect(response.body.data).toEqual([]);
                    expect(response.body.count).toBe(0);
                
            });

            it('return all created monitors',async()=>{
                await request(app)
                    .post('/monitors')
                    .send({
                        name: 'Test Monitor 1',
                        url: 'https://example.com',
                        interval_seconds: 60,
                    });
                await request(app)
                    .post('/monitors')
                    .send({
                        name: 'Test Monitor 2',
                        url: 'https://example.com',
                        interval_seconds: 60,
                    });
                await request(app)
                    .post('/monitors')
                    .send({
                        name: 'Test Monitor 3',
                        url: 'https://example.com',
                        interval_seconds: 60,
                    });

                const response = await request(app)
                    .get('/monitors');

                    expect(response.status).toBe(200);
                    expect(response.body.count).toBe(3);
                    expect(response.body.data).toHaveLength(3);
                
            })            

        });

        describe('GET /monitors/:id', () => {

            it('return a single monitor by id',async()=>{
                const created = await request(app)
                    .post('/monitors')
                    .send({
                        name: 'Test Monitor',
                        url: 'https://example.com',
                        interval_seconds: 60,
                    });

                    const monitorId = created.body.data.id;

                    const response = await request(app)
                        .get(`/monitors/${monitorId}`);

                        expect(response.status).toBe(200);
                        expect(response.body.data.name).toBe('Test Monitor');

                        });
            it('retrun 404 when monitor does not exist',async()=>{
                const response = await request(app)
                    .get('/monitors/2000');

                    expect(response.status).toBe(404);
            });

            it('for a non numeric id return 404',async()=>{
                const response = await request(app)
                    .get('/monitors/abc');

                    expect(response.status).toBe(400);
            });  
            });


        describe('PATCH /monitors/:id', () => {
            it('updates name of a monitor',async()=>{
                created = await request(app)
                    .post('/monitors')
                    .send({
                        name: 'Test Monitor',
                        url: 'https://example.com',
                        interval_seconds: 60,
                    });

                    const monitorId = created.body.data.id;

                    const response = await request(app)
                        .patch(`/monitors/${monitorId}`)
                        .send({
                            name: 'Updated Test Monitor',
                        });

                        expect(response.status).toBe(200);
                        expect(response.body.data.name).toBe('Updated Test Monitor');
            });

            it('return 400 when no fields are provided',async()=>{
                created = await request(app)
                    .post('/monitors')
                    .send({
                        name: 'Test Monitor',
                        url: 'https://example.com',
                        interval_seconds: 60,
                    });

                    const monitorId = created.body.data.id;

                    const response = await request(app)
                        .patch(`/monitors/${monitorId}`)
                        .send({});

                        expect(response.status).toBe(400);
            });              
        });

        describe('DELETE /monitors/:id', () => {
            it('deletes a monitor and cascades to ping logs',async()=>{
                const created = await request(app)
                    .post('/monitors')
                    .send({
                        name: 'Test Monitor',
                        url: 'https://example.com',
                        interval_seconds: 60,
                    });

                    const monitorId = created.body.data.id;

                await pool.query(
                    'INSERT INTO ping_logs (monitor_id, status, status_code, latency_ms, error_message) VALUES ($1, $2, $3, $4, $5)',
                    [monitorId, 'up', 200, 100, null]
                );
                const deleteResponse = await request(app)
                    .delete(`/monitors/${monitorId}`);

                    expect(deleteResponse.status).toBe(200);

                const getResponse = await request(app)
                    .get(`/monitors/${monitorId}`);

                    expect(getResponse.status).toBe(404);

                const pingLogs = await pool.query(
                    'SELECT * FROM ping_logs WHERE monitor_id = $1',
                    [monitorId]
                );
                expect(pingLogs.rows.length).toBe(0);

                
            });

            it('return 404 when monitor does not exist',async()=>{
                const response = await request(app)
                    .delete('/monitors/2000');

                    expect(response.status).toBe(404);
            });              
        });

        describe('GET /monitors/:id/history', () => {
            it('return no history and null uptime for a monitor with no pings ',async()=>{
                const created = await request(app)
                    .post('/monitors')
                    .send({
                        name: 'Test Monitor',
                        url: 'https://example.com',
                        interval_seconds: 60,
                    });

                    const monitorId = created.body.data.id;

                    const response = await request(app)
                        .get(`/monitors/${monitorId}/history`);

                        expect(response.status).toBe(200);
                        expect(response.body.history).toEqual([]);
                        expect(response.body.summary.uptime_percentage).toBeNull();
                        expect(response.body.summary.total_pings).toBe(0);

                
            });

            it('calculate uptime precentage correctly with mixed puing results',async()=>{
                const created = await request(app)
                    .post('/monitors')
                    .send({
                        name: 'Test Monitor',
                        url: 'https://example.com',
                        interval_seconds: 60,
                    });

                    const monitorId = created.body.data.id;

                    await pool.query(
                        `INSERT INTO ping_logs (monitor_id, status, status_code, latency_ms) VALUES
                        ($1, 'up', 200, 100),
                        ($1, 'up', 200, 110),
                        ($1, 'up', 200, 120),
                        ($1, 'down', NULL, NULL)`,
                        [monitorId]
                    );

                    const response = await request(app)
                        .get(`/monitors/${monitorId}/history`);

                        expect(response.status).toBe(200);
                        expect(response.body.history.length).toBe(4);
                        expect(response.body.summary.uptime_percentage).toMatch(/75/);
                        expect(response.body.summary.total_pings).toBe(4);
                        expect(response.body.summary.downtime_pings).toBe(1);
                        expect(response.body.summary.successful_pings).toBe(3);
                    

                
            });  

            it('respect the limit query parameter',async()=>{
                const created = await request(app)
                    .post('/monitors')
                    .send({
                        name: 'Test Monitor',
                        url: 'https://example.com',
                        interval_seconds: 60,
                    });

                    const monitorId = created.body.data.id;

                    for(let i = 0; i < 5; i++){
                        await pool.query(
                            `INSERT INTO ping_logs (monitor_id, status, status_code, latency_ms) VALUES
                            ($1, 'up', 200, 100)`,
                            [monitorId]
                        );
                    }

                    const response = await request(app)
                        .get(`/monitors/${monitorId}/history?limit=3`);

                        expect(response.body.history).toHaveLength(3);
            });                          
        });

        describe('DELETE /monitors/:id/history', () => {
            it('deletes all history for a monitor without deleting the monitor',async()=>{
                const created = await request(app)
                    .post('/monitors')
                    .send({
                        name: 'Test Monitor',
                        url: 'https://example.com',
                        interval_seconds: 60,
                    });

                    const monitorId = created.body.data.id;

                    for(let i = 0; i < 5; i++){
                        await pool.query(
                            `INSERT INTO ping_logs (monitor_id, status, status_code, latency_ms) VALUES
                            ($1, 'up', 200, 100)`,
                            [monitorId]
                        );
                    }

                    const response = await request(app)
                        .delete(`/monitors/${monitorId}/history`);

                        expect(response.status).toBe(200);
                        expect(response.body.message).toContain('cleared')

                    const monitorCheck = await request(app)
                        .get(`/monitors/${monitorId}`);

                        expect(monitorCheck.status).toBe(200);
                        
                });
            });

        describe('PATCH /monitors/:id/toggle', () => {
            it('pauses or resume a monitor',async()=>{
                const created = await request(app)
                    .post('/monitors')
                    .send({
                        name: 'Test Monitor',
                        url: 'https://example.com',
                        interval_seconds: 60,
                    });

                    const monitorId = created.body.data.id;

                    const response = await request(app)
                        .patch(`/monitors/${monitorId}/toggle`);

                    expect(response.body.data.is_active).toBe(false);

                    const response2 = await request(app)
                        .patch(`/monitors/${monitorId}/toggle`);
                    
                    expect(response2.body.data.is_active).toBe(true);


                });

            });

});
