import { memo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Edit, Plus, Trash, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
    useGetSuppliers,
    useCreateSupplier,
    useEditSupplier,
    useDeleteSupplier,
} from "../hooks/useSupplier";
import type { SupplierType } from "../hooks/useCatalogue";
import type { CreateSupplierInput } from "../hooks/useSupplier";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const supplierSchema = z.object({
    name: z.string().min(1, "Name is required"),
    contactName: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
});

type SupplierFormValues = z.infer<typeof supplierSchema>;

// ─── Inline edit row ──────────────────────────────────────────────────────────

interface EditRowProps {
    supplier: SupplierType;
    onCancel: () => void;
}

const EditRow = memo(({ supplier, onCancel }: EditRowProps) => {
    const editMutation = useEditSupplier();

    const { register, handleSubmit, formState: { errors } } = useForm<SupplierFormValues>({
        resolver: zodResolver(supplierSchema),
        defaultValues: {
            name: supplier.name,
            contactName: supplier.contactName ?? "",
            email: supplier.email ?? "",
            phone: supplier.phone ?? "",
        },
    });

    const onSubmit = (data: SupplierFormValues) => {
        editMutation.mutate(
            { supplierId: supplier.id, ...data },
            { onSuccess: onCancel },
        );
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border border-green-200 bg-green-50/40 p-4">
            <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field>
                    <FieldLabel className="font-sans text-xs text-muted-foreground">Name</FieldLabel>
                    <Input {...register("name")} className="h-8 font-sans text-sm" />
                    {errors.name && <FieldError>{errors.name.message}</FieldError>}
                </Field>
                <Field>
                    <FieldLabel className="font-sans text-xs text-muted-foreground">Contact Name</FieldLabel>
                    <Input {...register("contactName")} className="h-8 font-sans text-sm" />
                </Field>
                <Field>
                    <FieldLabel className="font-sans text-xs text-muted-foreground">Email</FieldLabel>
                    <Input {...register("email")} type="email" className="h-8 font-sans text-sm" />
                </Field>
                <Field>
                    <FieldLabel className="font-sans text-xs text-muted-foreground">Phone</FieldLabel>
                    <Input {...register("phone")} className="h-8 font-sans text-sm" />
                </Field>
            </FieldGroup>
            {editMutation.error && (
                <p className="mt-2 font-sans text-xs text-red-500">
                    {editMutation.error instanceof Error ? editMutation.error.message : "Failed to update"}
                </p>
            )}
            <div className="mt-3 flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={onCancel} className="h-8 font-sans text-xs">
                    <X className="size-3" />
                    Cancel
                </Button>
                <Button
                    type="submit"
                    size="sm"
                    disabled={editMutation.isPending}
                    className="h-8 bg-green-700 font-sans text-xs text-white hover:bg-green-800 disabled:opacity-50"
                >
                    {editMutation.isPending ? <Spinner /> : <Check className="size-3" />}
                    {editMutation.isPending ? "Saving..." : "Save"}
                </Button>
            </div>
        </form>
    );
});
EditRow.displayName = "EditRow";

// ─── Supplier row ─────────────────────────────────────────────────────────────

interface SupplierRowProps {
    supplier: SupplierType;
}

const SupplierRow = memo(({ supplier }: SupplierRowProps) => {
    const [editing, setEditing] = useState(false);
    const deleteMutation = useDeleteSupplier();

    if (editing) {
        return <EditRow supplier={supplier} onCancel={() => setEditing(false)} />;
    }

    return (
        <div className="flex items-start justify-between gap-4 py-3">
            <div className="flex flex-col gap-0.5 min-w-0">
                <span className="font-sans text-sm font-medium text-foreground truncate">
                    {supplier.name}
                </span>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                    {supplier.contactName && (
                        <span className="font-sans text-xs text-muted-foreground">
                            {supplier.contactName}
                        </span>
                    )}
                    {supplier.email && (
                        <span className="font-sans text-xs text-muted-foreground">
                            {supplier.email}
                        </span>
                    )}
                    {supplier.phone && (
                        <span className="font-mono text-xs text-muted-foreground">
                            {supplier.phone}
                        </span>
                    )}
                    {!supplier.contactName && !supplier.email && !supplier.phone && (
                        <span className="font-sans text-xs text-muted-foreground/50 italic">
                            No contact details
                        </span>
                    )}
                </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(true)}
                    className="h-8 px-2 text-muted-foreground hover:bg-green-50 hover:text-green-700"
                >
                    <Edit className="size-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(supplier.id)}
                    className="h-8 px-2 text-red-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                >
                    {deleteMutation.isPending ? <Spinner /> : <Trash className="size-4" />}
                </Button>
            </div>
        </div>
    );
});
SupplierRow.displayName = "SupplierRow";

