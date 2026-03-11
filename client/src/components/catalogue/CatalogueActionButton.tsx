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
                    variant="ghost"
                    
                    className="shadow-none bg-transparent hover:bg-transparent h-12 px-4"
                >
                    <EllipsisVertical />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="flex flex-col w-30 p-1">
                <Button className="border-0 shadow-none bg-white hover:bg-slate-100  text-black">
                    <Link 
                        className="flex w-full justify-center items-center gap-x-2" 
                        to={`/${membership.slug}/catalogue/edit/${props.catalogueId}/${props.quoteId}`}
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
