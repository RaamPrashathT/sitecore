import { useState } from "react";
import { useAllOrganizations } from "@/hooks/useAllOrganizations";
import { useDebounce } from "@/hooks/useDebounce";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SelectOrgListItem from "./SelectOrgListItem";

const SelectOrgList = () => {
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);

    const debouncedQuery = useDebounce(query, 400);

    const { data, isLoading, error } = useAllOrganizations(
        debouncedQuery,
        page,
    );

    if (error) {
        return (
            <p className="text-sm text-red-500">Failed to load organizations</p>
        );
    }

    return (
        <div>
            <Input
                placeholder="Search organizations..."
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                }}
            />

            {isLoading ? (
                <p className="text-sm text-gray-400">Loading...</p>
            ) : (
                <ul className="border  divide-y">
                    {data?.items.map((org, index) => (
                        <SelectOrgListItem
                            key={org.id}
                            index={index}
                            name={org.name}
                            slug={org.slug}
                            id={org.id}
                        />
                    ))}
                </ul>
            )}

            <div className="flex items-center justify-between pt-2">
                <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                >
                    Previous
                </Button>

                <span className="text-sm text-muted-foreground">
                    Page {data?.currentPage} of {data?.totalPages}
                </span>

                <Button
                    variant="outline"
                    disabled={!data?.hasNextPage}
                    onClick={() => setPage((p) => p + 1)}
                >
                    Next
                </Button>
            </div>
        </div>
    );
};

export default SelectOrgList;
