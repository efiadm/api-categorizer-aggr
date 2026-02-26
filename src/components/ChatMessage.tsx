import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Sparkle, User } from '@phosphor-icons/react'
import type { ChatMessage as ChatMessageType } from '@/lib/types'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn('flex gap-3 mb-4', isUser && 'flex-row-reverse')}
    >
      <div className={cn(
        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
        isUser ? 'bg-card text-foreground' : 'bg-accent text-accent-foreground'
      )}>
        {isUser ? (
          <User weight="fill" className="w-5 h-5" />
        ) : (
          <Sparkle weight="fill" className="w-5 h-5" />
        )}
      </div>

      <div className={cn('flex flex-col gap-2 max-w-[85%] sm:max-w-3xl', isUser && 'items-end')}>
        <Card className={cn(
          'p-3 border',
          isUser 
            ? 'bg-card border-border' 
            : 'bg-muted border-muted'
        )}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </Card>

        {message.apiSources && message.apiSources.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.25 }}
            className="flex flex-wrap gap-1"
          >
            <TooltipProvider>
              {message.apiSources.map((api) => (
                <Tooltip key={api.id}>
                  <TooltipTrigger asChild>
                    <Badge 
                      variant="outline" 
                      className="text-xs font-mono cursor-help hover:bg-accent/10 transition-colors"
                    >
                      {api.name}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <div className="space-y-1">
                      <p className="font-semibold text-sm">{api.name}</p>
                      <p className="text-xs text-muted-foreground">{api.description}</p>
                      <p className="text-xs font-mono text-accent">{api.category}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </motion.div>
        )}

        <span className="text-xs text-muted-foreground px-1">
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
      </div>
    </motion.div>
  )
}
