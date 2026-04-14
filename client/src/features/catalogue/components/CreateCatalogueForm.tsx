import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import z from "zod";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useMembership } from "@/hooks/useMembership";
import { useCreateCatalogue } from "../hooks/useCatalogue";

const UNITS = [
    "NOS", "BAG", "ROLL", "BUNDLE", "SET", "PAIR",
    "KG", "MT", "QUINTAL", "CUM", "CFT", "LITRE",
    "SQM", "SQFT", "RMT", "RFT",
    "DAY", "HOUR", "MONTH", "TRIP", "LS",
];

const formSchema = z.object({
    name: z.string().min(1, "Item name is required"),
    category: z.enum(["MATERIALS", "LABOUR", "EQUIPMENT", "SUBCONTRACTORS", "TRANSPORT", "OVERHEAD"]),
    unit: z.string().min(1, "Unit is required"),
});

type FormValues = z.infer<typeof formSchema>;

const CreateCatalogueForm = () => {
    const navigate = useNavigate();
    const { data: membership } = useMembership();
    const createMutation = useCreateCatalogue();

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: "", unit: "" },
    });

    const onSubmit = (data: FormValues) => {
        createMutation.mutate(data, {
            onSuccess: () => { navigate(`/${membership?.slug}/catalogue`); },
        });
    };

    return (
        <div className="flex items-center justify-center px-4 py-2 font-sans mt-5">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-2xl p-6 md:p-8"
            >
                <h1 className="mb-8 border-b border-border/70 pb-4 font-display text-3xl font-normal tracking-wide text-foreground">
                    Create Catalogue Item
                </h1>

                <FieldGroup className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Field className="md:col-span-2">
                        <FieldLabel className="font-sans text-sm text-muted-foreground">
                            Item Name
                        </FieldLabel>
                        <Input
                            {...register("name")}
                            placeholder="e.g. Portland Cement"
                            className="font-sans text-sm"
                        />
                        {errors.name && <FieldError>{errors.name.message}</FieldError>}
                    </Field>

                    <Field>
                        <FieldLabel className="font-sans text-sm text-muted-foreground">
                            Category
                        </FieldLabel>
                        <Controller
                            name="category"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="font-sans text-sm">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="MATERIALS">Materials</SelectItem>
                                            <SelectItem value="LABOUR">Labour</SelectItem>
                                            <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                                            <SelectItem value="SUBCONTRACTORS">Subcontractors</SelectItem>
                                            <SelectItem value="TRANSPORT">Transport</SelectItem>
                                            <SelectItem value="OVERHEAD">Overhead</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.category && <FieldError>{errors.category.message}</FieldError>}
                    </Field>

                    <Field>
                        <FieldLabel className="font-sans text-sm text-muted-foreground">
                            Unit of Measure
                        </FieldLabel>
                        <Controller
                            name="unit"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="font-sans text-sm">
                                        <SelectValue placeholder="Select unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {UNITS.map((u) => (
                                                <SelectItem key={u} value={u}>
                                                    {u}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.unit && <FieldError>{errors.unit.message}</FieldError>}
                    </Field>
                </FieldGroup>

                {createMutation.error && (
                    <p className="mt-4 font-sans text-sm text-red-500">
                        {createMutation.error instanceof Error
                            ? createMutation.error.message
                            : "Something went wrong"}
                    </p>
                )}

                <div className="mt-8 flex justify-end">
                    <Button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="h-10 w-48 bg-green-700 font-sans text-sm text-white hover:bg-green-800 disabled:opacity-50"
                    >
                        {createMutation.isPending && <Spinner />}
                        {createMutation.isPending ? "Creating..." : "Create Item"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateCatalogueForm;
