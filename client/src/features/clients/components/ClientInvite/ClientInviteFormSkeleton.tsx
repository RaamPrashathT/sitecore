import { Skeleton } from "@/components/ui/skeleton";

const ClientInviteFormSkeleton = () => {
    return (
        <div className="mx-auto mb-20 w-full max-w-3xl px-4 py-2">
            <Skeleton className="mb-6 h-10 w-64" />
            <div className="rounded-xl border border-border/70 bg-background p-6 md:p-8">
                <div className="space-y-5">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
            </div>
            <div className="mt-8 flex items-center justify-center">
                <Skeleton className="h-10 w-60" />
            </div>
        </div>
    );
};

export default ClientInviteFormSkeleton;
