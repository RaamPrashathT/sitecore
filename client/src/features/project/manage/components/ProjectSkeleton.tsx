import { Skeleton } from "@/components/ui/skeleton";

const ProjectSkeleton = () => {
    return (
        <div className="px-4">
            <div className="flex flex-row justify-between items-center py-2">
                <Skeleton className="h-10 w-45" />
                <Skeleton className="h-10 w-[250px] rounded-full" />
            </div>

            <div className="w-full">
                <div className="flex items-center h-11 bg-slate-100 px-4 rounded-xl mb-1">
                    <Skeleton className="h-4 w-4 mr-6" />
                    <Skeleton className="h-4 w-[15%] mx-2" />
                    <Skeleton className="h-4 w-[15%] mx-2" />
                    <Skeleton className="h-4 w-[15%] mx-2" />
                    <Skeleton className="h-4 w-[15%] mx-2" />
                    <Skeleton className="h-4 w-[15%] mx-2" />
                    <Skeleton className="h-4 w-24 ml-auto" />
                </div>
                
                <div className="flex flex-col">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div 
                            key={index} 
                            className="flex items-center h-11 px-4 border-b last:border-0"
                        >
                            <Skeleton className="h-4 w-4 mr-6 rounded-xl" />
                            <Skeleton className="h-4 w-[15%] mx-2" />
                            <Skeleton className="h-4 w-[15%] mx-2" />
                            <Skeleton className="h-4 w-[15%] mx-2" />
                            <Skeleton className="h-4 w-[10%] mx-2" />
                            <Skeleton className="h-4 w-[10%] mx-2" />
                            <Skeleton className="h-8 w-24 ml-auto rounded-sm" /> 
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-row relative py-2">
                <div className="flex w-70 items-center gap-x-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                </div>
                
                <div className="flex flex-1 justify-center pr-80">
                    <Skeleton className="h-10 w-80" />
                </div>
            </div>
        </div>
    );
};

export default ProjectSkeleton;