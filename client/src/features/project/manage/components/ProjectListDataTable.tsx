import { flexRender } from "@tanstack/react-table";
import type { Table as ReactTableType } from "@tanstack/react-table";
import type { ProjectListType } from "../hooks/useProjectList";
import { useNavigate } from "react-router-dom";
import EmptyProjectList from "./EmptyProjectList";

interface ProjectListDataTableProps {
    table: ReactTableType<ProjectListType>;
    slug: string;
}

const ProjectListDataTable = ({ table, slug }: ProjectListDataTableProps) => {
    const navigate = useNavigate();
    const hasRows = table.getRowModel().rows.length > 0;

    return (
        <div className="overflow-x-auto">
            <div className="flex border-b border-border/80 bg-muted/40">
                {table.getFlatHeaders().map((header) => (
                    <div
                        key={header.id}
                        style={{ flex: 1 }}
                        className="h-12 px-4 flex items-center font-display text-sm font-normal tracking-wide text-foreground first:rounded-tl-lg last:rounded-tr-lg"
                    >
                        {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                        )}
                    </div>
                ))}
            </div>

            {hasRows ? (
                <div className="flex flex-col">
                    {table.getRowModel().rows.map((row, index) => (
                        <div
                            key={row.id}
                            onClick={() => navigate(`/${slug}/${row.original.slug}`)}
                            className={`flex transition-colors hover:bg-green-50/50 cursor-pointer ${
                                index !== table.getRowModel().rows.length - 1 ? "border-b border-border/40" : ""
                            }`}
                        >
                            {row.getVisibleCells().map((cell) => (
                                <div
                                    key={cell.id}
                                    style={{ flex: 1 }}
                                    className="flex items-center px-4"
                                >
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext(),
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center py-16">
                    <EmptyProjectList />
                </div>
            )}
        </div>
    );
};

export default ProjectListDataTable;
