import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface CataloguePaginationProps {
    pageIndex: number;
    pageSize: number;
    totalCount: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

// Build the page number list with ellipsis:
// Always show first, last, current ±1. Fill gaps with ellipsis.
function buildPageList(
    current: number,
    total: number,
): (number | "ellipsis-start" | "ellipsis-end")[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);

    const pages: (number | "ellipsis-start" | "ellipsis-end")[] = [];
    const near = new Set(
        [0, total - 1, current - 1, current, current + 1].filter(
            (p) => p >= 0 && p < total,
        ),
    );

    let prev: number | null = null;
    for (const p of Array.from(near).sort((a, b) => a - b)) {
        if (prev !== null && p - prev > 1) {
            if (prev + 1 === p - 1) {
                pages.push(prev + 1);
            } else {
                pages.push(p < current ? "ellipsis-start" : "ellipsis-end");
            }
        }
        pages.push(p);
        prev = p;
    }

    return pages;
}

const CataloguePagination = ({
    pageIndex,
    pageSize,
    totalCount,
    onPageChange,
    onPageSizeChange,
}: CataloguePaginationProps) => {
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    const pages = buildPageList(pageIndex, totalPages);

    return (
        <div className="flex items-center justify-between px-8 py-3  mt-auto shrink-0">
            {/* ── Left: page size selector ─────────────────────────────── */}
            <div className="flex items-center gap-2">
                <span className="text-label whitespace-nowrap">
                    Rows per page
                </span>
                <Select
                    value={String(pageSize)}
                    onValueChange={(v) => {
                        onPageSizeChange(Number(v));
                        onPageChange(0);
                    }}
                >
                    <SelectTrigger
                        size="sm"
                        className="w-20 text-xs border-border"
                    >
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="start">
                        {PAGE_SIZE_OPTIONS.map((s) => (
                            <SelectItem
                                key={s}
                                value={String(s)}
                                className="text-xs"
                            >
                                {s}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Pagination className="w-auto mx-0 flex-1">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() =>
                                onPageChange(Math.max(0, pageIndex - 1))
                            }
                            aria-disabled={pageIndex === 0}
                            className={
                                pageIndex === 0
                                    ? "pointer-events-none opacity-40"
                                    : "cursor-pointer"
                            }
                        />
                    </PaginationItem>

                    {pages.map((p, i) => {
                        if (p === "ellipsis-start" || p === "ellipsis-end") {
                            return (
                                <PaginationItem key={`${p}-${i}`}>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            );
                        }
                        return (
                            <PaginationItem key={p}>
                                <PaginationLink
                                    isActive={p === pageIndex}
                                    onClick={() => onPageChange(p)}
                                    className="cursor-pointer text-xs"
                                >
                                    {p + 1}
                                </PaginationLink>
                            </PaginationItem>
                        );
                    })}

                    <PaginationItem>
                        <PaginationNext
                            onClick={() =>
                                onPageChange(
                                    Math.min(totalPages - 1, pageIndex + 1),
                                )
                            }
                            aria-disabled={pageIndex >= totalPages - 1}
                            className={
                                pageIndex >= totalPages - 1
                                    ? "pointer-events-none opacity-40"
                                    : "cursor-pointer"
                            }
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>

            {/* ── Right: count summary ─────────────────────────────────── */}
            <p className="text-label font-mono tabular-nums whitespace-nowrap">
                {pageIndex * pageSize + 1}–
                {Math.min((pageIndex + 1) * pageSize, totalCount)} of{" "}
                {totalCount}
            </p>
        </div>
    );
};

export default CataloguePagination;
