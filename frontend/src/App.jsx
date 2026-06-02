import { useEffect } from 'react'
import useStore from './store/useStore'
import TopBar from './components/TopBar'
import Sidebar from './components/Sidebar'
import Graph3D from './components/Graph3D'
import AlgorithmControls from './components/AlgorithmControls'
import NodeDetailPanel from './components/NodeDetailPanel'
import RouteResultPanel from './components/RouteResultPanel'
import MetricsCards from './components/MetricsCards'
import ScenarioPanel from './components/ScenarioPanel'

export default function App() {
  const { fetchGraph, fetchMetrics, activeView, rightTab, setRightTab } = useStore()

  useEffect(() => {
    fetchGraph()
    fetchMetrics()
  }, [])

  return (
    <div className="app-shell">
      {/* ── Top Bar ── */}
      <TopBar />

      {/* ── Sidebar ── */}
      <Sidebar />

      {/* ── Center: 3D Graph ── */}
      <main className="center-panel">
        <Graph3D />
      </main>

      {/* ── Right Panel ── */}
      <aside className="right-panel">
        {/* Tabs */}
        <div className="right-panel-tabs">
          <div
            id="right-tab-algorithm"
            className={`right-tab ${rightTab === 'algorithm' ? 'active' : ''}`}
            onClick={() => setRightTab('algorithm')}
          >
            Algorithm
          </div>
          <div
            id="right-tab-node"
            className={`right-tab ${rightTab === 'node' ? 'active' : ''}`}
            onClick={() => setRightTab('node')}
          >
            Node
          </div>
          <div
            id="right-tab-scenario"
            className={`right-tab ${rightTab === 'scenario' ? 'active' : ''}`}
            onClick={() => setRightTab('scenario')}
          >
            Scenario
          </div>
        </div>

        {/* Body */}
        <div className="right-panel-body">
          {rightTab === 'algorithm' && (
            <>
              <AlgorithmControls />
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <RouteResultPanel />
              </div>
            </>
          )}
          {rightTab === 'node' && <NodeDetailPanel />}
          {rightTab === 'scenario' && <ScenarioPanel />}
        </div>
      </aside>

      {/* ── Bottom: Metrics ── */}
      <div className="bottom-panel">
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          flexShrink: 0,
        }}>
          Metrics
        </span>
        <div style={{ width: 1, height: 40, background: 'var(--border)', flexShrink: 0 }} />
        <MetricsCards />
      </div>
    </div>
  )
}
