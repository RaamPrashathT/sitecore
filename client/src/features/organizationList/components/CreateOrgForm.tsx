import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateOrganization } from "../hooks/useCreateOrganization";
import { useState } from "react";

export const CreateOrgForm = ({ onSuccess }: { onSuccess: (slug: string) => void }) => {
    const [name, setName] = useState("");
    const { mutate, isPending, error } = useCreateOrganization();

    const handleSubmit = (e: React.SubmitEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        
        mutate(name, {
            onSuccess: (data) => onSuccess(data.slug)
        });
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
            <Button type="submit" disabled={isPending}>Create</Button>
            {error && <p className="text-red-500">{error.message}</p>}
        </form>
    );
};