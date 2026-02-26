export interface API {
  id: string
  name: string
  description: string
  category: string
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  authRequired: boolean
  status: 'active' | 'beta' | 'deprecated'
  rateLimit?: string
  documentation?: string
}

export type ViewMode = 'all' | 'favorites' | 'history'

export interface HistoryItem {
  apiId: string
  timestamp: number
}
