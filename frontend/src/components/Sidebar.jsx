import useStore from '../store/useStore'

const NAV_ITEMS = [
  { id: 'overview',   icon: '◈', label: 'Overview'   },
  { id: 'graph',      icon: '⬡', label: '3D Graph'    },
  { id: 'algorithm',  icon: '⚡', label: 'Algorithms'  },
  { id: 'scenario',   icon: '⚠', label: 'Scenario'    },
]

const NODE_LEGEND = [
  { type: 'Port',                color: '#3b82f6' },
  { type: 'Terminal',            color: '#8b5cf6' },
  { type: 'Warehouse',           color: '#10b981' },
  { type: 'Depot',               color: '#f59e0b' },
  { type: 'Crane',               color: '#06b6d4' },
  { type: 'Yard Block',          color: '#f97316' },
  { type: 'Gate',                color: '#ec4899' },
  { type: 'Customs Point',       color: '#ef4444' },
  { type: 'Truck Hub',           color: '#14b8a6' },
  { type: 'Distribution Center', color: '#84cc16' },
]

export default function Sidebar() {
  const { activeView, setActiveView } = useStore()

  return (
    <aside className="sidebar">
      <p className="sidebar-section-label">Navigation</p>

      {NAV_ITEMS.map(item => (
        <div
          key={item.id}
          id={`sidebar-nav-${item.id}`}
          className={`sidebar-item ${activeView === item.id ? 'active' : ''}`}
          onClick={() => setActiveView(item.id)}
        >
          <span className="icon">{item.icon}</span>
          {item.label}
        </div>
      ))}

      <p className="sidebar-section-label" style={{ marginTop: 'auto' }}>Node Types</p>

      {NODE_LEGEND.map(({ type, color }) => (
        <div key={type} className="sidebar-item" style={{ padding: '6px 20px', cursor: 'default' }}>
          <span style={{
            width: 10, height: 10, borderRadius: '50%',
            background: color,
            boxShadow: `0 0 6px ${color}`,
            flexShrink: 0,
            display: 'inline-block',
          }} />
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{type}</span>
        </div>
      ))}
    </aside>
  )
}
