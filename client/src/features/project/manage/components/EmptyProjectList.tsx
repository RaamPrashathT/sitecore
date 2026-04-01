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
            <div className="flex items-center justify-center font-sans py-16">
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <IconFolderCode />
                        </EmptyMedia>
                        <EmptyTitle className="font-display">No Projects Yet</EmptyTitle>
                        <EmptyDescription className="font-sans text-sm">
                            You haven&apos;t created any projects yet. Get started
                            by creating your first project.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent className="flex-row justify-center gap-2">
                        <Button className="bg-green-700 text-white hover:bg-green-800">
                            <Link
                                to={`create`}
                                className="flex items-center gap-2 px-3 py-2"
                            >
                                <Plus className="h-4 w-4" />
                                <span className="text-sm">Create Project</span>
                            </Link>
                        </Button>
                    </EmptyContent>
                </Empty>
            </div>
        );
    } else {
        return (
            <div className="flex items-center justify-center font-sans py-16">
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <IconFolderCode />
                        </EmptyMedia>
                        <EmptyTitle className="font-display">No Projects Yet</EmptyTitle>
                        <EmptyDescription className="font-sans text-sm">
                            No projects available at the moment.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            </div>
        )
    }
};

export default EmptyProjectList;
