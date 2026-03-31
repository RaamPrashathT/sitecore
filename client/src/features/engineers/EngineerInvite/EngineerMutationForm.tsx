import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
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
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import z from "zod";
import EngineerMutationFormSkeleton from "./EngineerMutationFormSkeleton";

const selectedProjectSchema = z.object({
    id: z.string(),
    name: z.string(),
    estimatedBudget: z.number(),
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

const formatBudgetInr = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Crores`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} Lakhs`;
    return `₹${new Intl.NumberFormat("en-IN").format(value)}`;
};

const truncateLongName = (name: string, maxLength = 30) => {
    if (name.length <= maxLength) return name;
    return `${name.slice(0, maxLength)}...`;
};

const EngineerMutationForm = () => {
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
                        estimatedBudget: Number(project.estimatedBudget),
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
            return api.post(`/engineers/invitation`, data);
        },
        onSuccess: () => {
            navigate(`/${membership?.slug}/engineers`);
        },
    });

    if (projectsLoading || membershipLoading) return <EngineerMutationFormSkeleton />;
    if (!membership || !projects) {
        return (
            <div className="px-4 py-6 font-sans text-sm text-muted-foreground">
                No access
            </div>
        );
    }

    const selectedIds = new Set(selectedProjects.map((p) => p.id));

    const normalizedSearchTerm = (searchTerm ?? "").toLowerCase();
    const filteredProjects = projects.data?.filter(
        (p) =>
            p.name.toLowerCase().includes(normalizedSearchTerm) &&
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
        <div className="mx-auto mb-20 w-full max-w-3xl px-4 py-2 font-sans">
            <div>
                <h1 className="mb-6 border-b border-border/70 pb-4 font-display text-3xl font-normal tracking-wide text-foreground">
                    Invite Engineers
                </h1>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <FieldGroup className="rounded-xl border border-border/70 bg-background p-6 md:p-8">
                        <Field>
                            <FieldLabel className="font-sans text-sm text-muted-foreground">
                                Email
                            </FieldLabel>
                            <Input
                                {...register("email")}
                                id="email"
                                placeholder="engineer@example.com"
                                className="font-sans text-sm"
                            />
                            {errors.email && (
                                <FieldError>{errors.email.message}</FieldError>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel className="font-sans text-sm text-muted-foreground">
                                Projects
                            </FieldLabel>

                            {selectedProjects.length > 0 && (
                                <div className="mb-3 max-h-50 overflow-auto rounded-lg border border-border/70">
                                    <table className="w-full text-sm font-sans">
                                        <thead>
                                            <tr className="border-b border-border/70 bg-muted/40">
                                                <th className="px-3 py-2 text-left font-display text-sm font-normal tracking-wide text-foreground">
                                                    Project
                                                </th>
                                                <th className="px-3 py-2 text-left font-display text-sm font-normal tracking-wide text-foreground">
                                                    Budget
                                                </th>
                                                <th className="px-3 py-2 text-left font-display text-sm font-normal tracking-wide text-foreground">
                                                    Phases
                                                </th>
                                                <th className="px-3 py-2 text-left font-display text-sm font-normal tracking-wide text-foreground">
                                                    Assignments
                                                </th>
                                                <th className="px-3 py-2 text-left font-display text-sm font-normal tracking-wide text-foreground">
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
                                                                ? "border-b border-border/60"
                                                                : ""
                                                        }
                                                    >
                                                        <td className="px-2 py-2 font-sans text-sm font-medium text-foreground">
                                                            <span className="inline-block max-w-[280px] truncate" title={project.name}>
                                                                {truncateLongName(project.name)}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-2 font-mono text-sm text-muted-foreground tabular-nums">
                                                            {formatBudgetInr(project.estimatedBudget)}
                                                        </td>
                                                        <td className="px-3 py-2 font-mono text-sm text-muted-foreground tabular-nums">
                                                            {project.phases}
                                                        </td>
                                                        <td className="px-3 py-2 font-mono text-sm text-muted-foreground tabular-nums">
                                                            {project.assignments}
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <button
                                                                type="button"
                                                                onClick={(e) =>
                                                                    removeProject(
                                                                        e,
                                                                        project.id,
                                                                    )
                                                                }
                                                                className="flex items-center justify-center rounded p-1 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-700"
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
                                    className="font-sans text-sm"
                                    onFocus={() => {
                                        setDropdownOpen(true);
                                    }}
                                />

                                {dropdownOpen &&
                                    filteredProjects &&
                                    filteredProjects.length > 0 && (
                                        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md border border-border/70 bg-popover shadow-md">
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
                                                                    className="flex cursor-pointer items-center justify-between font-sans text-sm"
                                                                >
                                                                    <span>
                                                                        {truncateLongName(project.name)}
                                                                    </span>
                                                                    <span className="ml-4 font-mono text-xs text-muted-foreground tabular-nums">
                                                                        {formatBudgetInr(Number(project.estimatedBudget))}{" "}
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
                    <FieldGroup className="mt-8 flex w-full items-center">
                        <Button
                            disabled={isPending}
                            type="submit"
                            className="h-10 w-60 bg-green-700 font-sans text-sm text-white hover:bg-green-800"
                        >
                            {isPending ? (
                                <div className="flex items-center gap-x-1">
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

export default EngineerMutationForm;
