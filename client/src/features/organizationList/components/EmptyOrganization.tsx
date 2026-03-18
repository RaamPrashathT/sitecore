import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { IconFolderCode } from "@tabler/icons-react";
import { Plus, SquareArrowOutUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const EmptyOrganizationList = () => {
    return (
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <IconFolderCode />
                </EmptyMedia>
                <EmptyTitle>No organizations Yet</EmptyTitle>
                <EmptyDescription>
                    You haven&apos;t created any organization yet. Get started by
                    creating your first organization or join one.
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center gap-2">
                <Button className="w-50">
                    <Link
                        to={`create`}
                        className="flex items-center gap-x-1 p-3"
                    >
                        <Plus />
                        <p className="mb-px">Create Organization</p>
                    </Link>
                </Button>
                <Button className="w-50">
                    <Link
                        to={`search`}
                        className="flex items-center gap-x-1 p-3"
                    >
                        <SquareArrowOutUpRight />
                        <p className="mb-px">Join Organization</p>
                    </Link>
                </Button>
            </EmptyContent>
        </Empty>
    );
};

export default EmptyOrganizationList;
