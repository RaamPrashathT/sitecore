import { useState } from 'react'
import { useMembership } from '@/hooks/useMembership'
import { useCatalogueList } from '../hooks/useCatalogue'
import { useDebounce } from '@/hooks/useDebounce'
import CatalogueTable from './CatalogueTable'
import CatalogueSkeleton from './CatalogueSkeleton'
import CataloguePagination from './CataloguePagination'
import CatalogueDrawer from './drawer/CatalogueDrawer'
import type { CatalogueItem } from '../catalogue.schema'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Plus } from 'lucide-react'

// Category filter options — matches the enum
const CATEGORIES = [
    { value: '', label: 'All' },
    { value: 'MATERIALS', label: 'Materials' },
    { value: 'LABOUR', label: 'Labour' },
    { value: 'EQUIPMENT', label: 'Equipment' },
    { value: 'SUBCONTRACTORS', label: 'Subcontractors' },
    { value: 'TRANSPORT', label: 'Transport' },
    { value: 'OVERHEAD', label: 'Overhead' },
] as const

const CatalogueMain = () => {
    const { data: membership } = useMembership()

    const [search, setSearch] = useState('')
    const [pageIndex, setPageIndex] = useState(0)
    const [pageSize, setPageSize] = useState(10)
    const [activeCategory, setActiveCategory] = useState('')
    const [selectedItem, setSelectedItem] = useState<CatalogueItem | null>(null)

    const debouncedSearch = useDebounce(search, 250)

    const { data, isLoading, isFetching } = useCatalogueList(
        membership?.id,
        pageIndex,
        pageSize,
        debouncedSearch,
    )

    const allItems = data?.data ?? []
    const totalCount = data?.count ?? 0
    const isAdmin = membership?.role === 'ADMIN'

    // Client-side category filter (data is already paginated from server)
    const items = activeCategory
        ? allItems.filter((i) => i.category === activeCategory)
        : allItems

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
        setPageIndex(0)
    }

    const handleCategoryChange = (cat: string) => {
        setActiveCategory(cat)
        setPageIndex(0)
    }

    return (
        <div className="flex flex-col h-full bg-background">

            {/* ── Page header ─────────────────────────────────────────────── */}
            <div className="px-8 pt-8 pb-0">
                <div className="row-between mb-6">
                    <div>
                        {/* Breadcrumb-style context label */}
                        <p className="text-label uppercase tracking-[0.12em] mb-2">
                            Resources
                        </p>
                        <h1 className="text-[2rem] font-semibold text-foreground tracking-tight leading-none">
                            Catalogue
                        </h1>
                    </div>

                    <div className="row gap-3">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                            <Input
                                value={search}
                                onChange={handleSearchChange}
                                placeholder="Search…"
                                className="pl-9 h-9 w-52 text-sm bg-background border-border focus-visible:ring-ring/30 placeholder:text-muted-foreground"
                            />
                        </div>

                        {isAdmin && (
                            <Button
                                size="sm"
                                className="h-9 px-4 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-none gap-1.5"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add Item
                            </Button>
                        )}
                    </div>
                </div>

                {/* ── Category filter tabs ─────────────────────────────────── */}
                <div className="flex items-center gap-0 border-b border-border">
                    {CATEGORIES.map((cat) => {
                        const isActive = activeCategory === cat.value
                        return (
                            <button
                                key={cat.value}
                                type="button"
                                onClick={() => handleCategoryChange(cat.value)}
                                className={`
                                    relative px-4 py-2.5 text-xs font-medium tracking-wide
                                    transition-colors duration-100 whitespace-nowrap
                                    ${isActive
                                        ? 'text-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }
                                `}
                            >
                                {cat.label}
                                {/* Active underline — the only green on this page besides the button */}
                                {isActive && (
                                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                                )}
                            </button>
                        )
                    })}

                    {/* Item count — pushed to the right */}
                    {!isLoading && totalCount > 0 && (
                        <span className="ml-auto pr-1 text-label tabular-nums">
                            {items.length === totalCount
                                ? `${totalCount} items`
                                : `${items.length} of ${totalCount}`}
                        </span>
                    )}
                </div>
            </div>

            {/* ── Table area ──────────────────────────────────────────────── */}
            <div
                className={`flex-1 px-8 pt-0 pb-0 transition-opacity duration-150 ${
                    isFetching && !isLoading ? 'opacity-50' : 'opacity-100'
                }`}
            >
                {isLoading ? (
                    <CatalogueSkeleton />
                ) : (
                    <CatalogueTable
                        data={items}
                        onRowClick={(item) => setSelectedItem(item)}
                    />
                )}
            </div>
                
            {/* ── Pagination ──────────────────────────────────────────────── */}
            <CataloguePagination
                pageIndex={pageIndex}
                pageSize={pageSize}
                totalCount={totalCount}
                onPageChange={setPageIndex}
                onPageSizeChange={(size) => {
                    setPageSize(size)
                    setPageIndex(0)
                }}
            />

            {/* ── Drawer ──────────────────────────────────────────────── */}
            <CatalogueDrawer
                open={selectedItem !== null}
                onOpenChange={(open) => { if (!open) setSelectedItem(null) }}
                catalogueId={selectedItem?.id ?? null}
                itemName={selectedItem?.name}
                isAdmin={isAdmin}
            />
        </div>
    )
}

export default CatalogueMain
