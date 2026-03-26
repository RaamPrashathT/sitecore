import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateOrganization } from "../hooks/useCreateOrganization";
import { useState } from "react";

export const CreateOrgForm = ({
    onSuccess,
}: {
    onSuccess: (slug: string) => void;
}) => {
    const [name, setName] = useState("");
    const { mutate, isPending, error } = useCreateOrganization();

    const handleSubmit = (e: React.SubmitEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        mutate(name, {
            onSuccess: (data) => onSuccess(data.slug),
        });
    };

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <h1 className="mb-4">Create Organization</h1>
            <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-2"
            >
                <Input
                    type="text"
                    placeholder="Organization Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full sm:w-2/3"
                />
                <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full sm:w-1/3"
                >
                    Create Organization
                </Button>
            </form>
            {error && <p className="text-red-500 mt-2">{error.message}</p>}
        </div>
    );
};
