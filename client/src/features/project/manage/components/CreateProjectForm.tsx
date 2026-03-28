import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useClients } from "@/hooks/useClients";
import { useEngineers } from "@/hooks/useEngineers";
import api from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { LocateIcon, MapPin } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import z from "zod";

interface CreateProjectFormProps {
    readonly orgId: string;
    readonly slug: string;
}

const formSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    address: z.string().trim().min(1, "Address is required"),
    estimatedBudget: z.string().min(1, "Estimated budget is required"),
    engineerId: z.string().min(1, "Engineer is required"),
    clientId: z.string().min(1, "Client is required"),
});

type CreateProjectFormSchema = z.infer<typeof formSchema>;

const CreateProjectForm = ({ orgId, slug }: CreateProjectFormProps) => {
    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateProjectFormSchema>({
        resolver: zodResolver(formSchema),
    });

    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { data: engineers, isLoading: engineerLoading } = useEngineers(
        orgId,
        0,
        100,
    );
    const { data: clients, isLoading: clientLoading } = useClients(
        orgId,
        0,
        100,
    );

    const engineersArray = engineers?.data;
    const clientsArray = clients?.data;

    if (engineerLoading || clientLoading) return <div>Loading...</div>;

    const onSubmit = async (data: CreateProjectFormSchema) => {
        setIsLoading(true);
        setError(null);
        try {
            console.log(data);
            const response = await api.post("/project", data, {
                headers: {
                    "x-organization-id": orgId,
                },
            });

            navigate(`/${slug}/${response.data.slug}`);
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("An unexpected error occurred.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-3xl "
            >
                <h1 className="text-3xl font-semibold my-8">Create Project</h1>
                <FieldGroup className="flex flex-col gap-y-4">
                    <Field>
                        <FieldLabel className="text-lg">Project Name</FieldLabel>
                        <Input
                            {...register("name")}
                            placeholder="Project Name"
                            id="name"
                        />
                        {errors.name && (
                            <FieldError>{errors.name.message}</FieldError>
                        )}
                    </Field>
                    <Field className="w-full flex flex-col gap-y-2">
                        <div className="flex w-full flex-row justify-between">
                            <FieldLabel className="text-lg">Address</FieldLabel>
                            <Button
                                variant="ghost"
                                className="flex items-center gap-x-1 p-0 m-0 text-destructive hover:text-destructive hover:bg-transparent hover:underline hover:cursor-pointer text-md"
                                type="button"
                            >
                                <MapPin size={16} className="mt-0.5"/>
                                <span>Set Location</span>
                            </Button>
                        </div>
                        <Textarea
                            {...register("address")}
                            placeholder="Address"
                            id="address"
                        ></Textarea>
                        {errors.address && (
                            <FieldError>{errors.address.message}</FieldError>
                        )}
                    </Field>
                    <Field>
                        <FieldLabel className="text-lg">Estimated Budget</FieldLabel>
                        <Input
                            {...register("estimatedBudget")}
                            type="number"
                            placeholder="Estimated Budget"
                            id="estimatedBudget"
                        />
                        {errors.estimatedBudget && (
                            <FieldError>
                                {errors.estimatedBudget.message}
                            </FieldError>
                        )}
                    </Field>
                    <div className="flex gap-x-2">
                        <Field className="w-full">
                            <FieldLabel className="text-lg">Engineers</FieldLabel>
                            <Controller
                                name="engineerId"
                                control={control}
                                defaultValue=""
                                render={({ field }) => (
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value || undefined}
                                    >
                                        <SelectTrigger className="h-12">
                                            <SelectValue placeholder="Select an Engineer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {engineersArray &&
                                                engineersArray.length > 0 ? (
                                                    engineersArray.map(
                                                        (engineer) => (
                                                            <SelectItem
                                                                key={
                                                                    engineer.id
                                                                }
                                                                value={
                                                                    engineer.id
                                                                }
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <Avatar className="h-7 w-7">
                                                                        <AvatarFallback className="text-xs">
                                                                            {engineer.username[0].toUpperCase()}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="text-sm font-medium">
                                                                        {
                                                                            engineer.username
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </SelectItem>
                                                        ),
                                                    )
                                                ) : (
                                                    <div className="p-2 text-sm text-muted-foreground text-center">
                                                        No engineers found
                                                    </div>
                                                )}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.engineerId && (
                                <FieldError>
                                    {errors.engineerId.message}
                                </FieldError>
                            )}
                        </Field>

                        <Field className="w-full">
                            <FieldLabel className="text-lg">Clients</FieldLabel>
                            <Controller
                                name="clientId"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        key={clientsArray
                                            ?.map((e) => e.id)
                                            .join(",")}
                                        onValueChange={field.onChange}
                                        value={field.value || undefined}
                                    >
                                        <SelectTrigger className="h-12">
                                            <SelectValue placeholder="Select a Client" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {clientsArray &&
                                                clientsArray.length > 0 ? (
                                                    clientsArray.map(
                                                        (client) => (
                                                            <SelectItem
                                                                key={client.id}
                                                                value={
                                                                    client.id
                                                                }
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <Avatar className="h-7 w-7">
                                                                        <AvatarFallback className="text-xs">
                                                                            {client.username[0].toUpperCase()}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="text-sm font-medium">
                                                                        {
                                                                            client.username
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </SelectItem>
                                                        ),
                                                    )
                                                ) : (
                                                    <div className="p-2 text-sm text-muted-foreground text-center">
                                                        No clients found
                                                    </div>
                                                )}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.clientId && (
                                <FieldError>
                                    {errors.clientId.message}
                                </FieldError>
                            )}
                        </Field>
                    </div>
                </FieldGroup>

                {error && <FieldError className="mt-4">{error}</FieldError>}
                <div className="w-full flex justify-end mt-8">
                    <Button type="submit" className="w-60" disabled={isLoading}>
                        {isLoading && <Spinner className="mr-2" />}
                        Create Project
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateProjectForm;
