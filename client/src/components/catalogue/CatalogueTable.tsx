import { useGetCatalogue } from "@/hooks/useGetCatalogs";
import DataTable from "./DataTable";

export default function CatalogueTable({ orgId }: { readonly orgId: string }) {
  const { data, isLoading, isError } = useGetCatalogue(orgId);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Something went wrong.</div>;

  return (
    <div className="px-8 pb-8">
      <DataTable data={data ?? []} />
    </div>
  );
}