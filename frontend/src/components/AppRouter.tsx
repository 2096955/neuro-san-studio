import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import IntegratedDashboard from '../pages/IntegratedDashboard';
import Guardrails from './guardrails/Guardrails';
import Redteaming from './redteaming/Redteaming';
import Controls from './raicontrols/Controls';
import RAI from '../pages/RAI';
import MultiAgentAcceleratorClean from '../pages/MultiAgentAcceleratorClean';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/multi-agent-accelerator" replace />} />
      <Route path="/integrated-dashboard" element={<IntegratedDashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/guardrails" element={<Guardrails />} />
      <Route path="/redteaming" element={<Redteaming />} />
      <Route path="/controls" element={<Controls />} />
      <Route path="/rai" element={<RAI />} />
      <Route path="/multi-agent-accelerator" element={<MultiAgentAcceleratorClean />} />
    </Routes>
  );
}
