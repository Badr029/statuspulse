import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';  
import { getHistory, toggleMonitor, deleteMonitor, clearHistory, updateMonitor } from "../api/monitors";
import StatusBadge from "../components/StatusBadge";

export default function MonitorDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditFrom] = useState({name: '', url: '', interval_seconds: 60});

    async function fetchData() {
        try {
            const result = await getHistory(id);
            setData(result);
            setEditFrom({
                name: result.monitor.name,
                url: result.monitor.url,
                interval_seconds: result.monitor.interval_seconds
            });

            } catch (err) {
            setError('Failed to load monitor details.');
            } finally {
            setLoading(false);
            }
        }

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
        }, [id]);
    
    async function handleToggle(){
        await toggleMonitor(id);
        fetchData();
    }

    async function handleDelete(){
        if (!window.confirm('Delete this monitor and all its history?')) return;
        await deleteMonitor(id);
        navigate('/dashboard');
    }

    async function handleClearHistory(){
        if (!window.confirm('Delete all history for this monitor?')) return;
        await clearHistory(id);
        fetchData();
    }

    function handleEditChange(e){
        setEditFrom(prev=>({
            ...prev,
            [e.target.name]: e.target.value
        }));
    }

    async function handleUpdate(e){
        e.preventDefault();
        await updateMonitor(id, {
            ...editForm,
            interval_seconds: parseInt(editForm.interval_seconds)
        });

        setEditing(false);
        fetchData();
    }


    if (loading) return <div className="muted py-20 text-center">Loading...</div>;
    if (error) return <div className="py-20 text-center text-red-200">{error}</div>;

    const{monitor, history, summary} = data;

    const chartData = [...history].reverse().map((ping, i)=>({
        index: i+1,
        latency: ping.latency_ms,
        status: ping.status,
        time: new Date(ping.checked_at).toLocaleTimeString(),

        }));

        const lastPing = history[0];

    return (
        <div data-testid="monitor-detail-page" data-monitor-id={monitor.id} className="space-y-6">
            {/* Header */}
            <div className="mx-auto flex max-w-6xl items-center justify-between">
                <span className="eyebrow">Monitor detail</span>
                <button
                    data-testid="Back-button"
                    onClick={() => navigate('/dashboard')}
                    className="btn-secondary rounded-lg px-4 py-2 text-sm font-bold transition-colors"
                    >
                    Back
                </button>
            </div>
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                    <div className="mt-5 flex items-center gap-4">
                        <h1 data-testid="monitor-detail-name" className="section-title text-white">
                            {monitor.name}
                        </h1>
                        <button
                            data-testid="monitor-detail-edit"
                            onClick={() => setEditing(true)}
                            className="btn-primary rounded-lg px-4 py-2 text-sm font-bold transition-colors">
                            Edit
                        </button>
                    </div>
                    <p data-testid="monitor-detail-url" className="muted mt-2">
                        {monitor.url}
                    </p>
                </div>
                {lastPing && <StatusBadge status={lastPing.status} />}
            </div>
        {editing && (
            <form data-testid="monitor-edit-form" onSubmit={handleUpdate} className="glass-panel rounded-2xl p-6">
                <div className="flex flex-col gap-4">
                    <input
                        data-testid="monitor-edit-name"
                        name="name"
                        value={editForm.name}
                        onChange={handleEditChange}
                        className="field w-full rounded-lg px-3 py-2"
                    />

                    <input
                        data-testid="monitor-edit-url"
                        name="url"
                        value={editForm.url}
                        onChange={handleEditChange}
                        className="field w-full rounded-lg px-3 py-2"
                    />

                    <select
                        data-testid="monitor-edit-interval"
                        name="interval_seconds"
                        value={editForm.interval_seconds}
                        onChange={handleEditChange}
                        className="field w-full rounded-lg px-3 py-2"
                    >
                        <option value={30}>Every 30 seconds</option>
                        <option value={60}>Every minute</option>
                        <option value={300}>Every 5 minutes</option>
                        <option value={600}>Every 10 minutes</option>
                        <option value={900}>Every 15 minutes</option>
                        <option value={1800}>Every 30 minutes</option>
                        <option value={3600}>Every hour</option>
                    </select>

                    <div className="flex gap-3">
                        <button data-testid="monitor-edit-save" className="btn-primary rounded-lg px-4 py-2 font-bold transition-colors">
                            Save
                        </button>

                        <button
                            data-testid="monitor-edit-cancel"
                            type="button"
                            onClick={() => setEditing(false)}
                            className="btn-secondary rounded-lg px-4 py-2 font-bold transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        )}

            {/* Summary Card */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                    {label:'Uptime', value: summary.uptime_percentage ? `${summary.uptime_percentage}%` : 'N/A'},
                    {label:'Total Pings', value: summary.total_pings},
                    {label:'Successful Pings', value: summary.successful_pings},
                    {label:'Failed Pings', value: summary.downtime_pings},
                ].map(({label, value})=>(
                    <div key={label} data-testid="summary-card" data-summary-label={label} className="glass-card rounded-xl p-4">
                        <p className="muted text-sm">{label}</p>
                        <p className="mt-1 text-xl font-bold text-white">{value}</p>
                    </div>
                ))}
            </div>

            {/* Latency chart */}
            <div className="glass-panel rounded-2xl p-6">
                <h2 className="mb-4 text-xl font-bold text-white">Latency History</h2>
                {chartData.length === 0 ? (
                    <p className="muted py-10 text-center">No data yet.</p>
                ):(
                    <ResponsiveContainer width="100%" height= {250}>
                        <LineChart data={chartData} >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(213,236,226,0.16)" />
                            <XAxis dataKey="time" tick={{fill: '#a9bbb4', fontSize: 11}} />
                            <YAxis tick={{fill: '#a9bbb4', fontSize: 11}} unit="ms" />
                            <Tooltip
                                contentStyle={{backgroundColor: '#0b1f1c', border:'1px solid rgba(213,236,226,0.24)', borderRadius: '10px'}}
                                labelStyle={{color: '#a9bbb4'}}
                                formatter={(value) => [`${value} ms`,'Latency']}
                            />
                            <Line
                                type="monotone"
                                dataKey="latency"
                                stroke="#50e89a"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">

                <button
                    data-testid="monitor-detail-toggle"
                    onClick={handleToggle}
                    className="btn-secondary rounded-lg px-4 py-2 text-sm font-bold transition-colors"
                    >
                    {monitor.is_active ? 'Pause monitor' : 'Resume monitor'}
                </button>
                <button
                    data-testid="monitor-detail-clear-history"
                    onClick={handleClearHistory}
                    className="btn-secondary rounded-lg px-4 py-2 text-sm font-bold transition-colors"
                    >
                    Clear history
                </button>
                <button
                    data-testid="monitor-detail-delete"
                    onClick={handleDelete}
                    className="btn-danger rounded-lg px-4 py-2 text-sm font-bold transition-colors"
                    >
                    Delete monitor
                </button>
            </div>

        </div>
    );
}
