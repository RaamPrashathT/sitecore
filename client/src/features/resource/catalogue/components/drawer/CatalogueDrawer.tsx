import { X } from 'lucide-react'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetClose,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import CatalogueDetailSection from './CatalogueDetailSection'
import CatalogueQuotesSection from './CatalogueQuotesSection'
import CatalogueSuppliersSection from './CatalogueSuppliersSection'
import CatalogueStocksSection from './CatalogueStocksSection'

interface CatalogueDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    catalogueId: string | null
    itemName?: string
    isAdmin: boolean
}

const CatalogueDrawer = ({
    open,
    onOpenChange,
    catalogueId,
    itemName,
    isAdmin,
}: CatalogueDrawerProps) => {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                showCloseButton={false}
                // 50vw on desktop, full width on mobile
                className="w-full sm:w-[50vw] sm:max-w-none p-0 flex flex-col gap-0"
            >
                {/* ── Sticky header ──────────────────────────────────────── */}
                <SheetHeader className="sticky top-0 z-10 bg-background border-b border-border px-6 flex-row  justify-between gap-4 h-15.5 items-center">
                    <div className="min-w-0 flex-1">
                        <SheetTitle className="text-lg font-semibold text-foreground leading-tight truncate">
                            {itemName ?? '—'}
                        </SheetTitle>
                    </div>
                    <SheetClose asChild>
                        <button
                            type="button"
                            className="shrink-0 mt-0.5 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Close drawer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </SheetClose>
                </SheetHeader>

                {/* ── Scrollable body ────────────────────────────────────── */}
                {catalogueId && (
                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                        {/* 1. Details */}
                        <CatalogueDetailSection
                            catalogueId={catalogueId}
                            isAdmin={isAdmin}
                        />

                        <Separator />

                        {/* 2. Quotes */}
                        <CatalogueQuotesSection
                            catalogueId={catalogueId}
                            isAdmin={isAdmin}
                        />

                        <Separator />

                        {/* 3. Suppliers */}
                        <CatalogueSuppliersSection
                            catalogueId={catalogueId}
                            isAdmin={isAdmin}
                        />

                        <Separator />

                        {/* 4. Stocks / Locations */}
                        <CatalogueStocksSection catalogueId={catalogueId} />
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}

export default CatalogueDrawer
