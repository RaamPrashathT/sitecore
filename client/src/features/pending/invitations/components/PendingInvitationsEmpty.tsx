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

interface PendingInvitationsEmptyProps {
    slug: string;
}

const PendingInvitationsEmpty = ({ slug }: PendingInvitationsEmptyProps) => {
    return (
        <div className="h-full flex justify-center">
            <Empty className="mb-20">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <ClipboardCheckIcon />
                    </EmptyMedia>
                    <EmptyTitle>No pending Invitations</EmptyTitle>
                    <EmptyDescription>
                        No pending Invitations. 
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent className="flex-row justify-center gap-2">
                    <Button className="w-50">
                        <Link
                            to={`/${slug}/engineers`}
                            className="flex items-center gap-x-1 p-3"
                        >
                            <SquareArrowOutUpRight />
                            <p className="mb-px">Check about Engineers</p>
                        </Link>
                    </Button>
                    <Button className="w-50">
                        <Link
                            to={`/${slug}/clients`}
                            className="flex items-center gap-x-1 p-3"
                        >
                            <SquareArrowOutUpRight />
                            <p className="mb-px">Check about Clients</p>
                        </Link>
                    </Button>
                </EmptyContent>
            </Empty>
        </div>
    );
};

export default PendingInvitationsEmpty;
