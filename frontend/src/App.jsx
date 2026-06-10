import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import AddMonitor from "./pages/AddMonitor";
import MonitorDetail from "./pages/MonitorDetail";


export default function App() {
    return (
        <Router>

            <div className="min-h-screen bg-gray-950 text-gray-100">
                <Navbar />
                <div className="max-w-5xl mx-auto px-4 py-8">
                    <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/monitors/add" element={<AddMonitor />} />
                        <Route path="/monitors/:id" element={<MonitorDetail />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}