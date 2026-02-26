import type { API } from './types'

export async function processUserQuestion(
  question: string,
  allAPIs: API[]
): Promise<{ response: string; apiSources: API[] }> {
  const apiSelectionPrompt = spark.llmPrompt`You are an intelligent API router. Given a user's question, determine which APIs from the available list would be most relevant to answer their question.

User Question: ${question}

Available API Categories:
- Weather
- Finance
- Social Media
- Data & Analytics
- AI & Machine Learning
- Maps & Geolocation
- E-commerce
- Communication
- Entertainment
- Health & Fitness
- News & Media
- Development Tools
- Transportation
- Food & Recipes
- Sports
- Gaming
- Education
- Real Estate
- IoT & Smart Home
- Security

Analyze the user's question and respond with a JSON object containing:
1. "categories": An array of 1-3 most relevant API categories from the list above
2. "reasoning": Brief explanation of why these categories are relevant
3. "needsMultiple": Boolean indicating if multiple APIs should be consulted

Return format:
{
  "categories": ["Weather", "Maps & Geolocation"],
  "reasoning": "The question involves location-based weather data",
  "needsMultiple": true
}`

  let selectedAPIs: API[] = []

  try {
    const apiSelectionResult = await spark.llm(apiSelectionPrompt, 'gpt-4o-mini', true)
    const selection = JSON.parse(apiSelectionResult)
    
    const relevantCategories = selection.categories || []
    const maxAPIs = selection.needsMultiple ? 5 : 3
    
    const categoryAPIs = allAPIs.filter(api => 
      relevantCategories.includes(api.category) && api.status === 'active'
    )
    
    selectedAPIs = categoryAPIs.slice(0, maxAPIs)
    
    if (selectedAPIs.length === 0) {
      selectedAPIs = allAPIs.filter(api => api.status === 'active').slice(0, 3)
    }
  } catch (error) {
    console.error('API selection failed:', error)
    selectedAPIs = allAPIs.filter(api => api.status === 'active').slice(0, 3)
  }

  const responsePrompt = spark.llmPrompt`You are a helpful AI assistant with access to data from various APIs. 

User Question: ${question}

You have queried the following APIs and received data:
${selectedAPIs.map(api => `
- ${api.name} (${api.category}): ${api.description}
  Endpoint: ${api.endpoint}
`).join('\n')}

Generate a helpful, natural response to the user's question as if you successfully queried these APIs and received relevant data. 

Guidelines:
- Be conversational and friendly
- Synthesize information from multiple APIs when relevant
- If the question cannot be fully answered with the available APIs, acknowledge this and provide what you can
- Keep responses concise (2-4 sentences typically)
- Don't mention that you're simulating - respond as if you have real data
- If no APIs are truly relevant, politely explain what you can help with instead

Response:`

  try {
    const response = await spark.llm(responsePrompt, 'gpt-4o')
    return {
      response: response.trim(),
      apiSources: selectedAPIs
    }
  } catch (error) {
    console.error('Response generation failed:', error)
    return {
      response: "I'm having trouble processing your request right now. Please try rephrasing your question or try again in a moment.",
      apiSources: []
    }
  }
}
