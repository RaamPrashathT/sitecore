import { Edit, EllipsisVertical, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Link } from "react-router-dom";
import { useMembership } from "@/hooks/useMembership";
import { useDeleteCatalogue } from "../hooks/useCatalogue";

interface CatalogueActionButtonProps {
    catalogueId: string;
}

const CatalogueActionButton = ({ catalogueId }: CatalogueActionButtonProps) => {
    const { data: membership } = useMembership();
    const deleteMutation = useDeleteCatalogue();

    if (!membership) return null;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    className="h-9 px-2 font-sans text-muted-foreground shadow-none hover:bg-green-50 hover:text-green-700"
                >
                    <EllipsisVertical className="size-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="end"
                className="flex w-36 flex-col gap-1 rounded-lg border border-border/70 p-1.5"
            >
                <Button
                    asChild
                    variant="ghost"
                    className="justify-start px-2 font-sans text-sm font-medium text-foreground hover:bg-green-50 hover:text-green-700"
                >
                    <Link to={`/${membership.slug}/catalogue/edit/${catalogueId}`}>
                        <Edit className="size-4" />
                        Edit
                    </Link>
                </Button>

                <Button
                    variant="ghost"
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(catalogueId)}
                    className="justify-start px-2 font-sans text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                >
                    <Trash className="size-4" />
                    {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
            </PopoverContent>
        </Popover>
    );
};

export default CatalogueActionButton;
