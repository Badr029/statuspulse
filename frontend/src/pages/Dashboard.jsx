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
        <div>
        <div className='flex items-center justify-between mb-6'>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <span className="text-gray-400 text-sm">{monitors.length} monitors</span>
        </div>

        {monitors.length === 0 ? (
            <div className="text-center text-gray-400 py-20">
            No monitors yet. {' '}
            <Link to="/monitors/add" className="text-blue-400 hover:underline">Add one</Link>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <p className="text-gray-600 text-xs text-center mt-8 margin-top=4 ">Auto-refreshes every 30 seconds</p>
        </div>
    );
}
