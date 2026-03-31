import {
    flexRender,
} from "@tanstack/react-table";
import type { Table as ReactTableType } from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { CatalogueItemType } from "../hooks/useGetCatalogues";

interface CatalogueDataTableProps {
    table: ReactTableType<CatalogueItemType>;
}

const CatalogueDataTable = ({ table }: CatalogueDataTableProps) => {
    return (
        <div className="overflow-x-auto">
            <Table className="font-sans">
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow
                            key={headerGroup.id}
                            className="border-b border-border/80 bg-muted/40"
                        >
                            {headerGroup.headers.map((header) => (
                                <TableHead
                                    key={header.id}
                                    className="h-12 px-4 font-display text-sm font-normal tracking-wide text-foreground first:rounded-l-lg last:rounded-r-lg"
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
                    {table.getRowModel().rows.map((row) => (
                        <TableRow
                            key={row.id}
                            className="border-b border-border/60 transition-colors hover:bg-green-50/70"
                        >
                            {row.getVisibleCells().map((cell) => (
                                <TableCell
                                    key={cell.id}
                                    className="p-0 align-middle first:rounded-l-lg last:rounded-r-lg"
                                >
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
};

export default CatalogueDataTable;