import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

export const getMonitors = () => 
    api.get('/monitors').then(res => res.data);

export const getMonitor = (id) => 
    api.get(`/monitors/${id}`).then(res => res.data);

export const createMonitor = (data) => 
    api.post('/monitors', data).then(res => res.data);

export const deleteMonitor = (id) => 
    api.delete(`/monitors/${id}`).then(res => res.data);

export const updateMonitor = (id, data) => 
    api.patch(`/monitors/${id}`, data).then(res => res.data);

export const toggleMonitor = (id) => 
    api.patch(`/monitors/${id}/toggle`).then(res => res.data);

export const getHistory = (id,limit=24) => 
    api.get(`/monitors/${id}/history?limit=${limit}`).then(res => res.data);

export const clearHistory = (id) => 
    api.delete(`/monitors/${id}/history`).then(res => res.data);
