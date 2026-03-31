import type { Table as ReactTableType } from "@tanstack/react-table";
import { type CatalogueItemType } from "../hooks/useGetCatalogues";
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
    SelectGroup,
    SelectItem,
    SelectContent,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface CataloguePaginationProps {
    table: ReactTableType<CatalogueItemType>;
}

const getPaginationNumbers = (pageIndex: number, pageCount: number) => {
    const currentPage = pageIndex + 1; 
    const totalPages = pageCount;

    if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
        return [1, 2, 3, 4, "...", totalPages];
    }

    if (currentPage >= totalPages - 2) {
        return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
};

const CataloguePagination = ({ table }: CataloguePaginationProps) => {
    const { pageIndex, pageSize } = table.getState().pagination;
    const pageCount = table.getPageCount();
    
    const paginationNumbers = getPaginationNumbers(pageIndex, pageCount);

    return (
        <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Field className="flex flex-row items-center gap-x-2">
                <FieldLabel className="font-sans text-sm text-muted-foreground">Rows per page</FieldLabel>
                
                <Select 
                    defaultValue={pageSize.toString()} 
                    value={pageSize.toString()}
                    onValueChange={(value) => table.setPageSize(Number(value))}
                >
                    <SelectTrigger className="h-9 w-24 border-border bg-background font-mono text-sm tabular-nums" size="sm" id="select-rows-per-page">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="start">
                        <SelectGroup>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </Field>
            
            <Pagination className="md:justify-end">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => table.getCanPreviousPage() && table.previousPage()}
                            aria-disabled={!table.getCanPreviousPage()}
                            className={!table.getCanPreviousPage() ? "pointer-events-none opacity-50" : "cursor-pointer font-sans hover:border-green-700/40 hover:text-green-700"}
                        />
                    </PaginationItem>
                    
                    {paginationNumbers.map((pageNumber, index) => (
                        <PaginationItem key={index}>
                            {pageNumber === "..." ? (
                                <PaginationEllipsis />
                            ) : (
                                <PaginationLink
                                    isActive={pageIndex === (pageNumber as number) - 1}
                                    onClick={() => table.setPageIndex((pageNumber as number) - 1)}
                                    className="cursor-pointer font-mono tabular-nums data-[active=true]:border-green-700 data-[active=true]:bg-green-700 data-[active=true]:text-white"
                                >
                                    {pageNumber}
                                </PaginationLink>
                            )}
                        </PaginationItem>
                    ))}

                    <PaginationItem>
                        <PaginationNext 
                            onClick={() => table.getCanNextPage() && table.nextPage()}
                            aria-disabled={!table.getCanNextPage()}
                            className={!table.getCanNextPage() ? "pointer-events-none opacity-50" : "cursor-pointer font-sans hover:border-green-700/40 hover:text-green-700"}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
};

export default CataloguePagination;