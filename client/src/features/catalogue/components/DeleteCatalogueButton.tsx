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
            className="justify-start border-0 bg-transparent px-2 font-sans text-sm font-medium text-red-600 shadow-none hover:bg-red-50 hover:text-red-700"
        >
            <Trash className="size-4" />
            Delete
        </Button>
    );
};

export default DeleteCatalogueButton;
