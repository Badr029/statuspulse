import {Link} from "react-router-dom";

export default function Navbar() {
    return (
        <nav data-testid="navbar" className="border-b border-white/10 bg-[#071716]/70 px-6 py-4 backdrop-blur-xl">
            <div className="mx-auto flex max-w-6xl items-center justify-between">
                <Link to="/dashboard" data-testid="navbar-brand" className="flex items-center gap-3 text-xl font-bold text-white">
                <span className="h-3 w-3 rounded-full bg-[#50e89a] shadow-[0_0_18px_rgba(80,232,154,0.9)]" />
                StatusPulse
                </Link>
                <Link to = "/monitors/add"
                data-testid="navbar-add-monitor"
                className="btn-primary rounded-lg px-4 py-2 text-sm font-bold transition-colors" >
                    + Add Monitor
                </Link>
            </div>
        </nav>
    );
}
