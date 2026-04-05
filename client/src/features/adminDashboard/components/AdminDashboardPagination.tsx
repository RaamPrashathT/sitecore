import type { Table as ReactTableType } from "@tanstack/react-table";
import type { DashboardItemType } from "../hooks/useGetDashboardItems";
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

interface AdminDashboardPaginationProps {
    table: ReactTableType<DashboardItemType>;
}

// ... keep getPaginationNumbers function exactly as is ...
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

const AdminDashboardPagination = ({ table }: AdminDashboardPaginationProps) => {
    const { pageIndex, pageSize } = table.getState().pagination;
    const pageCount = table.getPageCount();
    
    const paginationNumbers = getPaginationNumbers(pageIndex, pageCount);

    return (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
            <Field className="flex flex-row items-center gap-x-3">
                <FieldLabel className="text-sm text-muted-foreground whitespace-nowrap">Rows per page:</FieldLabel>
                
                <Select 
                    defaultValue={pageSize.toString()} 
                    value={pageSize.toString()}
                    onValueChange={(value) => table.setPageSize(Number(value))}
                >
                    <SelectTrigger className="w-20 h-8" size="sm" id="select-rows-per-page">
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
            
            <Pagination className="w-auto mx-0">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => table.getCanPreviousPage() && table.previousPage()}
                            aria-disabled={!table.getCanPreviousPage()}
                            className={!table.getCanPreviousPage() ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
                                    className="cursor-pointer"
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
                            className={!table.getCanNextPage() ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
};

export default AdminDashboardPagination;