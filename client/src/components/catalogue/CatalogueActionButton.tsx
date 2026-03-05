import { Edit, EllipsisVertical, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface CatalogueActionButtonProps {
    id: string;
}

const CatalogueActionButton = (id: CatalogueActionButtonProps) => {
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
                    <Edit />
                    Edit
                </Button>
                <Button className="border-0 shadow-none bg-white hover:bg-slate-100  text-black">
                    <Trash />
                    Delete
                </Button>
            </PopoverContent>
        </Popover>
    );
};

export default CatalogueActionButton;
