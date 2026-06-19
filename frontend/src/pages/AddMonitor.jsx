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
        <div data-testid="add-monitor-page" className="mx-auto max-w-2xl">
            <div className="mx-auto flex max-w-6xl items-center justify-between">
                <span className="eyebrow">Create a new check</span>
                <button
                    data-testid="Back-button"
                    onClick={() => navigate('/dashboard')}
                    className="btn-secondary rounded-lg px-4 py-2 text-sm font-bold transition-colors"
                    >
                    Back
                </button>
            </div>
            <h1 data-testid="add-monitor-title" className="section-title mt-5 mb-6 text-white">Add New Monitor</h1>
        
            <div className="glass-panel rounded-2xl p-6">
                <div className="flex flex-col gap-5">

                    <div>
                        <label className="mb-1 block text-sm font-semibold text-[#c4d5ce]">
                            Name
                        </label>
                        <input
                        data-testid="add-monitor-name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="API Name"
                        className="field w-full rounded-lg px-3 py-2"
                        />
                    </div>    
                    <div>
                        <label className="mb-1 block text-sm font-semibold text-[#c4d5ce]">
                            URL
                        </label>
                        <input
                        data-testid="add-monitor-url"
                        name="url"
                        value={form.url}
                        onChange={handleChange}
                        placeholder="https://api.example.com"
                        className="field w-full rounded-lg px-3 py-2"
                        />
                    </div>    
                    <div>
                        <label className="mb-1 block text-sm font-semibold text-[#c4d5ce]">
                            Check Interval
                        </label>
                        <select
                        data-testid="add-monitor-interval"
                        name="interval_seconds"
                        value={form.interval_seconds}
                        onChange={handleChange}
                        className="field w-full rounded-lg px-3 py-2"
                        >
                        <option value={30}>Every 30 seconds</option>
                        <option value={60}>Every minute</option>
                        <option value={300}>Every 5 minutes</option>
                        <option value={600}>Every 10 minutes</option>
                        </select>
                    </div>  

                    {error && (
                        <div data-testid="add-monitor-error" className="rounded-lg border border-red-400/35 bg-red-500/12 px-4 py-3 text-sm text-red-200">
                        {error}  
                        </div> 
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                        data-testid="add-monitor-submit"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="btn-primary flex-1 rounded-lg px-4 py-2 font-bold transition-colors disabled:opacity-50">
                            {loading ? 'Creating...' : 'Create Monitor'}
                            
                        </button>
                        <button
                        data-testid="add-monitor-cancel"
                        onClick={() => navigate('/dashboard')}
                        className="btn-secondary flex-1 rounded-lg px-4 py-2 font-bold transition-colors">
                            Cancel
                        </button>
                    </div>

                </div>
            </div> 


        </div> 
    )
}
