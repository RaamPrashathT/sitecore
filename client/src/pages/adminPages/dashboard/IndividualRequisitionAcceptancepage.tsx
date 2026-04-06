import React from "react"; // <-- Make sure React is imported for useMemo
import { useParams, useNavigate } from "react-router-dom";
import { useMembership } from "@/hooks/useMembership";
import { useGetRequisitionBySlug } from "@/features/adminDashboard/hooks/useGetRequisitionBySlug";
import { useUpdateRequisitions } from "@/features/pending/requisitions/hooks/useUpdateRequisition";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";

// Importing your existing Table components!
import { PendingRequisitionItemColumns } from "@/features/pending/requisitions/components/PendingRequisitionItemColumns";
import PendingRequisitionItemTable from "@/features/pending/requisitions/components/PendingRequisitionItemTable";

// Import the type so we can cast it
import type { PendingRequisitionItemType } from "@/features/pending/requisitions/hooks/usePendingRequisition"; 

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Check, X, Loader2 } from "lucide-react";

const IndividualRequisitionAcceptancePage = () => {
    const { reqSlug } = useParams<{ reqSlug: string }>();
    const navigate = useNavigate();
    
    // Hooks
    const { data: membership } = useMembership();
    const { data: requisition, isLoading, error } = useGetRequisitionBySlug(membership?.id, reqSlug);
    const { mutate: updateRequisition, isPending: isUpdating } = useUpdateRequisitions(membership?.id);

    // FIX: Map the data to satisfy the missing 'supplierId' and memoize it for table performance
    const tableData = React.useMemo(() => {
        if (!requisition?.items) return [];
        return requisition.items.map((item) => ({
            ...item,
            // Provide a fallback for supplierId to satisfy TypeScript
            supplierId: (item as any).supplierId || (item as any).assignedSupplier?.id || "", 
        })) as unknown as PendingRequisitionItemType[];
    }, [requisition?.items]);

    const table = useReactTable({
        data: tableData,
        columns: PendingRequisitionItemColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    // Loading State
    if (isLoading) {
        return (
            <div className="max-w-6xl mx-auto p-6 space-y-6">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
        );
    }

    // Error State
    if (error || !requisition) {
        return (
            <div className="max-w-6xl mx-auto p-6 text-center mt-20">
                <h2 className="text-2xl font-bold text-foreground">Requisition Not Found</h2>
                <p className="text-muted-foreground mt-2">The requested material order could not be located.</p>
                <Button onClick={() => navigate(-1)} variant="outline" className="mt-6">Go Back</Button>
            </div>
        );
    }

    // Inline Handlers so they can redirect you immediately
    const handleApprove = () => {
        updateRequisition(
            { requisitionId: requisition.id, action: "APPROVE" },
            { onSuccess: () => navigate(`/${membership?.slug}`) }
        );
    };

    const handleReject = () => {
        updateRequisition(
            { requisitionId: requisition.id, action: "REJECT" },
            { onSuccess: () => navigate(`/${membership?.slug}`) }
        );
    };

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 h-full">
            
            {/* Top Navigation */}
            <div>
                <Button 
                    variant="ghost" 
                    onClick={() => navigate(-1)} 
                    className="text-muted-foreground hover:text-foreground pl-0 -ml-2"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Button>
            </div>

            {/* Header Info Card */}
            <Card className="p-6 sm:p-0 shadow-none border-none ">
                <div className="flex flex-col md:flex-row justify-between gap-6 md:items-start">
                    
                    <div className="flex gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-widest rounded-full">
                                    Pending Review
                                </span>
                                <span className="text-xs font-mono text-muted-foreground">
                                    {new Date(requisition.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                                {requisition.title}
                            </h1>
                            <p className="text-sm font-medium text-muted-foreground">
                                Project: <span className="text-foreground">{requisition.projectName}</span> 
                                <span className="mx-2">•</span> 
                                {requisition.phaseName}
                            </p>
                        </div>
                    </div>

                    <div className="md:text-right bg-muted/30 p-4 rounded-lg md:bg-transparent md:p-0">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
                            Total Requested Budget
                        </p>
                        <p className="text-3xl font-mono font-black text-foreground">
                            ${requisition.budget.toLocaleString()}
                        </p>
                    </div>
                </div>
            </Card>

            {/* The Items Table Container */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-foreground tracking-tight">
                        Material Breakdown
                    </h3>
                    <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                        {requisition.items.length} Items
                    </span>
                </div>
                
                {/* Renders your exact existing Table! */}
                <PendingRequisitionItemTable table={table} />
            </div>

            {/* Action Footer */}
            <div className="flex flex-col-reverse sm:flex-row justify-end items-center gap-3 mt-6 pt-6 border-t border-border/60">
                <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={isUpdating}
                    className="w-full sm:w-auto flex items-center gap-2 font-sans px-6"
                >
                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                    <span className="text-sm">Reject Requisition</span>
                </Button>

                <Button
                    onClick={handleApprove}
                    disabled={isUpdating}
                    className="w-full sm:w-auto flex items-center gap-2 bg-green-700 text-white hover:bg-green-800 font-sans px-6"
                >
                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    <span className="text-sm">Approve Requisition</span>
                </Button>
            </div>
            
        </div>
    );
};

export default IndividualRequisitionAcceptancePage; 