import { Button } from "@/components/ui/button";
import {
    Command,
    CommandGroup,
    CommandList,
    CommandItem,
} from "@/components/ui/command";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
    useProjectList,
    type ProjectListType,
} from "@/features/project/manage/hooks/useProjectList";
import { useMembership } from "@/hooks/useMembership";
import api from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { X } from "lucide-react";
import React, { useRef, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import z from "zod";

const selectedProjectSchema = z.object({
    id: z.string(),
    name: z.string(),
    estimatedBudget: z.coerce.number(),
    assignments: z.number(),
    phases: z.number(),
});

const formSchema = z.object({
    email: z.email("Invalid email address"),
    selectedProjects: z.array(selectedProjectSchema),
    projectSearch: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PayloadSchema {
    email: string;
    projects: string[];
}

const ClientInviteForm = () => {
    const navigate = useNavigate();
    const { data: membership, isLoading: membershipLoading } = useMembership();
    const { data: projects, isLoading: projectsLoading } = useProjectList(
        membership?.id,
        0,
        100,
        "",
    );

    const dropdownRef = useRef<HTMLDivElement>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const {
        register,
        watch,
        setValue,
        getValues,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            selectedProjects: [],
            projectSearch: "",
        },
    });

    const searchTerm = watch("projectSearch");
    const selectedProjects = watch("selectedProjects");

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        setDropdownOpen(!!searchTerm);
    }, [searchTerm]);

    const handleSelect = (project: ProjectListType) => {
        const current = getValues("selectedProjects");
        const alreadySelected = current.some((p) => p.id === project.id);
        if (!alreadySelected) {
            setValue(
                "selectedProjects",
                [
                    ...current,
                    {
                        id: project.id,
                        name: project.name,
                        estimatedBudget: project.estimatedBudget,
                        assignments: project.assignments,
                        phases: project.phases,
                    },
                ],
                { shouldValidate: true },
            );
        }
        setValue("projectSearch", "");
        setDropdownOpen(false);
    };

    const removeProject = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        const current = getValues("selectedProjects");
        setValue(
            "selectedProjects",
            current.filter((p) => p.id !== id),
            { shouldValidate: true },
        );
    };

    const { mutate, isPending, error, isError } = useMutation({
        mutationFn: async (data: PayloadSchema) => {
            return api.post(`/clients/invitation`, data);
        },
        onSuccess: () => {
            navigate(`/${membership?.slug}/clients`);
        },
    });

    if (projectsLoading || membershipLoading) return <div>Loading...</div>;
    if (!membership || !projects) return <div>No access</div>;

    const selectedIds = new Set(selectedProjects.map((p) => p.id));

    const filteredProjects = projects.data?.filter(
        (p) =>
            p.name.toLowerCase().includes(searchTerm!.toLowerCase()) &&
            !selectedIds.has(p.id),
    );

    const onSubmit = (data: FormValues) => {
        const payload = {
            email: data.email,
            projects: data.selectedProjects.map((project) => project.id),
        };
        mutate(payload);
    };

    return (
        <div className="w-full max-w-xl mx-auto mb-20">
            <div>
                <h1 className="text-2xl font-semibold">Invite Clients</h1>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <Field>
                            <FieldLabel>Email</FieldLabel>
                            <Input
                                {...register("email")}
                                id="email"
                                placeholder="client@example.com"
                            />
                            {errors.email && (
                                <FieldError>{errors.email.message}</FieldError>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel>Projects:</FieldLabel>

                            {selectedProjects.length > 0 && (
                                <div className="mb-3 rounded-md border max-h-50 overflow-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                                                    Project
                                                </th>
                                                <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                                                    Budget
                                                </th>
                                                <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                                                    Phases
                                                </th>
                                                <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                                                    Assignments
                                                </th>
                                                <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                                                    Remove
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedProjects.map(
                                                (project, index) => (
                                                    <tr
                                                        key={project.id}
                                                        className={
                                                            index !==
                                                            selectedProjects.length -
                                                                1
                                                                ? "border-b"
                                                                : ""
                                                        }
                                                    >
                                                        <td className="px-2 py-2 font-medium  ">
                                                            <span className="w-10  ">
                                                                {project.name}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-2 text-muted-foreground ">
                                                            $
                                                            {project.estimatedBudget.toLocaleString()}
                                                        </td>
                                                        <td className="px-3 py-2 text-muted-foreground ">
                                                            {project.phases}
                                                        </td>
                                                        <td className="px-3 py-2 text-muted-foreground ">
                                                            {
                                                                project.assignments
                                                            }
                                                        </td>
                                                        <td className="px-3 py-2 ">
                                                            <button
                                                                type="button"
                                                                onClick={(e) =>
                                                                    removeProject(
                                                                        e,
                                                                        project.id,
                                                                    )
                                                                }
                                                                className="flex items-center justify-center rounded p-1 hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                                                                aria-label={`Remove ${project.name}`}
                                                            >
                                                                <X className="h-3.5 w-3.5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            <div className="relative" ref={dropdownRef}>
                                <Input
                                    {...register("projectSearch")}
                                    placeholder="Search projects..."
                                    autoComplete="off"
                                    onFocus={() => {
                                        if (searchTerm) setDropdownOpen(true);
                                    }}
                                />

                                {dropdownOpen &&
                                    filteredProjects &&
                                    filteredProjects.length > 0 && (
                                        <div className="absolute z-50 top-full left-0 right-0 mt-1 border rounded-md bg-popover shadow-md overflow-hidden">
                                            <Command>
                                                <CommandList>
                                                    <CommandGroup heading="Projects">
                                                        {filteredProjects.map(
                                                            (project) => (
                                                                <CommandItem
                                                                    key={
                                                                        project.id
                                                                    }
                                                                    onSelect={() =>
                                                                        handleSelect(
                                                                            project,
                                                                        )
                                                                    }
                                                                    className="cursor-pointer flex items-center justify-between"
                                                                >
                                                                    <span>
                                                                        {
                                                                            project.name
                                                                        }
                                                                    </span>
                                                                    <span className="text-xs text-muted-foreground ml-4">
                                                                        $
                                                                        {project.estimatedBudget.toLocaleString()}{" "}
                                                                        ·{" "}
                                                                        {
                                                                            project.phases
                                                                        }{" "}
                                                                        phases
                                                                    </span>
                                                                </CommandItem>
                                                            ),
                                                        )}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </div>
                                    )}
                            </div>
                        </Field>
                    </FieldGroup>
                    <FieldGroup className="mt-8">
                        <Button disabled={isPending} type="submit">
                            {isPending ? (
                                <div>
                                    <Spinner />
                                    <p>Sending...</p>
                                </div>
                            ) : (
                                <p>Send Invitation Link</p>
                            )}
                        </Button>
                    </FieldGroup>
                    {isError && <FieldError>{error.message}</FieldError>}
                </form>
            </div>
        </div>
    );
};

export default ClientInviteForm;
