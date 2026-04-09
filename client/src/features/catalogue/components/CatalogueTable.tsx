import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useGetCatalogues } from "../hooks/useCatalogue";
import { catalogueColumns } from "./CatalogueColumn";
import CatalogueSheet from "./CatalogueSheet";
import { Skeleton } from "@/components/ui/skeleton";

export default function CatalogueTable() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(10);
  const [selectedCatalogueId, setSelectedCatalogueId] = useState<string | null>(null);

  const { data, isLoading } = useGetCatalogues(pageIndex, pageSize);

  const table = useReactTable({
    data: data?.data ?? [],
    columns: catalogueColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.meta.totalPages ?? 0,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b border-border bg-muted/40 hover:bg-muted/40"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() }}
                    className="h-12 px-4 font-sans text-sm font-semibold text-foreground"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer border-b border-border/60 transition-colors hover:bg-green-50/70"
                  onClick={() => setSelectedCatalogueId(row.original.id)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="p-0">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={catalogueColumns.length}
                  className="h-24 text-center font-display text-muted-foreground"
                >
                  No catalogue items found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="font-display text-sm text-muted-foreground">
            Page {pageIndex + 1} of {data.meta.totalPages} ({data.meta.total} items)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
              disabled={pageIndex === 0}
              className="font-sans"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageIndex((prev) => prev + 1)}
              disabled={pageIndex >= data.meta.totalPages - 1}
              className="font-sans"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <CatalogueSheet
        catalogueId={selectedCatalogueId}
        open={!!selectedCatalogueId}
        onOpenChange={(open) => !open && setSelectedCatalogueId(null)}
      />
    </div>
  );
}
