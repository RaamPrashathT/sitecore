import { useDebounce } from "@/hooks/useDebounce";
import { useMembership } from "@/hooks/useMembership";
import { getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useState } from "react";
import ClientSearch from "./ClientSearch";
import ClientPagination from "./ClientPagination";
import ClientTable from "./ClientTable";
import { useClients } from "@/hooks/useClients";
import { ClientColumns as columns } from "./ClientColumns";
import ClientEmpty from "./ClientEmpty";
import ClientInviteButton from "./ClientInvite/ClientInviteButton";

const ClientMain = () => {
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const debouncedSearch = useDebounce(globalFilter, 200);

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 24,
    });
    

    const { data: membership, isLoading: membershipLoading } = useMembership();
    const { data: clients, isLoading: clientsLoading } =
        useClients(
            membership?.id,
            pagination.pageIndex,
            pagination.pageSize,
            debouncedSearch,
        );

    const table = useReactTable({
        data: clients?.data ?? [],
        rowCount: clients?.totalCount ?? 0,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onPaginationChange: setPagination,
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onGlobalFilterChange: setGlobalFilter,
        manualFiltering: true,
        manualSorting: true,
        manualPagination: true,
        getRowId: (row) => row.id,
        state: {
            globalFilter,
            pagination,
        },
    });

    const isInitialLoading =
        membershipLoading || (clientsLoading && !clients);

    if (isInitialLoading) return <></>;
    if (!membership) return <div className="px-4 py-6 font-sans text-sm text-muted-foreground">No access</div>;
    if (!clients || clients.totalCount === 0) return <ClientEmpty slug={membership.slug}/>;
    
    return (
        <div className="px-4 pb-4 pt-2 flex h-full flex-col font-sans">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
                <ClientInviteButton />
                <ClientSearch table={table} />
            </div>
            <div className="rounded-xl border border-border/70 bg-background">
                <ClientTable table={table} />
            </div>
            <div className="mt-auto pt-4">
                <ClientPagination table={table} />
            </div>
        </div>
    );
};

export default ClientMain;