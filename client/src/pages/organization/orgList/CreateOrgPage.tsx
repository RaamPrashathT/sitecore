import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/axios";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateOrgPage = () => {
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (name.trim() === "") {
            setError("Organization name is required");
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const { data } = await api.post("/org", {
                name: name,
            });

            const slug = data.orgName
                .toLowerCase()
                .trim()
                .replaceAll(/\s+/g, "-");

            navigate(`/org/${slug}`);
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message ?? "Request failed");
            } else {
                setError("Something went wrong");
            }
        } finally {
            setIsLoading(false);
        }
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
                    disabled={isLoading}
                    className="w-full sm:w-1/3"
                >
                    Create Organization
                </Button>
            </form>
            {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
    );
};

export default CreateOrgPage;
