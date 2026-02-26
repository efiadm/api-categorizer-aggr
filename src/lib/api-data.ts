import type { API } from './types'

const CATEGORIES = [
  'Weather',
  'Finance',
  'Social Media',
  'Data & Analytics',
  'AI & Machine Learning',
  'Maps & Geolocation',
  'E-commerce',
  'Communication',
  'Entertainment',
  'Health & Fitness',
  'News & Media',
  'Development Tools',
  'Transportation',
  'Food & Recipes',
  'Sports',
  'Gaming',
  'Education',
  'Real Estate',
  'IoT & Smart Home',
  'Security',
]

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const
const STATUSES = ['active', 'beta', 'deprecated'] as const

export async function generateAPIs(): Promise<API[]> {
  const prompt = spark.llmPrompt`Generate exactly 1000 unique API entries for an API directory application. Each API should have realistic data.

Return the result as a valid JSON object with a single property called "apis" that contains the API list.

Each API object should have:
- id: unique identifier (use sequential numbers like "api-001", "api-002", etc.)
- name: creative API name (e.g., "OpenWeather Current", "Stripe Payments", "Twitter Timeline")
- description: brief description of what the API does (1-2 sentences)
- category: one of ${JSON.stringify(CATEGORIES)}
- endpoint: realistic API endpoint URL (e.g., "https://api.service.com/v1/resource")
- method: one of ${JSON.stringify(METHODS)}
- authRequired: boolean
- status: one of ${JSON.stringify(STATUSES)} (90% active, 8% beta, 2% deprecated)
- rateLimit: string like "100 requests/hour" or "1000 requests/day"

Distribute APIs evenly across all categories. Make the data realistic and diverse.

Return format:
{
  "apis": [
    {
      "id": "api-001",
      "name": "OpenWeather Current",
      "description": "Get current weather data for any location worldwide with temperature, humidity, and conditions.",
      "category": "Weather",
      "endpoint": "https://api.openweathermap.org/data/2.5/weather",
      "method": "GET",
      "authRequired": true,
      "status": "active",
      "rateLimit": "60 calls/minute"
    }
  ]
}`

  try {
    const result = await spark.llm(prompt, 'gpt-4o', true)
    const parsed = JSON.parse(result)
    return parsed.apis || []
  } catch (error) {
    console.error('Failed to generate APIs:', error)
    return getFallbackAPIs()
  }
}

function getFallbackAPIs(): API[] {
  const apis: API[] = []
  const apisPerCategory = Math.floor(1000 / CATEGORIES.length)
  
  CATEGORIES.forEach((category, categoryIndex) => {
    for (let i = 0; i < apisPerCategory; i++) {
      const index = categoryIndex * apisPerCategory + i
      const id = `api-${String(index + 1).padStart(3, '0')}`
      const statusRand = Math.random()
      const status = statusRand < 0.9 ? 'active' : statusRand < 0.98 ? 'beta' : 'deprecated'
      
      apis.push({
        id,
        name: `${category} API ${i + 1}`,
        description: `A comprehensive ${category.toLowerCase()} API providing access to various ${category.toLowerCase()} related data and services.`,
        category,
        endpoint: `https://api.${category.toLowerCase().replace(/\s+/g, '')}.com/v1/data`,
        method: METHODS[Math.floor(Math.random() * METHODS.length)],
        authRequired: Math.random() > 0.3,
        status,
        rateLimit: `${[100, 500, 1000, 5000][Math.floor(Math.random() * 4)]} requests/hour`,
      })
    }
  })
  
  return apis
}

export function getCategories(apis: API[]): { category: string; count: number }[] {
  const categoryMap = new Map<string, number>()
  
  apis.forEach(api => {
    categoryMap.set(api.category, (categoryMap.get(api.category) || 0) + 1)
  })
  
  return Array.from(categoryMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
}

export function filterAPIs(
  apis: API[],
  searchQuery: string,
  selectedCategory: string | null
): API[] {
  let filtered = apis
  
  if (selectedCategory) {
    filtered = filtered.filter(api => api.category === selectedCategory)
  }
  
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase()
    filtered = filtered.filter(
      api =>
        api.name.toLowerCase().includes(query) ||
        api.description.toLowerCase().includes(query) ||
        api.category.toLowerCase().includes(query) ||
        api.endpoint.toLowerCase().includes(query)
    )
  }
  
  return filtered
}
