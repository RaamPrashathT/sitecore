import { createColumnHelper } from "@tanstack/react-table";
import type { CatalogueItem } from "../hooks/useCatalogue";

const columnHelper = createColumnHelper<CatalogueItem>();

export const catalogueColumns = [
  columnHelper.display({
    id: "item",
    header: "Item Name",
    size: 300,
    cell: ({ row }) => {
      const item = row.original;

      return (
        <div className="flex h-full min-h-14 w-[300px] items-center px-4">
          <span className="font-sans text-sm font-medium text-foreground">
            {item.name}
          </span>
        </div>
      );
    },
  }),

  columnHelper.accessor("category", {
    header: "Category",
    size: 200,
    cell: (info) => (
      <div className="flex h-full min-h-14 w-[200px] items-center px-4 font-display text-sm capitalize text-muted-foreground">
        {info.getValue().toLowerCase().replace("_", " ")}
      </div>
    ),
  }),

  columnHelper.display({
    id: "truePrice",
    header: "True Price",
    size: 180,
    cell: ({ row }) => {
      const item = row.original;
      const currentQuote = item.supplierQuotes.find((q) => !q.validUntil);
      const price = currentQuote ? Number.parseFloat(currentQuote.truePrice) : 0;

      return (
        <div className="flex h-full min-h-14 w-[180px] items-center px-4 font-mono text-sm tabular-nums text-foreground">
          ₹{price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}/{item.unit}
        </div>
      );
    },
  }),

  columnHelper.display({
    id: "standardRate",
    header: "Standard Rate",
    size: 180,
    cell: ({ row }) => {
      const item = row.original;
      const currentQuote = item.supplierQuotes.find((q) => !q.validUntil);
      const rate = currentQuote ? Number.parseFloat(currentQuote.standardRate) : 0;

      return (
        <div className="flex h-full min-h-14 w-[180px] items-center px-4 font-mono text-sm tabular-nums text-muted-foreground">
          ₹{rate.toLocaleString("en-IN", { minimumFractionDigits: 2 })}/{item.unit}
        </div>
      );
    },
  }),

  columnHelper.display({
    id: "stock",
    header: "Stock",
    size: 150,
    cell: ({ row }) => {
      const item = row.original;
      const totalStock = item.inventoryItems.reduce(
        (sum, inv) => sum + Number.parseFloat(inv.quantityOnHand),
        0
      );

      return (
        <div className="flex h-full min-h-14 w-[150px] items-center px-4 font-mono text-sm tabular-nums text-muted-foreground">
          {totalStock} {item.unit}
        </div>
      );
    },
  }),
];
