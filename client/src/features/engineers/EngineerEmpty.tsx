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
import EngineerInviteButton from "./EngineerInvite/EngineerInviteButton";

interface EngineerEmptyProps {
    slug: string;
}

const EngineerEmpty = ({ slug }: EngineerEmptyProps) => {
    return (
        <div className="flex h-full items-center justify-center px-4 py-6">
            <Empty className="w-full max-w-2xl rounded-xl border border-border/70 bg-background p-6 md:p-8">
                <EmptyHeader>
                    <EmptyMedia variant="icon" className="text-green-700">
                        <ClipboardCheckIcon />
                    </EmptyMedia>
                    <EmptyTitle className="font-display text-3xl font-normal tracking-wide text-foreground">No Engineers</EmptyTitle>
                    <EmptyDescription className="font-sans text-sm text-muted-foreground">
                        No pending engineers yet. 
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent className="flex-row justify-center gap-2">
                    <Button className="h-10 w-50 border border-green-700/30 bg-green-50 font-sans text-sm text-green-700 hover:bg-green-100">
                        <Link
                            to={`/${slug}/pending-invitations`}
                            className="flex items-center gap-x-1 p-3"
                        >
                            <SquareArrowOutUpRight className="size-4" />
                            <p className="mb-px">Check for Invitations</p>
                        </Link>
                    </Button>
                    <div className="w-50">
                        <EngineerInviteButton />
                    </div>
                </EmptyContent>
            </Empty>
        </div>
    );
};

export default EngineerEmpty;
