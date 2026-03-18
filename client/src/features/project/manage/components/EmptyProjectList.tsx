import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { useMembership } from "@/hooks/useMembership";
import { IconFolderCode } from "@tabler/icons-react";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const EmptyProjectList = () => {
    const { data: membership, isLoading: membershipLoading } = useMembership();
    if (membershipLoading) {
        return <div>Loading...</div>;
    }
    if (!membership) {
        return <div>No access</div>;
    }
    if (membership.role === "ADMIN") {
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <IconFolderCode />
                    </EmptyMedia>
                    <EmptyTitle>No Projects Yet</EmptyTitle>
                    <EmptyDescription>
                        You haven&apos;t created any projects yet. Get started
                        by creating your first project.
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent className="flex-row justify-center gap-2">
                    <Button className="w-60">
                        <Link
                            to={`create`}
                            className="flex items-center gap-x-1 p-3"
                        >
                            <Plus />
                            <p className="mb-px">Create Project</p>
                        </Link>
                    </Button>
                </EmptyContent>
            </Empty>
        );
    }else {
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <IconFolderCode />
                    </EmptyMedia>
                    <EmptyTitle>No Projects Yet</EmptyTitle>
                    <EmptyDescription>
                        No Projects yet.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        )
    }
};

export default EmptyProjectList;
