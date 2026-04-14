import type { Table as ReactTableType } from "@tanstack/react-table";
import type { CatalogueItemType } from "../hooks/useCatalogue";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Field, FieldLabel } from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface CataloguePaginationProps {
    table: ReactTableType<CatalogueItemType>;
}

function getPaginationNumbers(pageIndex: number, pageCount: number): (number | "...")[] {
    const current = pageIndex + 1;
    const total = pageCount;
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 3) return [1, 2, 3, 4, "...", total];
    if (current >= total - 2) return [1, "...", total - 3, total - 2, total - 1, total];
    return [1, "...", current - 1, current, current + 1, "...", total];
}

const CataloguePagination = ({ table }: CataloguePaginationProps) => {
    const { pageIndex, pageSize } = table.getState().pagination;
    const pageCount = table.getPageCount();
    const pages = getPaginationNumbers(pageIndex, pageCount);

    return (
        <div className="flex flex-row relative items-center">
            <Field className="flex flex-row w-70 items-center gap-x-1">
                <FieldLabel>Rows per page:</FieldLabel>
                <Select
                    value={pageSize.toString()}
                    onValueChange={(v) => table.setPageSize(Number(v))}
                >
                    <SelectTrigger size="sm" id="select-rows-per-page">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="start">
                        <SelectGroup>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="24">24</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </Field>

            <Pagination className="pr-80">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => table.getCanPreviousPage() && table.previousPage()}
                            aria-disabled={!table.getCanPreviousPage()}
                            className={!table.getCanPreviousPage() ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                    </PaginationItem>

                    {pages.map((page, i) => (
                        <PaginationItem key={i}>
                            {page === "..." ? (
                                <PaginationEllipsis />
                            ) : (
                                <PaginationLink
                                    isActive={pageIndex === (page as number) - 1}
                                    onClick={() => table.setPageIndex((page as number) - 1)}
                                    className="cursor-pointer"
                                >
                                    {page}
                                </PaginationLink>
                            )}
                        </PaginationItem>
                    ))}

                    <PaginationItem>
                        <PaginationNext
                            onClick={() => table.getCanNextPage() && table.nextPage()}
                            aria-disabled={!table.getCanNextPage()}
                            className={!table.getCanNextPage() ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
};

export default CataloguePagination;
