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

interface EngineerEmptyProps {
    slug: string;
}

const EngineerEmpty = ({ slug }: EngineerEmptyProps) => {
    return (
        <div className="h-full flex items-center justify-center">
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <ClipboardCheckIcon />
                    </EmptyMedia>
                    <EmptyTitle>No Engineers</EmptyTitle>
                    <EmptyDescription>
                        No pending engineers yet. 
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent className="flex-row justify-center gap-2">
                    <Button className="w-50">
                        <Link
                            to={`/${slug}/pending-invitations`}
                            className="flex items-center gap-x-1 p-3"
                        >
                            <SquareArrowOutUpRight />
                            <p className="mb-px">Check for Invitations</p>
                        </Link>
                    </Button>
                </EmptyContent>
            </Empty>
        </div>
    );
};

export default EngineerEmpty;
