import { Edit, EllipsisVertical } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
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
        <div>
            Loading...
        </div>
    )
    if(!membership) return (
        <div>
            No access
        </div>
    )
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="border-0 shadow-none bg-transparent hover:bg-transparent"
                >
                    <EllipsisVertical />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="p-1 flex flex-col w-30">
                <Button className="border-0 shadow-none bg-white hover:bg-slate-100  text-black">
                    <Link 
                        className="flex" 
                        to={`/org/${membership.slug}/catalogue/edit/${props.catalogueId}/${props.quoteId}`}
                    >
                        <Edit />
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
