import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { ClipboardCheckIcon, SquareArrowOutUpRight } from "lucide-react";
import { Link } from "react-router-dom";

interface PendingRequisitionEmptyProps {
    slug: string;
}

const PendingRequisitionEmpty = ({ slug }: PendingRequisitionEmptyProps) => {
    return (
        <div className="flex items-center justify-center font-sans py-16">
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <ClipboardCheckIcon />
                    </EmptyMedia>
                    <EmptyTitle className="font-display">No Pending Requisitions</EmptyTitle>
                    <EmptyDescription className="font-sans text-sm">
                        No pending requisitions at the moment. Check for requisition
                        requests and approve them from your projects.
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent className="flex-row justify-center gap-2">
                    <Button className="bg-green-700 text-white hover:bg-green-800">
                        <Link
                            to={`/${slug}/projects`}
                            className="flex items-center gap-2 px-3 py-2"
                        >
                            <SquareArrowOutUpRight className="h-4 w-4" />
                            <span className="text-sm">Check for Projects</span>
                        </Link>
                    </Button>
                </EmptyContent>
            </Empty>
        </div>
    );
};

export default PendingRequisitionEmpty;
