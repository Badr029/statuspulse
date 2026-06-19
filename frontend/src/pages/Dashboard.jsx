import { useState, useEffect } from 'react';
import {getMonitors, toggleMonitor, deleteMonitor} from '../api/monitors';
import MonitorCard from '../components/MonitorCard';
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const [monitors, setMonitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    async function fetchMonitors() {
        try {
            const data = await getMonitors();
            setMonitors(data.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch monitors.');  
        }finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchMonitors();
        const interval = setInterval(fetchMonitors, 30000);
        return () => clearInterval(interval);
        }, []);

    async function handleToggle(id) {
        await toggleMonitor(id);
        await fetchMonitors();
    }

    async function handleDelete(id){
        if (!window.confirm('Delete this monitor and all its history?')) return;
        await deleteMonitor(id);
        await fetchMonitors();
    }


    if (loading) return (
        <div className="text-center text-gray-400 py-20">
            Loading Monitors...
        </div>
    );
    
    if (error) return(
        <div className='text-center text-gray-400 py-20'>
            {error}
        </div>
    );

    return(
        <div data-testid="dashboard-page" className="space-y-8">
        <div className='flex flex-col gap-5 md:flex-row md:items-end md:justify-between'>
            <div>
                <span className="eyebrow">Live monitoring workspace</span>
                <h1 data-testid="dashboard-title" className="page-title mt-5 text-white">Dashboard</h1>
                <p className="muted mt-4 max-w-2xl text-lg">Track uptime, latency, and failures from one focused command center.</p>
            </div>
            <span data-testid="monitor-count" className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-[#c4d5ce]">{monitors.length} monitors</span>
        </div>

        {monitors.length === 0 ? (
            <div data-testid="empty-monitors" className="glass-panel rounded-2xl px-6 py-16 text-center">
            <p className="muted">No monitors yet.</p>
            <Link to="/monitors/add" data-testid="empty-add-monitor" className="mt-5 inline-flex btn-primary rounded-lg px-5 py-2.5 font-bold transition-colors">Add one</Link>
            </div>
        ) : (
            <div data-testid="monitor-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {monitors.map(monitor => (
                <MonitorCard
                key={monitor.id}
                monitor={monitor}
                onToggle={handleToggle}
                onDelete={handleDelete}
                />
            ))}
            </div>
        )}

        <p data-testid="auto-refresh-note" className="muted text-center text-xs">Auto-refreshes every 30 seconds</p>
        </div>
    );
}
