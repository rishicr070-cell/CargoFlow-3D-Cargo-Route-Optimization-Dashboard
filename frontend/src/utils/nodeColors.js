// Color palette for each node type (real-world maritime classification)
export const NODE_TYPE_COLORS = {
  'Major Port':         '#3b82f6',   // blue
  'Transshipment Hub':  '#a855f7',   // violet
  'Riverine Port':      '#10b981',   // emerald green
  'Chokepoint':         '#ef4444',   // red (strategic/high-risk)

  // Legacy types kept for backward compat
  'Port':               '#3b82f6',
  'Terminal':           '#8b5cf6',
  'Warehouse':          '#10b981',
  'Depot':              '#f59e0b',
  'Crane':              '#06b6d4',
  'Yard Block':         '#f97316',
  'Gate':               '#ec4899',
  'Customs Point':      '#ef4444',
  'Truck Hub':          '#14b8a6',
  'Distribution Center':'#84cc16',
}

export const NODE_TYPE_ICONS = {
  'Major Port':         '⚓',
  'Transshipment Hub':  '🔀',
  'Riverine Port':      '🚢',
  'Chokepoint':         '⚠️',
  'Port':               '⚓',
  'Terminal':           '🏗️',
  'Warehouse':          '🏭',
  'Depot':              '📦',
  'Crane':              '🏗',
  'Yard Block':         '🔲',
  'Gate':               '🚧',
  'Customs Point':      '🛃',
  'Truck Hub':          '🚛',
  'Distribution Center':'🏬',
}

export const getNodeColor = (nodeType, isBlocked = false, isOnPath = false, isSource = false, isTarget = false) => {
  if (isBlocked) return '#ef4444'
  if (isSource)  return '#10b981'
  if (isTarget)  return '#f59e0b'
  if (isOnPath)  return '#06b6d4'
  return NODE_TYPE_COLORS[nodeType] || '#7a9cc4'
}
