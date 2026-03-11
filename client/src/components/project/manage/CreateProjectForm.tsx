import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import api from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
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


const CreateProjectForm = ({ 
    orgId, 
    slug 
}: CreateProjectFormProps) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(formSchema),
    });
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onSubmit = async (data: CreateProjectFormSchema) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post("/project", 
                {
                    projectName: data.name
                },
                {
                    headers: {
                        "x-organization-id": orgId,
                    },
                }
            )
            if (!response.data.success) {
                setError(response.data.message);
            }
            navigate(`/${slug}/${response.data.slug}`)
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            }
        } finally {
            setIsLoading(false);
        }
    }


    return (
        <div className="flex items-center justify-center">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-3xl"
            >
                <h1
                    className="text-3xl font-semibold my-8"
                >Create Project</h1>
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
