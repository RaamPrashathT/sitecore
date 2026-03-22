import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";

interface DeleteCatalogueButtonProps {
    orgId: string;
    catalogueId: string;
    quoteId: string;
}

const DeleteCatalogueButton = (props: DeleteCatalogueButtonProps) => {
    const handleDelete = async () => {
        try {
            const response = await api.post(
                "/catalogue/deleteCatalogue",
                {
                    catalogueId: props.catalogueId,
                    quoteId: props.quoteId,
                },
                {
                    headers: {
                        "x-organization-id": props.orgId,
                    },
                },
            );
            if (!response.data.success) {
                throw new Error(response.data.message);
            }
            globalThis.location.reload();
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Button
            onClick={handleDelete}
            className="border-0 shadow-none bg-white hover:bg-slate-100  text-black"
        >
            <Trash />
            Delete
        </Button>
    );
};

export default DeleteCatalogueButton;
