import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';  
import { getHistory, toggleMonitor, deleteMonitor, clearHistory } from "../api/monitors";
import StatusBadge from "../components/StatusBadge";

export default function MonitorDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    async function fetchData() {
        try {
            const result = await getHistory(id);
            setData(result);
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

    if (loading) return <div className="text-center text-gray-400 py-20">Loading...</div>;
    if (error) return <div className="text-center text-gray-400 py-20">{error}</div>;

    const{monitor, history, summary} = data;

    const chartData = [...history].reverse().map((ping, i)=>({
        index: i+1,
        latency: ping.latency_ms,
        status: ping.status,
        time: new Date(ping.checked_at).toLocaleTimeString(),

        }));

        const lastPing = history[0];

    return (
        <div>
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        {monitor.name}
                    </h1>
                    <p className="text-gray-400 mt-1">
                        {monitor.url}
                    </p>
                </div>
                {lastPing && <StatusBadge status={lastPing.status} />}
            </div>

            {/* Summary Card */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    {label:'Uptime', value: summary.uptime_percentage ? `${summary.uptime_percentage}%` : 'N/A'},
                    {label:'Total Pings', value: summary.total_pings},
                    {label:'Successful Pings', value: summary.successful_pings},
                    {label:'Failed Pings', value: summary.downtime_pings},
                ].map(({label, value})=>(
                    <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                        <p className="text-gray-400 text-sm">{label}</p>
                        <p className="text-white text-xl font-bold mt-1">{value}</p>
                    </div>
                ))}
            </div>

            {/* Latency chart */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <h2 className="text-white font-semibold mb-4">Latency History</h2>
                {chartData.length === 0 ? (
                    <p className="text-gray-400 text-center py-10">No data yet.</p>
                ):(
                    <ResponsiveContainer width="100%" height= {250}>
                        <LineChart data={chartData} >
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="time" tick={{fill: '#9ca3af', fontSize: 11}} />
                            <YAxis tick={{fill: '#9ca3af', fontSize: 11}} unit="ms" />
                            <Tooltip
                                contentStyle={{backgroundColor: '#111827', border:'1px solid #374151'}}
                                labelStyle={{color: '#9ca3af'}}
                                formatter={(value) => [`${value} ms`,'Latency']}
                            />
                            <Line
                                type="monotone"
                                dataKey="latency"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    onClick={handleToggle}
                    className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                    {monitor.is_active ? 'Pause monitor' : 'Resume monitor'}
                </button>
                <button
                    onClick={handleClearHistory}
                    className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                    Clear history
                </button>
                <button
                    onClick={handleDelete}
                    className="bg-red-900 hover:bg-red-800 text-red-300 px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                    Delete monitor
                </button>
            </div>

        </div>
    );
}