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
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const EmptyProjectList = () => {
    return (
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <IconFolderCode />
                </EmptyMedia>
                <EmptyTitle>No Projects Yet</EmptyTitle>
                <EmptyDescription>
                    You haven&apos;t created any projects yet. Get started by
                    creating your first project.
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
};

export default EmptyProjectList;
