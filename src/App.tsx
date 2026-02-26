import { useState, useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PaperPlaneRight, Trash, Sparkle } from '@phosphor-icons/react'
import { ChatMessage } from '@/components/ChatMessage'
import { TypingIndicator } from '@/components/TypingIndicator'
import type { API, ChatMessage as ChatMessageType } from '@/lib/types'
import { generateAPIs } from '@/lib/api-data'
import { processUserQuestion } from '@/lib/chat-service'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'

const EXAMPLE_QUESTIONS = [
  "What's the weather like in Tokyo?",
  "Show me the latest sports scores",
  "Find me healthy dinner recipes",
  "What are the current stock prices?",
]

function App() {
  const [apis, setApis] = useState<API[]>([])
  const [loading, setLoading] = useState(true)
  const [inputValue, setInputValue] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useKV<ChatMessageType[]>('chat-messages', [])

  useEffect(() => {
    const loadAPIs = async () => {
      setLoading(true)
      const generatedAPIs = await generateAPIs()
      setApis(generatedAPIs)
      setLoading(false)
    }
    loadAPIs()
  }, [])

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages, isProcessing])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing || apis.length === 0) return

    const userMessage: ChatMessageType = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: Date.now(),
    }

    setMessages((currentMessages) => [...(currentMessages || []), userMessage])
    setInputValue('')
    setIsProcessing(true)

    try {
      const { response, apiSources } = await processUserQuestion(userMessage.content, apis)

      const assistantMessage: ChatMessageType = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
        apiSources: apiSources.length > 0 ? apiSources : undefined,
      }

      setMessages((currentMessages) => [...(currentMessages || []), assistantMessage])
    } catch (error) {
      console.error('Failed to process message:', error)
      toast.error('Failed to process your message. Please try again.')
      
      const errorMessage: ChatMessageType = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: "I'm having trouble processing your request right now. Please try again in a moment.",
        timestamp: Date.now(),
      }
      setMessages((currentMessages) => [...(currentMessages || []), errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleExampleClick = (question: string) => {
    setInputValue(question)
  }

  const handleClearChat = () => {
    setMessages([])
    toast.success('Chat history cleared')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.35_0.15_285/0.15),transparent_50%),radial-gradient(circle_at_70%_60%,oklch(0.75_0.15_195/0.1),transparent_50%)]" />
      
      <div className="relative flex flex-col h-screen">
        <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 px-4 py-4 flex-shrink-0">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                <Sparkle weight="fill" className="w-6 h-6 text-background" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">
                  API Chat
                </h1>
                <p className="text-xs text-muted-foreground">
                  Ask anything - powered by {apis.length} APIs
                </p>
              </div>
            </div>
            {(messages && messages.length > 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearChat}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <Trash className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col container mx-auto">
          <ScrollArea ref={scrollAreaRef} className="flex-1 px-4">
            <div className="py-6 max-w-4xl mx-auto">
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground">Loading API catalog...</p>
                  </div>
                </div>
              )}

              {!loading && (!messages || messages.length === 0) && (
                <div className="flex flex-col items-center justify-center py-12 space-y-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                    <Sparkle weight="fill" className="w-10 h-10 text-accent" />
                  </div>
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold">Welcome to API Chat</h2>
                    <p className="text-muted-foreground max-w-md">
                      Ask me anything! I'll automatically search through {apis.length} APIs to find the information you need.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 w-full max-w-md">
                    <p className="text-sm font-medium text-muted-foreground">Try asking:</p>
                    {EXAMPLE_QUESTIONS.map((question, i) => (
                      <button
                        key={i}
                        onClick={() => handleExampleClick(question)}
                        className="text-left p-3 rounded-lg bg-card border border-border hover:border-accent/50 transition-colors text-sm"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!loading && messages && messages.length > 0 && (
                <div className="space-y-1">
                  {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  {isProcessing && <TypingIndicator />}
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t border-border/50 backdrop-blur-sm bg-background/80 p-4 flex-shrink-0">
            <div className="container mx-auto max-w-4xl">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask me anything..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={isProcessing || loading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isProcessing || loading}
                  className="gap-2 px-6"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <PaperPlaneRight weight="fill" className="w-5 h-5" />
                  )}
                  Send
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Responses are generated using AI and may not reflect real data
              </p>
            </div>
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  )
}

export default App
