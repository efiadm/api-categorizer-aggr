import { Card } from '@/components/ui/card'
import { Sparkle } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

export function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-accent text-accent-foreground">
        <Sparkle weight="fill" className="w-5 h-5" />
      </div>

      <Card className="p-3 bg-muted border-muted">
        <div className="flex gap-1 items-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-muted-foreground"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      </Card>
    </div>
  )
}
