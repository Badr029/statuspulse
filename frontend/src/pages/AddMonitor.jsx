import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createMonitor } from "../api/monitors";

export default function AddMonitor() {
    const navigate = useNavigate();
    const [form, setForm] = useState({name: '', url: '', interval_seconds: 60});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    function handleChange(e){
        setForm(prev=>({...prev, [e.target.name]: e.target.value}));
    }

    async function handleSubmit(e){
        e.preventDefault();
        setError(null);
        setLoading(true);
        
        try {
            await createMonitor({
                ...form,
                interval_seconds: parseInt(form.interval_seconds)
            });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Failed to create monitor.');
        } finally {
            setLoading(false);
            }
    }

    return(
        <div data-testid="add-monitor-page" className="max-w-lg mx-auto">
            <h1 data-testid="add-monitor-title" className="text-2xl font-bold text-white mb-6">Add New Monitor</h1>
        
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex flex-col gap-5">

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Name
                        </label>
                        <input
                        data-testid="add-monitor-name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="API Name"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        />
                    </div>    
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            URL
                        </label>
                        <input
                        data-testid="add-monitor-url"
                        name="url"
                        value={form.url}
                        onChange={handleChange}
                        placeholder="https://api.example.com"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        />
                    </div>    
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Check Interval
                        </label>
                        <select
                        data-testid="add-monitor-interval"
                        name="interval_seconds"
                        value={form.interval_seconds}
                        onChange={handleChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                        >
                        <option value={30}>Every 30 seconds</option>
                        <option value={60}>Every minute</option>
                        <option value={300}>Every 5 minutes</option>
                        <option value={600}>Every 10 minutes</option>
                        </select>
                    </div>  

                    {error && (
                        <div data-testid="add-monitor-error" className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
                        {error}  
                        </div> 
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                        data-testid="add-monitor-submit"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                            {loading ? 'Creating...' : 'Create Monitor'}
                            
                        </button>
                        <button
                        data-testid="add-monitor-cancel"
                        onClick={() => navigate('/dashboard')}
                        className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                            Cancel
                        </button>
                    </div>

                </div>
            </div> 


        </div> 
    )
}
