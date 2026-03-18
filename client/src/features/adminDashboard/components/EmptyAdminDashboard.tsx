import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { ClipboardPlus, SquareArrowOutUpRight, SquareTerminal } from "lucide-react";
import { Link } from "react-router-dom";

const EmptyAdminDashboard = () => {
    return (
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <SquareTerminal />
                </EmptyMedia>
                <EmptyTitle>No Open Requisitions</EmptyTitle>
                <EmptyDescription>
                    No Open Requisitions. You can check for requisition requests
                    and approve them
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center gap-2">
                <Button className="w-50">
                    <Link
                        to={`projects`}
                        className="flex items-center gap-x-1 p-3"
                    >
                        <SquareArrowOutUpRight />
                        <p className="mb-px">Check for Projects</p>
                    </Link>
                </Button>
                <Button className="w-50">
                    <Link
                        to={`pending-requisitions`}
                        className="flex items-center gap-x-1 p-3"
                    >
                        <ClipboardPlus />
                        <p className="mb-px">Check for Requisitions</p>
                    </Link>
                </Button>
            </EmptyContent>
        </Empty>
    );
};

export default EmptyAdminDashboard;
