/* eslint-disable react-hooks/incompatible-library */
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { CatalogueInventoryLocation } from "../../hooks/useCatalogueInventoryLocations";
import { catalogueLocationColumns } from "./CatalogueLocationsColumns";

interface CatalogueLocationsTableProps {
    data: CatalogueInventoryLocation[];
    globalFilter: string;
}

export function CatalogueLocationsTable({
    data,
    globalFilter,
}: CatalogueLocationsTableProps) {
    const table = useReactTable({
        data,
        columns: catalogueLocationColumns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: { globalFilter },
        globalFilterFn: "includesString",
    });

    const rows = table.getRowModel().rows;

    if (rows.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-14 text-center">
                <p className="mb-1 text-sm font-medium text-foreground">
                    {globalFilter ? "No locations match your filter" : "No stock locations yet"}
                </p>
                <p className="text-xs text-muted-foreground">
                    {globalFilter
                        ? "Try a different location name or code."
                        : "Inventory for this catalogue item will appear here once stock is recorded."}
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-border overflow-hidden">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow
                            key={headerGroup.id}
                            className="bg-muted/40 hover:bg-muted/40"
                        >
                            {headerGroup.headers.map((header) => (
                                <TableHead
                                    key={header.id}
                                    className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                                >
                                    {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext(),
                                    )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow key={row.id} className="hover:bg-muted/20">
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext(),
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