// ─── Create form ──────────────────────────────────────────────────────────────

interface CreateFormProps {
    onCancel: () => void;
}

const CreateForm = memo(({ onCancel }: CreateFormProps) => {
    const createMutation = useCreateSupplier();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<SupplierFormValues>({
        resolver: zodResolver(supplierSchema),
        defaultValues: { name: "", contactName: "", email: "", phone: "" },
    });

    const onSubmit = (data: CreateSupplierInput) => {
        createMutation.mutate(data, {
            onSuccess: () => { reset(); onCancel(); },
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-4 rounded-lg border border-border/60 bg-muted/30 p-4">
            <p className="mb-3 font-sans text-sm font-medium text-foreground">New Supplier</p>
            <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field className="sm:col-span-2">
                    <FieldLabel className="font-sans text-xs text-muted-foreground">Name *</FieldLabel>
                    <Input {...register("name")} placeholder="e.g. Acme Materials Ltd." className="font-sans text-sm" />
                    {errors.name && <FieldError>{errors.name.message}</FieldError>}
                </Field>
                <Field>
                    <FieldLabel className="font-sans text-xs text-muted-foreground">Contact Name</FieldLabel>
                    <Input {...register("contactName")} placeholder="Optional" className="font-sans text-sm" />
                </Field>
                <Field>
                    <FieldLabel className="font-sans text-xs text-muted-foreground">Email</FieldLabel>
                    <Input {...register("email")} type="email" placeholder="Optional" className="font-sans text-sm" />
                </Field>
                <Field>
                    <FieldLabel className="font-sans text-xs text-muted-foreground">Phone</FieldLabel>
                    <Input {...register("phone")} placeholder="Optional" className="font-sans text-sm" />
                </Field>
            </FieldGroup>
            {createMutation.error && (
                <p className="mt-2 font-sans text-sm text-red-500">
                    {createMutation.error instanceof Error ? createMutation.error.message : "Failed to create"}
                </p>
            )}
            <div className="mt-4 flex justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => { reset(); onCancel(); }}
                    className="font-sans text-sm"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    size="sm"
                    disabled={createMutation.isPending}
                    className="bg-green-700 font-sans text-sm text-white hover:bg-green-800 disabled:opacity-50"
                >
                    {createMutation.isPending && <Spinner />}
                    {createMutation.isPending ? "Adding..." : "Add Supplier"}
                </Button>
            </div>
        </form>
    );
});
CreateForm.displayName = "CreateForm";

// ─── SupplierManager ──────────────────────────────────────────────────────────

const SupplierManager = memo(() => {
    const [showCreate, setShowCreate] = useState(false);
    const { data: suppliers = [], isLoading } = useGetSuppliers();

    return (
        <div className="rounded-xl border border-border/70 bg-background p-6">
            <div className="mb-4 flex items-center justify-between border-b border-border/70 pb-3">
                <div>
                    <h2 className="font-display text-xl font-normal tracking-wide text-foreground">
                        Suppliers
                    </h2>
                    <p className="font-sans text-xs text-muted-foreground mt-0.5">
                        Org-level supplier directory. Suppliers can be linked to any catalogue item via quotes.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreate((v) => !v)}
                    className="gap-1 font-sans text-sm"
                >
                    <Plus className="size-4" />
                    Add Supplier
                </Button>
            </div>

            {showCreate && <CreateForm onCancel={() => setShowCreate(false)} />}

            {(() => {
                if (isLoading) {
                    return <p className="font-sans text-sm text-muted-foreground">Loading suppliers...</p>;
                }
                if (suppliers.length === 0) {
                    return (
                        <p className="font-sans text-sm text-muted-foreground italic">
                            No suppliers yet. Add one above.
                        </p>
                    );
                }
                return (
                    <div className="flex flex-col divide-y divide-border/60">
                        {suppliers.map((supplier) => (
                            <SupplierRow key={supplier.id} supplier={supplier} />
                        ))}
                    </div>
                );
            })()}
        </div>
    );
});
SupplierManager.displayName = "SupplierManager";

export default SupplierManager;
