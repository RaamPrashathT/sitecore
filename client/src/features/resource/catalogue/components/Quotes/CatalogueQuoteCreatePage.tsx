/* eslint-disable react-hooks/incompatible-library */
import type { ComponentProps } from "react";
import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    Field,
    FieldContent,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
    useCreateQuote,
    useCreateSupplier,
    useGetSuppliers,
    useGetSupplierQuotesByCatalogue,
    type Supplier,
} from "../../hooks/useSupplierQuotes";
import {
    supplierQuoteFormSchema,
    type SupplierQuoteFormInput,
    type SupplierQuoteFormValues,
} from "../../schema/supplierQuoteForm.schema";

const NEW_SUPPLIER_VALUE = "__new_supplier__";

export default function CatalogueQuoteCreatePage() {
    const navigate = useNavigate();
    const { orgSlug, catalogueId } = useParams<{
        orgSlug: string;
        catalogueId: string;
    }>();
    const suppliersQuery = useGetSuppliers();
    const existingQuotesQuery = useGetSupplierQuotesByCatalogue();
    const createSupplier = useCreateSupplier();
    const createQuote = useCreateQuote();
    const [isSupplierOpen, setIsSupplierOpen] = useState(false);

    const existingSupplierIds = useMemo(
        () => new Set((existingQuotesQuery.data?.data ?? []).map((q) => q.supplierId)),
        [existingQuotesQuery.data?.data],
    );

    const suppliers = useMemo(
        () => (suppliersQuery.data?.data ?? []).filter((s) => !existingSupplierIds.has(s.id)),
        [suppliersQuery.data?.data, existingSupplierIds],
    );
    const form = useForm<SupplierQuoteFormInput, undefined, SupplierQuoteFormValues>({
        resolver: zodResolver(supplierQuoteFormSchema),
        defaultValues: {
            supplierMode: "existing",
            supplierId: "",
            name: "",
            email: "",
            phone: "",
            contactPerson: "",
            address: "",
            truePrice: undefined,
            standardRate: undefined,
            leadTime: "",
        },
    });

    const supplierMode = form.watch("supplierMode");
    const supplierId = form.watch("supplierId");
    const selectedSupplier = useMemo(
        () => suppliers.find((supplier) => supplier.id === supplierId) ?? null,
        [supplierId, suppliers],
    );
    const isPending = createSupplier.isPending || createQuote.isPending;

    async function onSubmit(values: SupplierQuoteFormValues) {
        let quoteSupplierId = values.supplierId ?? "";

        if (values.supplierMode === "new") {
            const supplier = await createSupplier.mutateAsync({
                name: values.name?.trim() ?? "",
                email: values.email?.trim() ?? null,
                phone: values.phone?.trim() ?? null,
                contactPerson: values.contactPerson ?? null,
                address: values.address ?? null,
            });
            quoteSupplierId = supplier.data.id;
        }

        await createQuote.mutateAsync({
            catalogueId: catalogueId ?? "",
            supplierId: quoteSupplierId,
            truePrice: values.truePrice,
            standardRate: values.standardRate,
            ...(values.leadTime !== undefined && { leadTime: values.leadTime }),
        });

        navigate(`/${orgSlug}/catalogue/${catalogueId}/quotes`);
    }

    if (suppliersQuery.isLoading) return <CreateQuoteSkeleton />;

    return (
        <div className="max-w-4xl space-y-6">
            <div className="flex flex-col gap-3 border-b border-border pb-5">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Supplier quote
                    </p>
                    <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                        Add supplier quote
                    </h2>
                </div>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                    Select an existing supplier or create a new supplier before recording rates for this catalogue item.
                </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
                <FieldSet>
                    <FieldLegend>Supplier</FieldLegend>
                    <FieldGroup className="gap-4">
                        <Field data-invalid={Boolean(form.formState.errors.supplierId)}>
                            <FieldLabel>
                                Select supplier <RequiredMark />
                            </FieldLabel>
                            <Popover
                                open={isSupplierOpen}
                                onOpenChange={setIsSupplierOpen}
                            >
                                <PopoverTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={isSupplierOpen}
                                        className="h-9 justify-between font-normal"
                                    >
                                        <span className="truncate">
                                            {supplierMode === "new"
                                                ? "Add new supplier"
                                                : selectedSupplier?.name ?? "Select supplier"}
                                        </span>
                                        <ChevronsUpDown className="size-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    align="start"
                                    className="w-[--radix-popover-trigger-width] p-0"
                                >
                                    <Command>
                                        <CommandInput placeholder="Search suppliers..." />
                                        <CommandList>
                                            <CommandItem
                                                value={NEW_SUPPLIER_VALUE}
                                                onSelect={() => {
                                                    form.setValue("supplierMode", "new", {
                                                        shouldDirty: true,
                                                        shouldValidate: true,
                                                    });
                                                    form.setValue("supplierId", "", {
                                                        shouldDirty: true,
                                                        shouldValidate: true,
                                                    });
                                                    setIsSupplierOpen(false);
                                                }}
                                            >
                                                <Plus className="size-4" />
                                                Add new supplier
                                            </CommandItem>
                                            <CommandSeparator />
                                            <CommandEmpty>No suppliers found.</CommandEmpty>
                                            <CommandGroup>
                                                {suppliers.map((supplier) => (
                                                    <SupplierCommandItem
                                                        key={supplier.id}
                                                        supplier={supplier}
                                                        isSelected={supplier.id === supplierId}
                                                        onSelect={() => {
                                                            form.setValue(
                                                                "supplierMode",
                                                                "existing",
                                                                {
                                                                    shouldDirty: true,
                                                                    shouldValidate: true,
                                                                },
                                                            );
                                                            form.setValue(
                                                                "supplierId",
                                                                supplier.id,
                                                                {
                                                                    shouldDirty: true,
                                                                    shouldValidate: true,
                                                                },
                                                            );
                                                            setIsSupplierOpen(false);
                                                        }}
                                                    />
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <FieldError errors={[form.formState.errors.supplierId]} />
                        </Field>

                        {selectedSupplier && supplierMode === "existing" && (
                            <SupplierSummary supplier={selectedSupplier} />
                        )}
                    </FieldGroup>
                </FieldSet>

                {supplierMode === "new" && (
                    <FieldSet>
                        <FieldLegend>New supplier details</FieldLegend>
                        <FieldGroup className="grid gap-4 md:grid-cols-2">
                            <TextField
                                label="Name"
                                required
                                error={form.formState.errors.name?.message}
                                {...form.register("name")}
                            />
                            <TextField
                                label="Email"
                                type="email"
                                required
                                error={form.formState.errors.email?.message}
                                {...form.register("email")}
                            />
                            <TextField
                                label="Contact person"
                                error={form.formState.errors.contactPerson?.message}
                                {...form.register("contactPerson")}
                            />
                            <TextField
                                label="Phone"
                                required
                                error={form.formState.errors.phone?.message}
                                {...form.register("phone")}
                            />
                            <Field className="md:col-span-2">
                                <FieldLabel>Address</FieldLabel>
                                <Textarea
                                    rows={3}
                                    placeholder="Supplier address"
                                    {...form.register("address")}
                                />
                            </Field>
                        </FieldGroup>
                    </FieldSet>
                )}

                <FieldSet>
                    <FieldLegend>Quote details</FieldLegend>
                    <FieldGroup className="grid gap-4 md:grid-cols-2">
                        <TextField
                            label="True price"
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            error={form.formState.errors.truePrice?.message}
                            {...form.register("truePrice")}
                        />
                        <TextField
                            label="Standard rate"
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            error={form.formState.errors.standardRate?.message}
                            {...form.register("standardRate")}
                        />
                        <TextField
                            label="Lead time"
                            type="number"
                            min="0"
                            step="1"
                            error={form.formState.errors.leadTime?.message}
                            {...form.register("leadTime")}
                        />
                    </FieldGroup>
                </FieldSet>

                <div className="flex items-center justify-end gap-2 border-t border-border pt-5">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() =>
                            navigate(`/${orgSlug}/catalogue/${catalogueId}/quotes`)
                        }
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? "Creating quote..." : "Create quote"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

function SupplierCommandItem({
    supplier,
    isSelected,
    onSelect,
}: {
    supplier: Supplier;
    isSelected: boolean;
    onSelect: () => void;
}) {
    return (
        <CommandItem
            value={`${supplier.name} ${supplier.email ?? ""} ${supplier.phone ?? ""}`}
            onSelect={onSelect}
            className="items-start"
        >
            <Check
                className={cn("mt-0.5 size-4", isSelected ? "opacity-100" : "opacity-0")}
            />
            <div className="min-w-0 space-y-0.5">
                <p className="truncate text-sm font-medium text-foreground">
                    {supplier.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                    {[supplier.email, supplier.phone].filter(Boolean).join(" | ") ||
                        "No contact details"}
                </p>
            </div>
        </CommandItem>
    );
}

function SupplierSummary({ supplier }: { supplier: Supplier }) {
    return (
        <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2">
            <SummaryCell label="Email" value={supplier.email ?? "-"} />
            <SummaryCell label="Phone" value={supplier.phone ?? "-"} />
            <SummaryCell label="Contact" value={supplier.contactPerson ?? "-"} />
            <SummaryCell label="Address" value={supplier.address ?? "-"} />
        </div>
    );
}

function SummaryCell({ label, value }: { label: string; value: string }) {
    return (
        <div className="min-w-0 bg-background px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {label}
            </p>
            <p className="mt-0.5 truncate text-sm text-foreground">{value}</p>
        </div>
    );
}

function TextField({
    label,
    required = false,
    error,
    ...props
}: ComponentProps<typeof Input> & {
    label: string;
    required?: boolean;
    error?: string;
}) {
    return (
        <Field data-invalid={Boolean(error)}>
            <FieldLabel>
                {label} {required && <RequiredMark />}
            </FieldLabel>
            <FieldContent>
                <Input aria-invalid={Boolean(error)} {...props} />
                <FieldError>{error}</FieldError>
            </FieldContent>
        </Field>
    );
}

function RequiredMark() {
    return <span className="text-destructive">*</span>;
}

function CreateQuoteSkeleton() {
    return (
        <div className="max-w-4xl space-y-6">
            <div className="space-y-2 border-b border-border pb-5">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-20 w-full" />
            <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        </div>
    );
}
