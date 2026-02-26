import { useState, useEffect, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { MagnifyingGlass, Funnel, Star, Clock, X } from '@phosphor-icons/react'
import { APICard } from '@/components/APICard'
import { APIDetailDialog } from '@/components/APIDetailDialog'
import type { API, ViewMode, HistoryItem } from '@/lib/types'
import { generateAPIs, getCategories, filterAPIs } from '@/lib/api-data'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'

function App() {
  const [apis, setApis] = useState<API[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedAPI, setSelectedAPI] = useState<API | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [showFilters, setShowFilters] = useState(false)

  const [favorites, setFavorites] = useKV<string[]>('api-favorites', [])
  const [history, setHistory] = useKV<HistoryItem[]>('api-history', [])

  useEffect(() => {
    const loadAPIs = async () => {
      setLoading(true)
      const generatedAPIs = await generateAPIs()
      setApis(generatedAPIs)
      setLoading(false)
    }
    loadAPIs()
  }, [])

  const categories = useMemo(() => getCategories(apis), [apis])

  const filteredAPIs = useMemo(() => {
    let result = apis

    if (viewMode === 'favorites') {
      result = apis.filter(api => favorites?.includes(api.id))
    } else if (viewMode === 'history') {
      const historyIds = new Set(history?.map(h => h.apiId) || [])
      result = apis.filter(api => historyIds.has(api.id))
      result.sort((a, b) => {
        const aHistory = history?.find(h => h.apiId === a.id)
        const bHistory = history?.find(h => h.apiId === b.id)
        return (bHistory?.timestamp || 0) - (aHistory?.timestamp || 0)
      })
      return result
    }

    return filterAPIs(result, searchQuery, selectedCategory)
  }, [apis, searchQuery, selectedCategory, viewMode, favorites, history])

  const toggleFavorite = (apiId: string) => {
    setFavorites(currentFavorites => {
      const favs = currentFavorites || []
      if (favs.includes(apiId)) {
        return favs.filter(id => id !== apiId)
      }
      return [...favs, apiId]
    })
  }

  const handleAPIClick = (api: API) => {
    setSelectedAPI(api)
    setDialogOpen(true)
    
    setHistory(currentHistory => {
      const hist = currentHistory || []
      const filtered = hist.filter(h => h.apiId !== api.id)
      return [{ apiId: api.id, timestamp: Date.now() }, ...filtered].slice(0, 20)
    })
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSelectedCategory(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.35_0.15_285/0.15),transparent_50%),radial-gradient(circle_at_70%_60%,oklch(0.75_0.15_195/0.1),transparent_50%)]" />
        
        <div className="relative">
          <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-10">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">
                    API Explorer
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Discover and test 1000+ APIs
                  </p>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {apis.length} APIs
                </Badge>
              </div>

              <div className="flex gap-2 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search APIs by name, category, or endpoint..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <Button
                  variant={showFilters ? 'default' : 'outline'}
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <Funnel className="w-4 h-4" />
                  Filters
                </Button>
              </div>

              {showFilters && (
                <div className="mt-4 p-4 bg-card rounded-lg border border-border">
                  <h3 className="text-sm font-semibold mb-2">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={selectedCategory === null ? 'default' : 'outline'}
                      onClick={() => setSelectedCategory(null)}
                    >
                      All
                    </Button>
                    {categories.map(({ category, count }) => (
                      <Button
                        key={category}
                        size="sm"
                        variant={selectedCategory === category ? 'default' : 'outline'}
                        onClick={() => setSelectedCategory(category)}
                        className="gap-2"
                      >
                        {category}
                        <Badge variant="secondary" className="ml-1">
                          {count}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </header>

          <main className="container mx-auto px-4 py-8">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <TabsList className="mb-6">
                <TabsTrigger value="all" className="gap-2">
                  All APIs
                </TabsTrigger>
                <TabsTrigger value="favorites" className="gap-2">
                  <Star weight="fill" className="w-4 h-4" />
                  Favorites ({favorites?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-2">
                  <Clock weight="fill" className="w-4 h-4" />
                  History ({history?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={viewMode}>
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <Skeleton key={i} className="h-48 w-full" />
                    ))}
                  </div>
                ) : filteredAPIs.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                      <MagnifyingGlass className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No APIs found</h3>
                    <p className="text-muted-foreground mb-4">
                      {viewMode === 'favorites'
                        ? 'You haven\'t favorited any APIs yet'
                        : viewMode === 'history'
                        ? 'You haven\'t viewed any APIs yet'
                        : 'Try adjusting your search or filters'}
                    </p>
                    {(searchQuery || selectedCategory) && viewMode === 'all' && (
                      <Button onClick={clearSearch} variant="outline">
                        Clear filters
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="mb-4 text-sm text-muted-foreground">
                      Showing {filteredAPIs.length} {filteredAPIs.length === 1 ? 'API' : 'APIs'}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredAPIs.map((api) => (
                        <APICard
                          key={api.id}
                          api={api}
                          isFavorite={favorites?.includes(api.id) || false}
                          onToggleFavorite={toggleFavorite}
                          onClick={() => handleAPIClick(api)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      <APIDetailDialog
        api={selectedAPI}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <Toaster />
    </div>
  )
}

export default App