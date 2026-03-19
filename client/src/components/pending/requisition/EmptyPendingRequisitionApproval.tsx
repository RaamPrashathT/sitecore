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

interface EmptyPendingRequisitionApprovalProps {
    slug: string;
}


const EmptyPendingRequisitionApproval = ({ slug }: EmptyPendingRequisitionApprovalProps) => {
    return (
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <ClipboardCheckIcon />
                </EmptyMedia>
                <EmptyTitle>No pending Requisitions</EmptyTitle>
                <EmptyDescription>
                    No pending Requisitions. You can check for requisition requests
                    and approve them
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center gap-2">
                <Button className="w-50">
                    <Link
                        to={`/${slug}/projects`}
                        className="flex items-center gap-x-1 p-3"
                    >
                        <SquareArrowOutUpRight />
                        <p className="mb-px">Check for Projects</p>
                    </Link>
                </Button>
            </EmptyContent>
        </Empty>
    );
};

export default EmptyPendingRequisitionApproval;
