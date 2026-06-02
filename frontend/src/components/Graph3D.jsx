import { useRef, useEffect, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import useStore from '../store/useStore'
import { getNodeColor } from '../utils/nodeColors'

// ─────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────
const GLOBE_R = 150

/**
 * Convert geographic coordinates to a 3D point on the sphere surface.
 * Three.js uses Y-up coordinate system.
 */
const latLngToVec3 = (lat, lng, r = GLOBE_R) => {
  const phi   = (90 - lat)  * (Math.PI / 180)   // polar angle from north pole
  const theta = (lng + 180) * (Math.PI / 180)   // azimuthal angle from −180
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta),
  )
}

/**
 * Build a smooth arc curve between two points on the globe.
 * The midpoint is pushed outward so the arc rises above the surface.
 */
const buildArcCurve = (posA, posB) => {
  const mid  = posA.clone().add(posB).multiplyScalar(0.5)
  const dist = posA.distanceTo(posB)
  // Longer routes get a higher arc; minimum 10% above surface
  const arcH = GLOBE_R * (1.08 + dist / (GLOBE_R * 3.5))
  mid.normalize().multiplyScalar(arcH)
  return new THREE.QuadraticBezierCurve3(posA, mid, posB)
}

// ─────────────────────────────────────────────────────────────
//  Main Component
// ─────────────────────────────────────────────────────────────
export default function Graph3D() {
  const mountRef = useRef(null)

  // Three.js instance refs (not state — no re-renders on change)
  const threeRef     = useRef({ scene: null, camera: null, renderer: null, controls: null, clock: null, frameId: null })
  const nodeGroupsRef = useRef([])   // [{ group, nodeId }]
  const arcMeshesRef  = useRef([])   // [{ mesh, edgeId, curve }]
  const particlesRef  = useRef([])   // [{ mesh, curve, offset, speed }]

  const {
    nodes, edges, dijkstraResult, scenario,
    sourceNode, targetNode,
    setSelectedNode, setHoveredNode, hoveredNode,
  } = useStore()

  // ── 1. SCENE INITIALIZATION (once on mount) ──────────────────
  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const w = mount.clientWidth  || 800
    const h = mount.clientHeight || 600

    // ── Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x050b18)
    mount.appendChild(renderer.domElement)

    // ── Scene
    const scene = new THREE.Scene()

    // ── Camera
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 3000)
    camera.position.z = 420

    // ── Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping    = true
    controls.dampingFactor    = 0.06
    controls.minDistance      = 190
    controls.maxDistance      = 850
    controls.autoRotate       = true
    controls.autoRotateSpeed  = 0.45

    // ── Clock
    const clock = new THREE.Clock()

    // ── Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.35))
    const sun = new THREE.DirectionalLight(0xffffff, 1.1)
    sun.position.set(400, 250, 300)
    scene.add(sun)
    const fill = new THREE.DirectionalLight(0x4466ff, 0.25)
    fill.position.set(-300, -100, -250)
    scene.add(fill)
    const rim = new THREE.DirectionalLight(0x0088ff, 0.15)
    rim.position.set(0, -300, -200)
    scene.add(rim)

    // ── Star Field
    const starPositions = []
    for (let i = 0; i < 5000; i++) {
      const x = (Math.random() - 0.5) * 6000
      const y = (Math.random() - 0.5) * 6000
      const z = (Math.random() - 0.5) * 6000
      if (Math.sqrt(x*x + y*y + z*z) > 600) starPositions.push(x, y, z)
    }
    const starGeo = new THREE.BufferGeometry()
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3))
    scene.add(new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.6, sizeAttenuation: true }),
    ))

    // ── Earth Sphere (dark ocean base)
    const earthGeo = new THREE.SphereGeometry(GLOBE_R, 72, 72)
    const earthMat = new THREE.MeshPhongMaterial({
      color:             0x0b1e40,
      emissive:          0x05101f,
      emissiveIntensity: 0.6,
      shininess:         18,
    })
    scene.add(new THREE.Mesh(earthGeo, earthMat))

    // ── Inner Atmosphere (subtle blue haze on the globe surface edge)
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_R * 1.055, 40, 40),
      new THREE.MeshPhongMaterial({
        color:       0x1a70ff,
        transparent: true,
        opacity:     0.055,
        side:        THREE.FrontSide,
      }),
    ))

    // ── Outer Atmosphere Halo (visible from outside)
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_R * 1.14, 40, 40),
      new THREE.MeshBasicMaterial({
        color:       0x0033ff,
        transparent: true,
        opacity:     0.018,
        side:        THREE.BackSide,
      }),
    ))

    // ── Lat / Lng Graticule (geographic grid lines)
    const gridMat = new THREE.LineBasicMaterial({ color: 0x1a3e70, transparent: true, opacity: 0.22 })
    // Parallels (latitude rings)
    for (let lat = -80; lat <= 80; lat += 20) {
      const pts = []
      for (let lng = 0; lng <= 360; lng += 3) pts.push(latLngToVec3(lat, lng - 180, GLOBE_R + 0.4))
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat))
    }
    // Meridians (longitude lines)
    for (let lng = -180; lng < 180; lng += 30) {
      const pts = []
      for (let lat = -90; lat <= 90; lat += 3) pts.push(latLngToVec3(lat, lng, GLOBE_R + 0.4))
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat))
    }

    // Store refs
    threeRef.current = { scene, camera, renderer, controls, clock, frameId: null }

    // ── Animation Loop
    const animate = () => {
      threeRef.current.frameId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()

      // Move ship particles along their arc curves
      particlesRef.current.forEach(({ mesh, curve, offset, speed }) => {
        const t = ((elapsed * speed + offset) % 1.0)
        mesh.position.copy(curve.getPoint(t))
      })

      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // ── Resize Handler
    const onResize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      if (!w || !h) return
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(threeRef.current.frameId)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, []) // run once

  // ── 2. UPDATE PORT PINS (whenever port data or algorithm state changes) ──
  useEffect(() => {
    const { scene } = threeRef.current
    if (!scene || !nodes.length) return

    const blockedSet  = new Set(scenario?.blocked_nodes || [])
    const pathNodeSet = new Set(dijkstraResult?.path     || [])

    // Remove old pin groups
    nodeGroupsRef.current.forEach(({ group }) => {
      group.children.forEach(c => { c.geometry?.dispose(); c.material?.dispose() })
      scene.remove(group)
    })
    nodeGroupsRef.current = []

    nodes.forEach(node => {
      if (node.lat == null || node.lng == null) return

      const isBlocked = blockedSet.has(node.node_id)
      const isSource  = node.node_id === sourceNode
      const isTarget  = node.node_id === targetNode
      const isOnPath  = pathNodeSet.has(node.node_id)

      const hexColor = getNodeColor(node.node_type, isBlocked, isOnPath, isSource, isTarget)
      const color    = new THREE.Color(hexColor)

      // Size: source/target > on-path > chokepoint > normal
      const isChokepoint = node.node_type === 'Chokepoint'
      const size = isSource || isTarget ? 5.5 : isOnPath ? 4.2 : isChokepoint ? 3.5 : 2.8

      const group = new THREE.Group()

      // ── Core sphere
      const coreMat = new THREE.MeshPhongMaterial({
        color,
        emissive:          color,
        emissiveIntensity: isOnPath || isSource || isTarget ? 0.95 : isChokepoint ? 0.6 : 0.35,
        transparent:       isBlocked,
        opacity:           isBlocked ? 0.3 : 1.0,
      })
      group.add(new THREE.Mesh(new THREE.SphereGeometry(size, 18, 18), coreMat))

      // ── Outer glow halo for path/source/target nodes
      if (isOnPath || isSource || isTarget) {
        const haloMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.16 })
        group.add(new THREE.Mesh(new THREE.SphereGeometry(size * 2.4, 16, 16), haloMat))
      }

      // ── Danger ring for chokepoints
      if (isChokepoint && !isBlocked) {
        const ringGeo = new THREE.TorusGeometry(size * 2, 0.4, 6, 24)
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.5 })
        group.add(new THREE.Mesh(ringGeo, ringMat))
      }

      // Position on globe surface
      group.position.copy(latLngToVec3(node.lat, node.lng, GLOBE_R + 1.5))
      group.userData = { nodeId: node.node_id, nodeData: node }
      scene.add(group)
      nodeGroupsRef.current.push({ group, nodeId: node.node_id })
    })
  }, [nodes, dijkstraResult, scenario, sourceNode, targetNode])

  // ── 3. UPDATE SHIPPING LANES + PATH PARTICLES ────────────────
  useEffect(() => {
    const { scene } = threeRef.current
    if (!scene || !nodes.length || !edges.length) return

    const nodeMap    = {}
    nodes.forEach(n => { nodeMap[n.node_id] = n })
    const pathEdgeSet = new Set(dijkstraResult?.edges || [])

    // Remove old arc tubes
    arcMeshesRef.current.forEach(({ mesh }) => {
      mesh.geometry?.dispose()
      mesh.material?.dispose()
      scene.remove(mesh)
    })
    arcMeshesRef.current = []

    // Remove old particles
    particlesRef.current.forEach(({ mesh }) => {
      mesh.geometry?.dispose()
      mesh.material?.dispose()
      scene.remove(mesh)
    })
    particlesRef.current = []

    edges.forEach(edge => {
      const src = nodeMap[edge.source]
      const tgt = nodeMap[edge.target]
      if (!src || !tgt || src.lat == null || tgt.lat == null) return

      const posA   = latLngToVec3(src.lat, src.lng)
      const posB   = latLngToVec3(tgt.lat, tgt.lng)
      const curve  = buildArcCurve(posA, posB)
      const isPath = pathEdgeSet.has(edge.edge_id)
      const isHigh = edge.congestion_weight > 1.4

      const tubeRadius = isPath ? 0.95 : 0.38
      const geo = new THREE.TubeGeometry(curve, 44, tubeRadius, 6, false)
      const mat = new THREE.MeshBasicMaterial({
        color:       isPath ? 0x06b6d4 : isHigh ? 0x7f1d1d : 0x1a4a90,
        transparent: true,
        opacity:     isPath ? 0.92 : 0.28,
      })
      const tube = new THREE.Mesh(geo, mat)
      tube.userData.edgeId = edge.edge_id
      scene.add(tube)
      arcMeshesRef.current.push({ mesh: tube, edgeId: edge.edge_id, curve })
    })

    // Animated "ship" particles along path arcs
    if (dijkstraResult?.edges?.length) {
      arcMeshesRef.current
        .filter(({ edgeId }) => pathEdgeSet.has(edgeId))
        .forEach(({ curve }) => {
          const SHIPS_PER_LANE = 4
          for (let i = 0; i < SHIPS_PER_LANE; i++) {
            const mesh = new THREE.Mesh(
              new THREE.SphereGeometry(2.0, 8, 8),
              new THREE.MeshBasicMaterial({ color: 0x00ffe0 }),
            )
            particlesRef.current.push({ mesh, curve, offset: i / SHIPS_PER_LANE, speed: 0.055 })
            scene.add(mesh)
          }
        })
    }
  }, [edges, dijkstraResult, nodes])

  // ── 4. RAYCASTING HELPERS ─────────────────────────────────────
  const getHitNode = useCallback((e) => {
    const mount = mountRef.current
    const { camera } = threeRef.current
    if (!mount || !camera) return null

    const rect  = mount.getBoundingClientRect()
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width)  *  2 - 1,
      ((e.clientY - rect.top)  / rect.height) * -2 + 1,
    )
    const raycaster = new THREE.Raycaster()
    raycaster.params.Points.threshold = 5
    raycaster.setFromCamera(mouse, camera)

    // Only raycast against core spheres (first child of each group)
    const coreMeshes = nodeGroupsRef.current.map(({ group }) => group.children[0]).filter(Boolean)
    const hits       = raycaster.intersectObjects(coreMeshes, false)
    if (!hits.length) return null

    const hitGroup = hits[0].object.parent
    return hitGroup?.userData || null
  }, [])

  const onMouseMove = useCallback((e) => {
    const hit = getHitNode(e)
    setHoveredNode(hit?.nodeData || null)
    document.body.style.cursor = hit ? 'pointer' : 'default'
  }, [getHitNode, setHoveredNode])

  const onClick = useCallback((e) => {
    const hit = getHitNode(e)
    if (hit?.nodeData) setSelectedNode(hit.nodeData)
  }, [getHitNode, setSelectedNode])

  // ── Render ────────────────────────────────────────────────────
  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: '100%', position: 'relative' }}
      onMouseMove={onMouseMove}
      onClick={onClick}
    >
      {/* ── Loading state ───────────────────────────────────────────── */}
      {!nodes.length && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', zIndex: 50, color: 'var(--text-muted)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 14 }}>🌍</div>
            <div style={{ fontSize: 14 }}>Loading maritime network…</div>
          </div>
        </div>
      )}
      {/* Hint overlay */}
      <div className="graph-overlay">
        <div className="graph-hint">
          🌍 Drag to rotate globe · Scroll to zoom · Click port to inspect
        </div>
      </div>

      {/* Port legend — top-right */}
      <div style={{
        position: 'absolute', top: 12, right: 12,
        background: 'rgba(5,11,24,0.82)',
        border: '1px solid rgba(59,130,246,0.25)',
        borderRadius: 10,
        padding: '10px 14px',
        fontSize: 11,
        color: 'var(--text-muted)',
        backdropFilter: 'blur(8px)',
        pointerEvents: 'none',
        zIndex: 10,
        lineHeight: 1.8,
      }}>
        {[
          ['#3b82f6', 'Major Port'],
          ['#a855f7', 'Transshipment Hub'],
          ['#10b981', 'Riverine Port'],
          ['#ef4444', 'Chokepoint'],
          ['#06b6d4', 'On Shortest Path'],
        ].map(([color, label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block', boxShadow: `0 0 5px ${color}` }}/>
            {label}
          </div>
        ))}
      </div>

      {/* Hovered port tooltip */}
      {hoveredNode && (
        <div style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(5,11,24,0.88)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '9px 18px',
          fontSize: 12,
          color: 'var(--text-primary)',
          pointerEvents: 'none',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          whiteSpace: 'nowrap',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        }}>
          <span style={{
            width: 10, height: 10, borderRadius: '50%',
            background: getNodeColor(hoveredNode.node_type),
            boxShadow: `0 0 8px ${getNodeColor(hoveredNode.node_type)}`,
            display: 'inline-block',
            flexShrink: 0,
          }}/>
          <div>
            <strong style={{ fontSize: 13 }}>{hoveredNode.node_name}</strong>
            <span style={{ color: 'var(--text-muted)', marginLeft: 8, fontSize: 11 }}>
              {hoveredNode.node_type}
            </span>
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
            {hoveredNode.capacity?.toLocaleString()} TEU/yr
          </span>
        </div>
      )}
    </div>
  )
}
