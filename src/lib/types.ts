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

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  apiSources?: API[]
}

export interface ConversationHistory {
  messages: ChatMessage[]
}
