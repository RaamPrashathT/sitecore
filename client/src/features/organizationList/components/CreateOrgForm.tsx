import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateOrganization } from "../hooks/useCreateOrganization";
import { useState } from "react";
import { useSession } from "@/features/auth/hooks/useSession";

export const CreateOrgForm = ({ onSuccess }: { onSuccess: (slug: string) => void }) => {
    const [name, setName] = useState("");
    const {user, isLoading: userLoading, isError: userError} = useSession();
    const { mutate, isPending, error } = useCreateOrganization(user?.userId);

    const handleSubmit = (e: React.SubmitEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        
        mutate(name, {
            onSuccess: (data) => onSuccess(data.slug)
        });
    };

    if(userLoading) {
        return <p className="text-sm text-gray-400">Loading...</p>;
    }

    if (userError) {
        return <p className="text-sm text-red-500">"something went wrong"</p>;
    }

    return (
        <form onSubmit={handleSubmit} className="flex gap-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
            <Button type="submit" disabled={isPending}>Create</Button>
            {error && <p className="text-red-500">{error.message}</p>}
        </form>
    );
};