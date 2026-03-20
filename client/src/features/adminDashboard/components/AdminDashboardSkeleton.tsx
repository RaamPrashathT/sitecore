import { Skeleton } from "@/components/ui/skeleton";

const AdminDashboardSkeleton = () => {
    return (
        <div className="p-0 m-0">
            <div >
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-48" />
            </div>
            <div></div>
        </div>
    );
};

export default AdminDashboardSkeleton;
