import { memo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Edit, MapPin, Plus, Trash, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
    useGetInventoryLocations,
    useCreateInventoryLocation,
    useEditInventoryLocation,
    useDeleteInventoryLocation,
} from "../hooks/useInventoryLocation";
import type { InventoryLocationType } from "../hooks/useInventoryLocation";

// ─── Schema ───────────────────────────────────────────────────────────────────

const locationSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.string().min(1, "Type is required"),
});

type LocationFormValues = z.infer<typeof locationSchema>;

// ─── Inline edit row ──────────────────────────────────────────────────────────

interface EditRowProps {
    location: InventoryLocationType;
    onCancel: () => void;
}

const EditRow = memo(({ location, onCancel }: EditRowProps) => {
    const editMutation = useEditInventoryLocation();

    const { register, handleSubmit, formState: { errors } } = useForm<LocationFormValues>({
        resolver: zodResolver(locationSchema),
        defaultValues: { name: location.name, type: location.type },
    });

    const onSubmit = (data: LocationFormValues) => {
        editMutation.mutate(
            { locationId: location.id, ...data },
            { onSuccess: onCancel },
        );
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border border-green-200 bg-green-50/40 p-3">
            <FieldGroup className="grid grid-cols-2 gap-3">
                <Field>
                    <FieldLabel className="font-sans text-xs text-muted-foreground">Name</FieldLabel>
                    <Input {...register("name")} className="h-8 font-sans text-sm" />
                    {errors.name && <FieldError>{errors.name.message}</FieldError>}
                </Field>
                <Field>
                    <FieldLabel className="font-sans text-xs text-muted-foreground">Type</FieldLabel>
                    <Input {...register("type")} placeholder="e.g. Warehouse, Site" className="h-8 font-sans text-sm" />
                    {errors.type && <FieldError>{errors.type.message}</FieldError>}
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

// ─── Location row ─────────────────────────────────────────────────────────────

const LocationRow = memo(({ location }: { location: InventoryLocationType }) => {
    const [editing, setEditing] = useState(false);
    const deleteMutation = useDeleteInventoryLocation();

    if (editing) {
        return <EditRow location={location} onCancel={() => setEditing(false)} />;
    }

    return (
        <div className="flex items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-2 min-w-0">
                <MapPin className="size-4 shrink-0 text-muted-foreground/60" />
                <div className="flex flex-col min-w-0">
                    <span className="font-sans text-sm font-medium text-foreground truncate">
                        {location.name}
                    </span>
                    <span className="font-sans text-xs text-muted-foreground capitalize">
                        {location.type}
                    </span>
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
                    onClick={() => deleteMutation.mutate(location.id)}
                    className="h-8 px-2 text-red-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                >
                    {deleteMutation.isPending ? <Spinner /> : <Trash className="size-4" />}
                </Button>
            </div>
        </div>
    );
});
LocationRow.displayName = "LocationRow";

// ─── Create form ──────────────────────────────────────────────────────────────

const CreateForm = memo(({ onCancel }: { onCancel: () => void }) => {
    const createMutation = useCreateInventoryLocation();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<LocationFormValues>({
        resolver: zodResolver(locationSchema),
        defaultValues: { name: "", type: "" },
    });

    const onSubmit = (data: LocationFormValues) => {
        createMutation.mutate(data, {
            onSuccess: () => { reset(); onCancel(); },
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-4 rounded-lg border border-border/60 bg-muted/30 p-4">
            <p className="mb-3 font-sans text-sm font-medium text-foreground">New Location</p>
            <FieldGroup className="grid grid-cols-2 gap-3">
                <Field>
                    <FieldLabel className="font-sans text-xs text-muted-foreground">Name *</FieldLabel>
                    <Input {...register("name")} placeholder="e.g. Main Warehouse" className="font-sans text-sm" />
                    {errors.name && <FieldError>{errors.name.message}</FieldError>}
                </Field>
                <Field>
                    <FieldLabel className="font-sans text-xs text-muted-foreground">Type *</FieldLabel>
                    <Input {...register("type")} placeholder="e.g. Warehouse, Site" className="font-sans text-sm" />
                    {errors.type && <FieldError>{errors.type.message}</FieldError>}
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
                    {createMutation.isPending ? "Adding..." : "Add Location"}
                </Button>
            </div>
        </form>
    );
});
CreateForm.displayName = "CreateForm";

// ─── LocationManager ──────────────────────────────────────────────────────────

const LocationManager = memo(() => {
    const [showCreate, setShowCreate] = useState(false);
    const { data: locations = [], isLoading } = useGetInventoryLocations();

    return (
        <div className="rounded-xl border border-border/70 bg-background p-5">
            <div className="mb-3 flex items-center justify-between border-b border-border/70 pb-3">
                <h3 className="font-display text-base font-normal tracking-wide text-foreground">
                    Inventory Locations
                </h3>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreate((v) => !v)}
                    className="gap-1 font-sans text-sm"
                >
                    <Plus className="size-4" />
                    Add Location
                </Button>
            </div>

            {showCreate && <CreateForm onCancel={() => setShowCreate(false)} />}

            {(() => {
                if (isLoading) {
                    return <p className="font-sans text-sm text-muted-foreground">Loading...</p>;
                }
                if (locations.length === 0) {
                    return (
                        <p className="font-sans text-sm text-muted-foreground italic">
                            No locations yet. Add one to start tracking inventory.
                        </p>
                    );
                }
                return (
                    <div className="flex flex-col divide-y divide-border/60">
                        {locations.map((loc) => (
                            <LocationRow key={loc.id} location={loc} />
                        ))}
                    </div>
                );
            })()}
        </div>
    );
});
LocationManager.displayName = "LocationManager";

export default LocationManager;
