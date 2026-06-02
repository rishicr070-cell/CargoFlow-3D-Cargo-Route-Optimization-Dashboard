import useStore from '../store/useStore'

const CARD_CONFIGS = [
  {
    key: 'total_nodes',
    label: 'Total Nodes',
    unit: '',
    icon: '⬡',
    color: '#3b82f6',
    desc: 'Logistics entities',
  },
  {
    key: 'total_edges',
    label: 'Total Edges',
    unit: '',
    icon: '⤖',
    color: '#8b5cf6',
    desc: 'Connections',
  },
  {
    key: 'avg_edge_cost',
    label: 'Avg Edge Cost',
    unit: '$',
    icon: '$',
    color: '#10b981',
    desc: 'Per route segment',
  },
  {
    key: 'network_density',
    label: 'Network Density',
    unit: '',
    icon: '◎',
    color: '#f59e0b',
    desc: 'Graph connectivity ratio',
    format: (v) => (v * 100).toFixed(1) + '%',
  },
  {
    key: 'avg_congestion',
    label: 'Avg Congestion',
    unit: 'x',
    icon: '⚡',
    color: '#ef4444',
    desc: 'Congestion multiplier',
  },
]

export default function MetricsCards() {
  const { metrics } = useStore()

  if (!metrics) {
    return (
      <>
        {CARD_CONFIGS.map(c => (
          <div key={c.key} className="metric-card">
            <div className="loading-shimmer" style={{ height: 14, width: 80, marginBottom: 6 }} />
            <div className="loading-shimmer" style={{ height: 24, width: 50 }} />
          </div>
        ))}
      </>
    )
  }

  return (
    <>
      {CARD_CONFIGS.map(cfg => {
        const raw = metrics[cfg.key]
        const display = cfg.format ? cfg.format(raw) : `${cfg.unit}${raw}`

        return (
          <div key={cfg.key} className="metric-card" id={`metric-${cfg.key}`}>
            <div className="metric-card-label">{cfg.label}</div>
            <div className="metric-card-value" style={{ color: cfg.color }}>
              {display}
            </div>
            <div className="metric-card-sub">{cfg.desc}</div>
          </div>
        )
      })}
    </>
  )
}
