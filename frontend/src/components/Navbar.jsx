import {Link} from "react-router-dom";

export default function Navbar() {
    return (
        <nav data-testid="navbar" className="bg-gray-900 border-b border-gray-800 px-6 py-4">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
                <Link to="/dashboard" data-testid="navbar-brand" className="text-xl font-bold text-white">
                StatusPulse
                </Link>
                <Link to = "/monitors/add"
                data-testid="navbar-add-monitor"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors" >
                    + Add Monitor
                </Link>
            </div>
        </nav>
    );
}
