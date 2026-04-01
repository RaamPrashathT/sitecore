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
        <div className="flex items-center justify-center font-sans py-16">
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <ClipboardCheckIcon />
                    </EmptyMedia>
                    <EmptyTitle className="font-display">No Pending Invitations</EmptyTitle>
                    <EmptyDescription className="font-sans text-sm">
                        No pending invitations at the moment. Invite engineers and clients to your organization.
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent className="flex-row justify-center gap-2">
                    <Button className="bg-green-700 text-white hover:bg-green-800">
                        <Link
                            to={`/${slug}/engineers`}
                            className="flex items-center gap-2 px-3 py-2"
                        >
                            <SquareArrowOutUpRight className="h-4 w-4" />
                            <span className="text-sm">Check Engineers</span>
                        </Link>
                    </Button>
                    <Button className="bg-green-700 text-white hover:bg-green-800">
                        <Link
                            to={`/${slug}/clients`}
                            className="flex items-center gap-2 px-3 py-2"
                        >
                            <SquareArrowOutUpRight className="h-4 w-4" />
                            <span className="text-sm">Check Clients</span>
                        </Link>
                    </Button>
                </EmptyContent>
            </Empty>
        </div>
    );
};

export default PendingInvitationsEmpty;
