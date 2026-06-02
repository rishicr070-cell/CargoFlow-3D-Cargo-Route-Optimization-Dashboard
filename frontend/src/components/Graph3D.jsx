import { useRef, useEffect, useCallback, useMemo } from 'react'
import ForceGraph3D from 'react-force-graph-3d'
import * as THREE from 'three'
import useStore from '../store/useStore'
import { getNodeColor } from '../utils/nodeColors'

export default function Graph3D() {
  const fgRef = useRef()
  const {
    nodes, edges, dijkstraResult, scenario,
    sourceNode, targetNode,
    setSelectedNode, setHoveredNode, hoveredNode,
  } = useStore()

  const blockedSet  = useMemo(() => new Set(scenario?.blocked_nodes || []), [scenario])
  const pathNodeSet = useMemo(() => new Set(dijkstraResult?.path || []), [dijkstraResult])
  const pathEdgeSet = useMemo(() => new Set(dijkstraResult?.edges || []), [dijkstraResult])

  // Build graph data in react-force-graph format
  const graphData = useMemo(() => ({
    nodes: nodes.map(n => ({
      id:   n.node_id,
      name: n.node_name,
      type: n.node_type,
      data: n,
    })),
    links: edges.map(e => ({
      source:   e.source,
      target:   e.target,
      id:       e.edge_id,
      distance: e.distance,
      cost:     e.cost,
      travel_time: e.travel_time,
      congestion:  e.congestion_weight,
    })),
  }), [nodes, edges])

  // Camera orbit on first load
  useEffect(() => {
    if (fgRef.current && nodes.length) {
      fgRef.current.cameraPosition({ x: 0, y: 0, z: 600 }, { x: 0, y: 0, z: 0 }, 1200)
    }
  }, [nodes.length])

  // Node color logic
  const getColor = useCallback((node) => {
    const isBlocked = blockedSet.has(node.id)
    const isSource  = node.id === sourceNode
    const isTarget  = node.id === targetNode
    const isOnPath  = pathNodeSet.has(node.id)
    return getNodeColor(node.type, isBlocked, isOnPath, isSource, isTarget)
  }, [blockedSet, pathNodeSet, sourceNode, targetNode])

  // Custom 3D node sphere with glow
  const nodeThreeObject = useCallback((node) => {
    const color = getColor(node)
    const isBlocked = blockedSet.has(node.id)
    const isOnPath  = pathNodeSet.has(node.id)
    const isSource  = node.id === sourceNode
    const isTarget  = node.id === targetNode
    const isHovered = hoveredNode?.id === node.id

    const size = isSource || isTarget ? 9 : isOnPath ? 7 : isHovered ? 8 : 5

    const group = new THREE.Group()

    // Core sphere
    const geo = new THREE.SphereGeometry(size, 16, 16)
    const mat = new THREE.MeshPhongMaterial({
      color,
      emissive: color,
      emissiveIntensity: isOnPath || isSource || isTarget ? 0.6 : 0.25,
      transparent: isBlocked,
      opacity: isBlocked ? 0.5 : 1,
    })
    group.add(new THREE.Mesh(geo, mat))

    // Outer glow ring for path nodes
    if (isOnPath || isSource || isTarget) {
      const ringGeo = new THREE.SphereGeometry(size * 1.7, 16, 16)
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.12,
        wireframe: false,
      })
      group.add(new THREE.Mesh(ringGeo, ringMat))
    }

    return group
  }, [getColor, blockedSet, pathNodeSet, sourceNode, targetNode, hoveredNode])

  // Link color and width
  const getLinkColor = useCallback((link) => {
    const edgeId = link.id || `${link.source?.id || link.source}-${link.target?.id || link.target}`
    if (pathEdgeSet.has(edgeId)) return '#06b6d4'
    if (link.congestion > 1.4) return '#ef444466'
    return '#1e3a5f'
  }, [pathEdgeSet])

  const getLinkWidth = useCallback((link) => {
    const edgeId = link.id || `${link.source?.id || link.source}-${link.target?.id || link.target}`
    return pathEdgeSet.has(edgeId) ? 3 : 1
  }, [pathEdgeSet])

  const getLinkOpacity = useCallback((link) => {
    const edgeId = link.id || `${link.source?.id || link.source}-${link.target?.id || link.target}`
    return pathEdgeSet.has(edgeId) ? 1.0 : 0.35
  }, [pathEdgeSet])

  const onNodeClick = useCallback((node) => {
    setSelectedNode(node?.data || null)
  }, [setSelectedNode])

  const onNodeHover = useCallback((node) => {
    setHoveredNode(node || null)
    document.body.style.cursor = node ? 'pointer' : 'default'
  }, [setHoveredNode])

  if (!nodes.length) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⬡</div>
          <div>Loading graph…</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        backgroundColor="#050b18"
        nodeThreeObject={nodeThreeObject}
        nodeThreeObjectExtend={false}
        nodeLabel={(node) => `${node.name} (${node.type})`}
        linkColor={getLinkColor}
        linkWidth={getLinkWidth}
        linkOpacity={getLinkOpacity}
        linkDirectionalParticles={(link) => {
          const edgeId = link.id || `${link.source?.id || link.source}-${link.target?.id || link.target}`
          return pathEdgeSet.has(edgeId) ? 4 : 0
        }}
        linkDirectionalParticleColor={() => '#06b6d4'}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleSpeed={0.006}
        onNodeClick={onNodeClick}
        onNodeHover={onNodeHover}
        enableNodeDrag={true}
        controlType="orbit"
        showNavInfo={false}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        warmupTicks={100}
        cooldownTicks={200}
      />

      {/* Overlay hint */}
      <div className="graph-overlay">
        <div className="graph-hint">
          🖱 Drag to orbit · Scroll to zoom · Click node to inspect
        </div>
      </div>

      {/* Hovered node tooltip */}
      {hoveredNode && (
        <div style={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '8px 16px',
          fontSize: 12,
          color: 'var(--text-primary)',
          pointerEvents: 'none',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: getColor(hoveredNode),
            boxShadow: `0 0 6px ${getColor(hoveredNode)}`,
            display: 'inline-block',
          }}/>
          <strong>{hoveredNode.name}</strong>
          <span style={{ color: 'var(--text-muted)' }}>·</span>
          <span style={{ color: 'var(--text-muted)' }}>{hoveredNode.type}</span>
        </div>
      )}
    </div>
  )
}
