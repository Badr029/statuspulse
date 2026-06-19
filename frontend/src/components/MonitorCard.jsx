import {Link} from "react-router-dom";

import StatusBadge from "./StatusBadge";

export default function MonitorCard({ monitor, onToggle, onDelete}) {

    return(
            <div data-testid="monitor-card" data-monitor-id={monitor.id} className="glass-card rounded-xl p-5 transition-colors">


                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h3 data-testid="monitor-card-name" className="font-semibold text-white">{monitor.name}</h3>
                        <p data-testid="monitor-card-url" className="muted mt-1 max-w-xs truncate text-sm">{monitor.url}</p>
                    </div>
                <StatusBadge status={monitor.last_status || 'unknown'}
                isActive={monitor.is_active}
                />
                </div>

                {/* Stats */} 
                <div className="muted mb-4 flex gap-4 text-sm">
                    <span data-testid="monitor-card-interval">Every {monitor.interval_seconds}s</span>
                    {monitor.is_active && <span data-testid="monitor-card-active">Active</span>}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Link to={`/monitors/${monitor.id}`} 
                    data-testid="monitor-card-view"
                    className="btn-secondary flex-1 rounded-lg px-3 py-1.5 text-center text-sm font-semibold transition-colors">
                    View Details
                    </Link>
                    <button onClick={() => onToggle(monitor.id)} 
                    data-testid="monitor-card-toggle"
                    className="btn-secondary flex-1 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors">
                        {monitor.is_active ? 'Pause' : 'Resume'}
                    </button>
                    <button onClick={() => onDelete(monitor.id)} 
                    data-testid="monitor-card-delete"
                    className="btn-danger rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors">
                        Delete
                    </button>
                </div>


            </div>

    )


}
