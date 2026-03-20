import type { Table as ReactTableType } from "@tanstack/react-table";
import type { DashboardItemType } from "../hooks/useGetDashboardItems";
import {
    Pagination,
    PaginationContent,
    // PaginationEllipsis,
    PaginationItem,
    // PaginationLink,
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

const AdminDashboardPagination = ({ table }: AdminDashboardPaginationProps) => {
    return (
        <div className="flex flex-row relative">
            <Field className="flex flex-row w-70 items-center gap-x-1">
                <FieldLabel>Rows per page:</FieldLabel>
                
                <Select defaultValue="25"
                    value={table.getState().pagination.pageSize.toString()}
                    onValueChange={(value) => table.setPageSize(Number(value))}
                >
                    <SelectTrigger className="" size="sm" id="select-rows-per-page">
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
            <Pagination className="pr-80">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => table.getCanPreviousPage() && table.previousPage()}
                            aria-disabled={!table.getCanPreviousPage()}
                        />
                    </PaginationItem>
                    <PaginationItem>
                        
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationNext 
                            onClick={() => table.getCanNextPage() && table.nextPage()}
                            aria-disabled={!table.getCanNextPage()}
                            className=""
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
};

export default AdminDashboardPagination;
