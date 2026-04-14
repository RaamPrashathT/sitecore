import { flexRender } from "@tanstack/react-table";
import type { Table as ReactTableType } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useMembership } from "@/hooks/useMembership";
import type { CatalogueItemType } from "../hooks/useCatalogue";

interface CatalogueDataTableProps {
    table: ReactTableType<CatalogueItemType>;
}

const CatalogueDataTable = ({ table }: CatalogueDataTableProps) => {
    const navigate = useNavigate();
    const { data: membership } = useMembership();
    const rows = table.getRowModel().rows;

    const handleRowClick = (catalogueId: string) => {
        if (!membership) return;
        navigate(`/${membership.slug}/catalogue/${catalogueId}/dashboard`);
    };

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
                    {rows.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={table.getAllColumns().length}
                                className="h-32 text-center font-sans text-sm text-muted-foreground"
                            >
                                No catalogue items found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        rows.map((row) => (
                            <TableRow
                                key={row.id}
                                onClick={() => handleRowClick(row.original.id)}
                                className="border-b border-border/60 cursor-pointer transition-colors hover:bg-green-50/70"
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell
                                        key={cell.id}
                                        className="p-0 align-top first:rounded-l-lg last:rounded-r-lg"
                                        onClick={
                                            // Prevent row nav when clicking the actions column
                                            cell.column.id === "actions"
                                                ? (e) => e.stopPropagation()
                                                : undefined
                                        }
                                    >
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext(),
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default CatalogueDataTable;
