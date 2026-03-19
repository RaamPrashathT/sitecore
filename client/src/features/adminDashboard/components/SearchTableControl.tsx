import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const SearchTableControl = () => {
    return (
        <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search for items..." className="rounded-full pl-7" />
        </div>
    );
};

export default SearchTableControl;
