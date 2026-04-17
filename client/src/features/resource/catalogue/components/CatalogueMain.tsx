import { Outlet } from "react-router-dom";
import CatalogueListSidebar from "./CatalogueSidebar";

const CatalogueMain = () => {
    return (
        <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
            {/* Sidebar */}
            <aside className="w-[260px] shrink-0 border-r border-border flex flex-col bg-background">
                <CatalogueListSidebar />
            </aside>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-muted/30">
                <Outlet />
            </div>
        </div>
    );
};

export default CatalogueMain;
