import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import AddMonitor from "./pages/AddMonitor";
import MonitorDetail from "./pages/MonitorDetail";


export default function App() {
    return (
        <Router>

            <div className="app-shell">
                <Navbar />
                <main className="app-container">
                    <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/monitors/add" element={<AddMonitor />} />
                        <Route path="/monitors/:id" element={<MonitorDetail />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}
