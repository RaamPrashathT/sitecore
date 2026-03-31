import { Edit, EllipsisVertical } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover";
import { Link } from "react-router-dom";
import DeleteCatalogueButton from "./DeleteCatalogueButton";
import { useMembership } from "@/hooks/useMembership";

interface CatalogueActionButtonProps {
    catalogueId: string;
    quoteId: string;
}

const CatalogueActionButton = (props: CatalogueActionButtonProps) => {
    const { data: membership, isLoading } = useMembership();
    if(isLoading) return (
        <div className="font-sans text-sm text-muted-foreground">
            Loading...
        </div>
    )
    if(!membership) return (
        <div className="font-sans text-sm text-muted-foreground">
            No access
        </div>
    )
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
            <PopoverContent align="end" className="flex w-36 flex-col gap-1 rounded-lg border border-border/70 p-1.5">
                <Button className="justify-start border-0 bg-transparent px-2 font-sans text-sm font-medium text-foreground shadow-none hover:bg-green-50 hover:text-green-700">
                    <Link 
                        className="flex w-full items-center gap-x-2" 
                        to={`/${membership.slug}/catalogue/edit/${props.catalogueId}/${props.quoteId}`}
                    >
                        <Edit className="size-4" />
                        Edit
                    </Link>
                </Button>
                <DeleteCatalogueButton 
                    orgId={membership.id}
                    catalogueId={props.catalogueId}
                    quoteId={props.quoteId}
                />
            </PopoverContent>
        </Popover>
    );
};

export default CatalogueActionButton;
