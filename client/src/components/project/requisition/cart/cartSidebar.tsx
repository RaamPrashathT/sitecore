import * as React from "react";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";

export function CartSidebar({
    ...props
}: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar
            side="right"    
            collapsible="none"
            className="sticky top-0 hidden h-svh border-l  lg:flex w-80" 
            {...props}
        >
            <SidebarContent className="p-4">
                <p>Your items will appear here...</p>
            </SidebarContent>
        </Sidebar>
    );
}