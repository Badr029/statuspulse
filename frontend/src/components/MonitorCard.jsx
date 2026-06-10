import {Link} from "react-router-dom";

import StatusBadge from "./StatusBadge";

export default function MonitorCard({ monitor, onToggle, onDelete}) {

    return(
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">


                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h3 className="font-semibold text-white">{monitor.name}</h3>
                        <p className="text-gray-400 text-sm mt-1 truncate max-w-xs">{monitor.url}</p>
                    </div>
                <StatusBadge status={monitor.last_status || 'unknown'}
                isActive={monitor.is_active}
                />
                </div>

                {/* Stats */} 
                <div className="flex gap-4 text-sm text-gray-400 mb-4">
                    <span>Every {monitor.interval_seconds}s</span>
                    {monitor.is_active && <span>Active</span>}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Link to={`/monitors/${monitor.id}`} 
                    className="flex-1 text-center bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors">
                    View Details
                    </Link>
                    <button onClick={() => onToggle(monitor.id)} 
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors">
                        {monitor.is_active ? 'Pause' : 'Resume'}
                    </button>
                    <button onClick={() => onDelete(monitor.id)} 
                    className="bg-red-900 hover:bg-red-800 text-red-300 px-3 py-1.5 rounded-lg text-sm transition-colors">
                        Delete
                    </button>
                </div>


            </div>

    )


}