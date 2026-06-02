import useStore from '../store/useStore'

export default function TopBar() {
  const { nodes, edges, metrics, scenario } = useStore()

  const blockedCount = scenario?.blocked_nodes?.length || 0
  const hasScenario = blockedCount > 0

  return (
    <header className="topbar">
      {/* Logo */}
      <div className="topbar-logo">
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <circle cx="13" cy="13" r="12" stroke="#3b82f6" strokeWidth="1.5" fill="none"/>
          <path d="M7 13 L13 7 L19 13 L13 19 Z" fill="#3b82f6" opacity="0.3"/>
          <path d="M7 13 L13 7 L19 13 L13 19 Z" stroke="#06b6d4" strokeWidth="1.5" fill="none"/>
          <circle cx="13" cy="13" r="3" fill="#06b6d4"/>
          <line x1="7" y1="13" x2="4" y2="13" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="19" y1="13" x2="22" y2="13" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="13" y1="7" x2="13" y2="4" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="13" y1="19" x2="13" y2="22" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        CargoFlow
      </div>

      <div className="topbar-divider" />

      {/* Dataset status */}
      <div className="topbar-badge badge-active">
        Dataset Loaded
      </div>

      {/* Node/edge count */}
      <span className="topbar-meta">{nodes.length} nodes · {edges.length} edges</span>

      <div className="topbar-divider" />

      {/* Algorithm indicator */}
      <div className="topbar-badge badge-algo">
        Dijkstra Active
      </div>

      {/* Scenario alert */}
      {hasScenario && (
        <>
          <div className="topbar-divider" />
          <div className="topbar-badge" style={{ background: '#f9731618', border: '1px solid #f9731644', color: '#f97316' }}>
            ⚠ Scenario: {blockedCount} blocked
          </div>
        </>
      )}

      <div className="topbar-spacer" />

      <span className="topbar-meta">CargoFlow DAA v1.0</span>
    </header>
  )
}
