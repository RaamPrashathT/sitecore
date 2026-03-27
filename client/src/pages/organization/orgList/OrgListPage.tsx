import OrgList from "@/features/organizationList/components/OrgList";
import { Button } from "@/components/ui/button";
import { Plus, SquareArrowOutUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import UserProfile from "@/features/organizationList/components/UserProfile";

const OrganizationListPage = () => {
    return (
        <div>
            <div className="flex justify-end p-2">
                <UserProfile />
            </div>
            <div className="max-w-2xl mx-auto px-6 ">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-xl font-semibold tracking-tight text-gray-900">
                        Organizations
                    </h1>

                    <div className="flex gap-2">
                        <Button size="sm">
                            <Link
                                to="search"
                                className="flex items-center gap-x-1"
                            >
                                <SquareArrowOutUpRight />
                                <p className="mb-px">Join</p>
                            </Link>
                        </Button>
                        <Button size="sm">
                            <Link
                                to="create"
                                className="flex items-center gap-x-1"
                            >
                                <Plus />
                                <p className="mb-px">New</p>
                            </Link>
                        </Button>
                    </div>
                </div>
                <OrgList />
            </div>
        </div>
    );
};

export default OrganizationListPage;
