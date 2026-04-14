import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useGetSuppliers } from "../hooks/useSupplier";
import {
    useGetQuotesByCatalogue,
    useCreateSupplierQuote,
    useDeleteSupplierQuote,
} from "../hooks/useSupplierQuote";

const addQuoteSchema = z.object({
    supplierId: z.string().uuid("Select a supplier"),
    truePrice: z.coerce.number().positive("Must be > 0"),
    standardRate: z.coerce.number().positive("Must be > 0"),
    leadTimeDays: z.coerce.number().int().min(0).optional(),
});

type AddQuoteValues = z.infer<typeof addQuoteSchema>;

interface QuoteManagerProps {
    catalogueId: string;
    unit: string;
}

const QuoteManager = ({ catalogueId, unit }: QuoteManagerProps) => {
    const [showForm, setShowForm] = useState(false);

    const { data: suppliers = [] } = useGetSuppliers();
    const { data: quotes = [], isLoading } = useGetQuotesByCatalogue(catalogueId);
    const createQuote = useCreateSupplierQuote();
    const deleteQuote = useDeleteSupplierQuote();

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<AddQuoteValues>({
        resolver: zodResolver(addQuoteSchema),
        defaultValues: { truePrice: 0, standardRate: 0 },
    });

    const onSubmit = (data: AddQuoteValues) => {
        createQuote.mutate(
            { ...data, catalogueId },
            {
                onSuccess: () => {
                    reset();
                    setShowForm(false);
                },
            },
        );
    };

    return (
        <div className="rounded-xl border border-border/70 bg-background p-6">
            <div className="mb-4 flex items-center justify-between border-b border-border/70 pb-3">
                <h2 className="font-display text-xl font-normal tracking-wide text-foreground">
                    Supplier Quotes
                </h2>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowForm((v) => !v)}
                    className="gap-1 font-sans text-sm"
                >
                    <Plus className="size-4" />
                    Add Quote
                </Button>
            </div>

            {/* ── Add Quote Form ── */}
            {showForm && (
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="mb-6 rounded-lg border border-border/60 bg-muted/30 p-4"
                >
                    <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field className="sm:col-span-2">
                            <FieldLabel className="font-sans text-sm text-muted-foreground">
                                Supplier
                            </FieldLabel>
                            <Controller
                                name="supplierId"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className="font-sans text-sm">
                                            <SelectValue placeholder="Select supplier" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {suppliers.map((s) => (
                                                    <SelectItem key={s.id} value={s.id}>
                                                        {s.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.supplierId && (
                                <FieldError>{errors.supplierId.message}</FieldError>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel className="font-sans text-sm text-muted-foreground">
                                True Price / {unit}
                            </FieldLabel>
                            <Input
                                type="number"
                                step="any"
                                {...register("truePrice")}
                                className="font-mono text-sm tabular-nums"
                            />
                            {errors.truePrice && (
                                <FieldError>{errors.truePrice.message}</FieldError>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel className="font-sans text-sm text-muted-foreground">
                                Standard Rate / {unit}
                            </FieldLabel>
                            <Input
                                type="number"
                                step="any"
                                {...register("standardRate")}
                                className="font-mono text-sm tabular-nums"
                            />
                            {errors.standardRate && (
                                <FieldError>{errors.standardRate.message}</FieldError>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel className="font-sans text-sm text-muted-foreground">
                                Lead Time (days)
                            </FieldLabel>
                            <Input
                                type="number"
                                step="1"
                                {...register("leadTimeDays")}
                                placeholder="Optional"
                                className="font-mono text-sm tabular-nums"
                            />
                        </Field>
                    </FieldGroup>

                    {createQuote.error && (
                        <p className="mt-2 font-sans text-sm text-red-500">
                            {createQuote.error instanceof Error
                                ? createQuote.error.message
                                : "Failed to add quote"}
                        </p>
                    )}

                    <div className="mt-4 flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => { setShowForm(false); reset(); }}
                            className="font-sans text-sm"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={createQuote.isPending}
                            className="bg-green-700 font-sans text-sm text-white hover:bg-green-800 disabled:opacity-50"
                        >
                            {createQuote.isPending && <Spinner />}
                            {createQuote.isPending ? "Adding..." : "Add Quote"}
                        </Button>
                    </div>
                </form>
            )}

            {/* ── Quotes List ── */}
            {(() => {
                if (isLoading) {
                    return <p className="font-sans text-sm text-muted-foreground">Loading quotes...</p>;
                }
                if (quotes.length === 0) {
                    return (
                        <p className="font-sans text-sm text-muted-foreground italic">
                            No supplier quotes yet. Add one above.
                        </p>
                    );
                }
                return (
                    <div className="flex flex-col divide-y divide-border/60">
                        {quotes.map((quote) => (
                            <div
                                key={quote.id}
                                className="flex items-center justify-between py-3"
                            >
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-sans text-sm font-medium text-foreground">
                                        {quote.supplier.name}
                                    </span>
                                    <span className="font-mono text-xs text-muted-foreground tabular-nums">
                                        True: {Number(quote.truePrice).toLocaleString()}/{unit} &nbsp;·&nbsp;
                                        Rate: {Number(quote.standardRate).toLocaleString()}/{unit}
                                        {quote.leadTimeDays != null && (
                                            <> &nbsp;·&nbsp; {quote.leadTimeDays}d lead</>
                                        )}
                                    </span>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    disabled={deleteQuote.isPending}
                                    onClick={() => deleteQuote.mutate(quote.id)}
                                    className="text-red-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                                >
                                    <Trash className="size-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                );
            })()}
        </div>
    );
};

export default QuoteManager;
