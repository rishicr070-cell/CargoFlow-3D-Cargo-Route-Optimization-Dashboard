// Color palette for each node type
export const NODE_TYPE_COLORS = {
  'Port':                '#3b82f6',  // blue
  'Terminal':            '#8b5cf6',  // purple
  'Warehouse':           '#10b981',  // green
  'Depot':               '#f59e0b',  // yellow
  'Crane':               '#06b6d4',  // cyan
  'Yard Block':          '#f97316',  // orange
  'Gate':                '#ec4899',  // pink
  'Customs Point':       '#ef4444',  // red
  'Truck Hub':           '#14b8a6',  // teal
  'Distribution Center': '#84cc16',  // lime
}

export const NODE_TYPE_ICONS = {
  'Port':                '⚓',
  'Terminal':            '🏗️',
  'Warehouse':           '🏭',
  'Depot':               '📦',
  'Crane':               '🏚️',
  'Yard Block':          '🔲',
  'Gate':                '🚧',
  'Customs Point':       '🛃',
  'Truck Hub':           '🚛',
  'Distribution Center': '🏬',
}

export const getNodeColor = (nodeType, isBlocked = false, isOnPath = false, isSource = false, isTarget = false) => {
  if (isBlocked) return '#ef4444'
  if (isSource) return '#10b981'
  if (isTarget) return '#f59e0b'
  if (isOnPath) return '#06b6d4'
  return NODE_TYPE_COLORS[nodeType] || '#7a9cc4'
}
