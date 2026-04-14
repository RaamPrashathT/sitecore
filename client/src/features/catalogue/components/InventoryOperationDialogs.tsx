import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { ArrowDownToLine, ArrowUpFromLine, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useGetInventoryLocations } from "../hooks/useInventoryLocation";
import {
    useReceiveMaterial,
    useConsumeMaterial,
    useAdjustMaterial,
} from "../hooks/useInventory";

// ─── Shared location selector ─────────────────────────────────────────────────

function LocationSelect({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    const { data: locations = [] } = useGetInventoryLocations();
    return (
        <Select onValueChange={onChange} value={value}>
            <SelectTrigger className="font-sans text-sm">
                <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    {locations.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                            {l.name}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}// ─── Receive Material ─────────────────────────────────────────────────────────

const receiveSchema = z.object({
    locationId: z.string().uuid("Select a location"),
    quantity: z.coerce.number().positive("Must be > 0"),
    unitCost: z.coerce.number().positive("Must be > 0").optional(),
    notes: z.string().optional(),
});
type ReceiveValues = z.infer<typeof receiveSchema>;

export function ReceiveMaterialDialog({ catalogueId }: { catalogueId: string }) {
    const [open, setOpen] = useState(false);
    const mutation = useReceiveMaterial();

    const { register, control, handleSubmit, reset, formState: { errors } } =
        useForm<ReceiveValues>({ resolver: zodResolver(receiveSchema) });

    const onSubmit = (data: ReceiveValues) => {
        const handleSuccess = () => { reset(); setOpen(false); };
        mutation.mutate({ ...data, catalogueId }, { onSuccess: handleSuccess });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="bg-green-700 text-white hover:bg-green-800 gap-1.5 font-sans text-sm">
                    <ArrowDownToLine className="size-4" />
                    Receive
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-display font-normal tracking-wide">
                        Receive Material
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <FieldGroup className="grid grid-cols-1 gap-4">
                        <Field>
                            <FieldLabel className="font-sans text-sm text-muted-foreground">Location</FieldLabel>
                            <Controller
                                name="locationId"
                                control={control}
                                render={({ field }) => (
                                    <LocationSelect value={field.value ?? ""} onChange={field.onChange} />
                                )}
                            />
                            {errors.locationId && <FieldError>{errors.locationId.message}</FieldError>}
                        </Field>
                        <Field>
                            <FieldLabel className="font-sans text-sm text-muted-foreground">Quantity</FieldLabel>
                            <Input type="number" step="any" {...register("quantity")} className="font-mono text-sm tabular-nums" />
                            {errors.quantity && <FieldError>{errors.quantity.message}</FieldError>}
                        </Field>
                        <Field>
                            <FieldLabel className="font-sans text-sm text-muted-foreground">Unit Cost (optional)</FieldLabel>
                            <Input type="number" step="any" {...register("unitCost")} className="font-mono text-sm tabular-nums" />
                            {errors.unitCost && <FieldError>{errors.unitCost.message}</FieldError>}
                        </Field>
                        <Field>
                            <FieldLabel className="font-sans text-sm text-muted-foreground">Notes (optional)</FieldLabel>
                            <Input {...register("notes")} className="font-sans text-sm" />
                        </Field>
                    </FieldGroup>
                    {mutation.error && (
                        <p className="mt-3 font-sans text-sm text-red-500">
                            {mutation.error instanceof Error ? mutation.error.message : "Failed"}
                        </p>
                    )}
                    <DialogFooter className="mt-5">
                        <Button
                            type="submit"
                            disabled={mutation.isPending}
                            className="bg-green-700 font-sans text-sm text-white hover:bg-green-800 disabled:opacity-50"
                        >
                            {mutation.isPending && <Spinner />}
                            {mutation.isPending ? "Saving..." : "Confirm Receive"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Consume Material ─────────────────────────────────────────────────────────

const consumeSchema = z.object({
    locationId: z.string().uuid("Select a location"),
    quantity: z.coerce.number().positive("Must be > 0"),
    phaseId: z.string().uuid("Phase ID is required"),
    notes: z.string().optional(),
});
type ConsumeValues = z.infer<typeof consumeSchema>;

export function ConsumeMaterialDialog({ catalogueId }: { catalogueId: string }) {
    const [open, setOpen] = useState(false);
    const mutation = useConsumeMaterial();

    const { register, control, handleSubmit, reset, formState: { errors } } =
        useForm<ConsumeValues>({ resolver: zodResolver(consumeSchema) });

    const onSubmit = (data: ConsumeValues) => {
        const handleSuccess = () => { reset(); setOpen(false); };
        mutation.mutate({ ...data, catalogueId }, { onSuccess: handleSuccess });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5 font-sans text-sm">
                    <ArrowUpFromLine className="size-4" />
                    Consume
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-display font-normal tracking-wide">
                        Consume Material
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <FieldGroup className="grid grid-cols-1 gap-4">
                        <Field>
                            <FieldLabel className="font-sans text-sm text-muted-foreground">Location</FieldLabel>
                            <Controller
                                name="locationId"
                                control={control}
                                render={({ field }) => (
                                    <LocationSelect value={field.value ?? ""} onChange={field.onChange} />
                                )}
                            />
                            {errors.locationId && <FieldError>{errors.locationId.message}</FieldError>}
                        </Field>
                        <Field>
                            <FieldLabel className="font-sans text-sm text-muted-foreground">Quantity</FieldLabel>
                            <Input type="number" step="any" {...register("quantity")} className="font-mono text-sm tabular-nums" />
                            {errors.quantity && <FieldError>{errors.quantity.message}</FieldError>}
                        </Field>
                        <Field>
                            <FieldLabel className="font-sans text-sm text-muted-foreground">Phase ID</FieldLabel>
                            <Input {...register("phaseId")} placeholder="UUID of the phase" className="font-mono text-sm" />
                            {errors.phaseId && <FieldError>{errors.phaseId.message}</FieldError>}
                        </Field>
                        <Field>
                            <FieldLabel className="font-sans text-sm text-muted-foreground">Notes (optional)</FieldLabel>
                            <Input {...register("notes")} className="font-sans text-sm" />
                        </Field>
                    </FieldGroup>
                    {mutation.error && (
                        <p className="mt-3 font-sans text-sm text-red-500">
                            {mutation.error instanceof Error ? mutation.error.message : "Failed"}
                        </p>
                    )}
                    <DialogFooter className="mt-5">
                        <Button
                            type="submit"
                            disabled={mutation.isPending}
                            className="bg-green-700 font-sans text-sm text-white hover:bg-green-800 disabled:opacity-50"
                        >
                            {mutation.isPending && <Spinner />}
                            {mutation.isPending ? "Saving..." : "Confirm Consume"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Adjust Stock ─────────────────────────────────────────────────────────────

const adjustSchema = z.object({
    locationId: z.string().uuid("Select a location"),
    quantity: z.coerce.number({ error: "Must be a number" }),
    notes: z.string().min(1, "Notes are required for adjustments"),
});
type AdjustValues = z.infer<typeof adjustSchema>;

export function AdjustStockDialog({ catalogueId }: { catalogueId: string }) {
    const [open, setOpen] = useState(false);
    const mutation = useAdjustMaterial();

    const { register, control, handleSubmit, reset, formState: { errors } } =
        useForm<AdjustValues>({ resolver: zodResolver(adjustSchema) });

    const onSubmit = (data: AdjustValues) => {
        const handleSuccess = () => { reset(); setOpen(false); };
        mutation.mutate({ ...data, catalogueId }, { onSuccess: handleSuccess });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5 font-sans text-sm">
                    <SlidersHorizontal className="size-4" />
                    Adjust
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-display font-normal tracking-wide">
                        Adjust Stock
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <FieldGroup className="grid grid-cols-1 gap-4">
                        <Field>
                            <FieldLabel className="font-sans text-sm text-muted-foreground">Location</FieldLabel>
                            <Controller
                                name="locationId"
                                control={control}
                                render={({ field }) => (
                                    <LocationSelect value={field.value ?? ""} onChange={field.onChange} />
                                )}
                            />
                            {errors.locationId && <FieldError>{errors.locationId.message}</FieldError>}
                        </Field>
                        <Field>
                            <FieldLabel className="font-sans text-sm text-muted-foreground">
                                Quantity Change <span className="text-xs text-muted-foreground/70">(negative to reduce)</span>
                            </FieldLabel>
                            <Input type="number" step="any" {...register("quantity")} className="font-mono text-sm tabular-nums" />
                            {errors.quantity && <FieldError>{errors.quantity.message}</FieldError>}
                        </Field>
                        <Field>
                            <FieldLabel className="font-sans text-sm text-muted-foreground">Notes (required)</FieldLabel>
                            <Input {...register("notes")} className="font-sans text-sm" />
                            {errors.notes && <FieldError>{errors.notes.message}</FieldError>}
                        </Field>
                    </FieldGroup>
                    {mutation.error && (
                        <p className="mt-3 font-sans text-sm text-red-500">
                            {mutation.error instanceof Error ? mutation.error.message : "Failed"}
                        </p>
                    )}
                    <DialogFooter className="mt-5">
                        <Button
                            type="submit"
                            disabled={mutation.isPending}
                            className="bg-green-700 font-sans text-sm text-white hover:bg-green-800 disabled:opacity-50"
                        >
                            {mutation.isPending && <Spinner />}
                            {mutation.isPending ? "Saving..." : "Confirm Adjustment"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
