import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

api.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(new Error(err.response?.data?.detail || err.message || 'API error'))
)

export const getGraph    = () => api.get('/graph')
export const getNode     = (id) => api.get(`/node/${id}`)
export const getMetrics  = () => api.get('/metrics')

export const runDijkstra = (source, target, weight = 'cost') =>
  api.post('/algorithm/dijkstra', { source, target, weight })

export const blockNode   = (node_id) => api.post('/scenario/block-node', { node_id })
export const unblockNode = (node_id) => api.post('/scenario/unblock-node', { node_id })
export const updateEdge  = (edge_id, congestion_weight) =>
  api.post('/scenario/update-edge', { edge_id, congestion_weight })
export const resetScenario = () => api.post('/scenario/reset')
export const getScenario   = () => api.get('/scenario')

export default api
