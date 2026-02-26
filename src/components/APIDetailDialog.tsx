import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Play, Check, X } from '@phosphor-icons/react'
import type { API } from '@/lib/types'
import { useState } from 'react'
import { toast } from 'sonner'

interface APIDetailDialogProps {
  api: API | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function APIDetailDialog({ api, open, onOpenChange }: APIDetailDialogProps) {
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; data: string } | null>(null)

  if (!api) return null

  const handleTestAPI = async () => {
    setTesting(true)
    setTestResult(null)

    await new Promise(resolve => setTimeout(resolve, 1000))

    const success = Math.random() > 0.3
    
    if (success) {
      setTestResult({
        success: true,
        data: JSON.stringify(
          {
            status: 'success',
            message: 'API response received successfully',
            data: {
              timestamp: new Date().toISOString(),
              endpoint: api.endpoint,
              method: api.method,
            },
          },
          null,
          2
        ),
      })
      toast.success('API test successful!')
    } else {
      setTestResult({
        success: false,
        data: JSON.stringify(
          {
            status: 'error',
            message: 'Failed to connect to API',
            error: 'Network timeout or authentication failure',
          },
          null,
          2
        ),
      })
      toast.error('API test failed')
    }

    setTesting(false)
  }

  const statusColors = {
    active: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    beta: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    deprecated: 'bg-red-500/20 text-red-300 border-red-500/30',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{api.name}</DialogTitle>
          <DialogDescription className="text-base">
            {api.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="font-mono">
              {api.method}
            </Badge>
            <Badge variant="outline" className={statusColors[api.status]}>
              {api.status}
            </Badge>
            <Badge variant="secondary">{api.category}</Badge>
          </div>

          <Separator />

          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold mb-1 text-muted-foreground">Endpoint</h4>
              <code className="block p-3 bg-muted rounded-md text-sm font-mono break-all">
                {api.endpoint}
              </code>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold mb-1 text-muted-foreground">Authentication</h4>
                <p className="text-sm">{api.authRequired ? 'Required' : 'Not Required'}</p>
              </div>
              {api.rateLimit && (
                <div>
                  <h4 className="text-sm font-semibold mb-1 text-muted-foreground">Rate Limit</h4>
                  <p className="text-sm">{api.rateLimit}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-muted-foreground">Test API</h4>
              <Button
                size="sm"
                onClick={handleTestAPI}
                disabled={testing}
                className="gap-2"
              >
                {testing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play weight="fill" className="w-4 h-4" />
                    Test Request
                  </>
                )}
              </Button>
            </div>

            {testResult && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {testResult.success ? (
                    <>
                      <Check weight="bold" className="w-5 h-5 text-emerald-400" />
                      <span className="text-sm font-medium text-emerald-400">Success</span>
                    </>
                  ) : (
                    <>
                      <X weight="bold" className="w-5 h-5 text-red-400" />
                      <span className="text-sm font-medium text-red-400">Failed</span>
                    </>
                  )}
                </div>
                <pre className="p-3 bg-muted rounded-md text-xs font-mono overflow-x-auto">
                  {testResult.data}
                </pre>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
