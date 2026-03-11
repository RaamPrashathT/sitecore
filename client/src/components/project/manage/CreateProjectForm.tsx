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
import { useEngineers } from "@/hooks/useEngineers";
import api from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
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
});

type CreateProjectFormSchema = z.infer<typeof formSchema>;

const CreateProjectForm = ({ orgId, slug }: CreateProjectFormProps) => {
    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(formSchema),
    });
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { data: engineers, isLoading: engineerLoading } = useEngineers(orgId);

    if(engineerLoading) return (
        <div>
            Loading...
        </div>
    )

    const onSubmit = async (data: CreateProjectFormSchema) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post(
                "/project",
                {
                    projectName: data.name,
                },
                {
                    headers: {
                        "x-organization-id": orgId,
                    },
                },
            );
            if (!response.data.success) {
                setError(response.data.message);
            }
            navigate(`/${slug}/${response.data.slug}`);
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-3xl"
            >
                <h1 className="text-3xl font-semibold my-8">Create Project</h1>
                <FieldGroup>
                    <Field>
                        <FieldLabel>Project Name</FieldLabel>
                        <Input
                            {...register("name")}
                            placeholder="Project Name"
                            id="name"
                        />
                        {errors.name && (
                            <FieldError>{errors.name.message}</FieldError>
                        )}
                    </Field>
                    <Field>
                        <FieldLabel>Engineers</FieldLabel>
                        <Controller
                            name="name"
                            control={control}
                            rules={{ required: "Engineers is required" }}
                            render={({ field }) => (
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Engineers" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            
                                            {engineers && engineers?.length > 0 ? (
                                                engineers?.map((engineer) => (
                                                        <SelectItem
                                                            key={engineer.id}
                                                            value={engineer.id}
                                                        >
                                                            <Avatar>
                                                                <AvatarFallback>{engineer.username[0]}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p>{engineer.username}</p>
                                                                <p>{engineer.email}</p>
                                                            </div>
                                                        </SelectItem>
                                                    )
                                                )                                            ) : (
                                                <div>false</div>
                                            )}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </Field>
                </FieldGroup>

                {error && <FieldError>{error}</FieldError>}
                <div className="w-full flex justify-end mt-8">
                    <Button type="submit" className="w-60">
                        {isLoading && <Spinner />}
                        <p>Create Project</p>
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateProjectForm;
