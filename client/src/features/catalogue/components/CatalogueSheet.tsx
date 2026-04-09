import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetCatalogueById } from "../hooks/useCatalogue";
import { ArrowLeft, MoreVertical, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CatalogueSheetProps {
  readonly catalogueId: string | null;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export default function CatalogueSheet({
  catalogueId,
  open,
  onOpenChange,
}: CatalogueSheetProps) {
  const { data, isLoading } = useGetCatalogueById(catalogueId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-[50vw]">
        {isLoading && (
          <div className="space-y-6 p-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}
        {!isLoading && data?.data && (
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-border bg-background">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => onOpenChange(false)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <h1 className="font-display text-xl font-bold  tracking-tight text-foreground">
                    Catalogue Details
                  </h1>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-8 px-6 py-8">
              {/* Section 1: Item Header */}
              <section className="flex flex-col gap-3">
                <h2 className="truncate font-display text-4xl font-bold italic leading-tight tracking-tight text-foreground">
                  {data.data.name}
                </h2>
                <p className="font-sans text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Category: {data.data.category.toLowerCase().replace("_", " ")} | Unit:{" "}
                  {data.data.unit}
                </p>
              </section>

              {/* Section 2: Item Details */}
              <section className="rounded-lg border-l-4 border-green-700/20 bg-muted/30 p-5">
                <div className="grid grid-cols-1 gap-y-3">
                  <div className="flex flex-col">
                    <span className="mb-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Default Lead Time
                    </span>
                    <span className="font-sans text-sm font-medium text-foreground">
                      {data.data.defaultLeadTime} days
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="mb-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Created On
                    </span>
                    <span className="font-mono text-sm font-medium text-foreground">
                      {new Date(data.data.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                </div>
              </section>

              {/* Section 3: Pricing History */}
              <section className="flex flex-col gap-4">
                <h3 className="border-b border-border pb-2 font-display text-2xl font-bold  text-foreground">
                  Pricing History
                </h3>
                {data.data.supplierQuotes.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {data.data.supplierQuotes.map((quote) => {
                      const isCurrent = !quote.validUntil;
                      return (
                        <div
                          key={quote.id}
                          className={`rounded-xl border p-4 shadow-sm ${
                            isCurrent
                              ? "border-green-700/10 bg-background"
                              : "border-border/50 bg-muted/30"
                          }`}
                        >
                          <div className="mb-3 flex items-start justify-between">
                            <div className="flex flex-col gap-1">
                              <h4
                                className={`font-sans text-sm font-bold ${
                                  isCurrent ? "text-foreground" : "text-muted-foreground"
                                }`}
                              >
                                {quote.supplier.name}
                              </h4>
                              {isCurrent ? (
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-green-700" />
                                  <span className="font-sans text-[10px] font-bold uppercase tracking-tighter text-green-700">
                                    Current
                                  </span>
                                </div>
                              ) : (
                                <span className="inline-flex w-fit rounded-sm bg-muted px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">
                                  Expired
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col items-end">
                              <span
                                className={`font-mono text-lg font-bold ${
                                  isCurrent ? "text-green-700" : "text-muted-foreground/60"
                                }`}
                              >
                                ₹
                                {Number.parseFloat(quote.truePrice).toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                              <span className="font-sans text-[9px] font-medium text-muted-foreground">
                                Per Unit
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 border-t border-border/20 pt-3">
                            <div className="flex flex-col">
                              <span className="font-sans text-[9px] font-bold uppercase text-muted-foreground">
                                Lead Time
                              </span>
                              <span
                                className={`font-sans text-[11px] font-semibold ${
                                  isCurrent ? "text-foreground" : "text-muted-foreground/70"
                                }`}
                              >
                                {quote.leadTimeDays} Days
                              </span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="font-sans text-[9px] font-bold uppercase text-muted-foreground">
                                Quote Date
                              </span>
                              <span
                                className={`font-mono text-[11px] font-medium ${
                                  isCurrent ? "text-foreground" : "text-muted-foreground/70"
                                }`}
                              >
                                {new Date(quote.createdAt).toLocaleDateString("en-IN")}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="rounded-lg border border-dashed border-border p-6 text-center font-display text-sm text-muted-foreground">
                    No pricing history available
                  </p>
                )}
              </section>

              {/* Section 4: Warehouse Breakdown */}
              {data.data.inventoryItems.length > 0 && (
                <section className="flex flex-col gap-4">
                  <h3 className="border-b border-border pb-2 font-display text-2xl font-bold  text-foreground">
                    Warehouse Breakdown
                  </h3>
                  <div className="flex flex-col gap-3">
                    {data.data.inventoryItems.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-border/50 bg-muted/30 p-4 shadow-sm"
                      >
                        <div className="mb-3">
                          <h4 className="font-sans text-sm font-bold text-foreground">
                            {item.location.name}
                          </h4>
                          <span className="mt-1 inline-flex rounded-sm bg-muted px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">
                            {item.location.type.toLowerCase()}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 border-t border-border/20 pt-3">
                          <div className="flex flex-col">
                            <span className="font-sans text-[9px] font-bold uppercase text-muted-foreground">
                              Quantity on Hand
                            </span>
                            <span className="font-mono text-[11px] font-semibold text-foreground">
                              {Number.parseFloat(item.quantityOnHand).toLocaleString("en-IN")}{" "}
                              {data.data.unit}
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="font-sans text-[9px] font-bold uppercase text-muted-foreground">
                              Avg Unit Cost
                            </span>
                            <span className="font-mono text-[11px] font-semibold text-foreground">
                              ₹
                              {Number.parseFloat(item.averageUnitCost).toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Section 5: Log Details */}
              <section className="border-t border-border pt-4">
                <h4 className="mb-4 font-sans text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Log Details
                </h4>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={data.data.creator?.profileImage}
                      alt={data.data.creator?.username}
                    />
                    <AvatarFallback className="bg-green-700/10 font-sans text-xs font-bold text-green-700">
                      {data.data.creator?.username
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2) || "NA"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-sans text-sm font-semibold text-foreground">
                      {data.data.creator?.username || "Unknown"}
                    </span>
                    <span className="font-sans text-[10px] font-medium uppercase tracking-tight text-muted-foreground">
                      Created on {new Date(data.data.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
