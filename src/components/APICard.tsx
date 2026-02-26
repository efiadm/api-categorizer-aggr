import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star } from '@phosphor-icons/react'
import type { API } from '@/lib/types'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface APICardProps {
  api: API
  isFavorite: boolean
  onToggleFavorite: (apiId: string) => void
  onClick: () => void
}

export function APICard({ api, isFavorite, onToggleFavorite, onClick }: APICardProps) {
  const statusColors = {
    active: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    beta: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    deprecated: 'bg-red-500/20 text-red-300 border-red-500/30',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -4, scale: 1.02 }}
    >
      <Card
        className="relative group cursor-pointer overflow-hidden bg-card border-border hover:border-accent/50 transition-all duration-200 h-full flex flex-col"
        onClick={onClick}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        
        <div className="relative p-4 flex flex-col gap-3 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-lg truncate">
                {api.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {api.description}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite(api.id)
              }}
              className="flex-shrink-0 text-muted-foreground hover:text-accent transition-colors p-1"
            >
              <Star
                weight={isFavorite ? 'fill' : 'regular'}
                className={cn(
                  'w-5 h-5',
                  isFavorite && 'text-accent'
                )}
              />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant="outline" className="font-mono text-xs">
              {api.method}
            </Badge>
            <Badge variant="outline" className={cn('text-xs border', statusColors[api.status])}>
              {api.status}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {api.category}
            </Badge>
          </div>

          <div className="mt-auto pt-2">
            <code className="text-xs text-muted-foreground font-mono block truncate">
              {api.endpoint}
            </code>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
