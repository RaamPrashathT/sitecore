import CatalogueTable from "./CatalogueTable";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useMembership } from "@/hooks/useMembership";

const CatalogueMain = () => {
    const { data: membership } = useMembership();

    return (
        <div className="flex h-full flex-col px-4 pb-4 pt-2 font-sans">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
                <h1 className="font-sans text-2xl font-bold text-foreground">
                    Master Catalogue
                </h1>
                {membership && (
                    <Button className="bg-green-700 text-white hover:bg-green-800">
                        <Link
                            to={`/${membership.slug}/catalogue/create`}
                            className="flex items-center gap-x-1"
                        >
                            <Plus className="size-4" />
                            <p className="font-sans text-sm">
                                Add Catalogue Item
                            </p>
                        </Link>
                    </Button>
                )}
            </div>
            <div className="flex-1 overflow-auto">
                <CatalogueTable />
            </div>
        </div>
    );
};

export default CatalogueMain;
