import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { updateInventorySchema, type UpdateInventoryInput } from "@/features/catalogue/catalogueSchema";
import { useGetCatalogueById, useUpdateInventory } from "@/features/catalogue/hooks/useCatalogue";

const EditInventoryPage = () => {
  const navigate = useNavigate();
  const { catalogueId } = useParams();
  
  const { data, isLoading } = useGetCatalogueById(catalogueId || null);
  
  // For simplicity, we'll edit the first inventory item
  // In a real app, you might want to pass inventoryId as a param
  const inventoryItem = data?.data?.inventoryItems[0];
  const updateInventoryMutation = useUpdateInventory(
    catalogueId || "",
    inventoryItem?.id || ""
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateInventoryInput>({
    resolver: zodResolver(updateInventorySchema),
  });

  useEffect(() => {
    if (inventoryItem) {
      reset({
        quantityOnHand: Number.parseFloat(inventoryItem.quantityOnHand),
        averageUnitCost: Number.parseFloat(inventoryItem.averageUnitCost),
      });
    }
  }, [inventoryItem, reset]);

  const onSubmit = (formData: UpdateInventoryInput) => {
    updateInventoryMutation.mutate(formData, {
      onSuccess: () => {
        navigate(-1);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-full flex-col px-4 pb-4 pt-2">
        <Skeleton className="mb-4 h-10 w-64" />
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (!inventoryItem) {
    return (
      <div className="flex h-full flex-col px-4 pb-4 pt-2 font-sans">
        <div className="mb-4 border-b border-border/70 pb-3">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Edit Inventory
          </h1>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <p className="font-display text-muted-foreground">
            No inventory items found for this catalogue item.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col px-4 pb-4 pt-2 font-sans">
      <div className="mb-4 border-b border-border/70 pb-3">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Edit Inventory
        </h1>
        <p className="mt-1 font-display text-sm text-muted-foreground">
          Update inventory for {inventoryItem.location.name}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-auto">
        <div className="mx-auto max-w-4xl space-y-8 pb-8">
          <section>
            <h2 className="mb-4 font-sans text-lg font-semibold text-foreground">
              Inventory Information
            </h2>
            <FieldGroup className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field>
                <FieldLabel className="font-sans text-sm text-muted-foreground">
                  Quantity on Hand
                </FieldLabel>
                <Input
                  type="number"
                  step="any"
                  {...register("quantityOnHand", { valueAsNumber: true })}
                  className="font-mono text-sm tabular-nums"
                  placeholder="0"
                />
                {errors.quantityOnHand && (
                  <FieldError>{errors.quantityOnHand.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel className="font-sans text-sm text-muted-foreground">
                  Average Unit Cost
                </FieldLabel>
                <Input
                  type="number"
                  step="any"
                  {...register("averageUnitCost", { valueAsNumber: true })}
                  className="font-mono text-sm tabular-nums"
                  placeholder="0.00"
                />
                {errors.averageUnitCost && (
                  <FieldError>{errors.averageUnitCost.message}</FieldError>
                )}
              </Field>
            </FieldGroup>
          </section>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 border-t border-border pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="font-sans"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateInventoryMutation.isPending}
              className="bg-green-700 font-sans text-white hover:bg-green-800"
            >
              {updateInventoryMutation.isPending && <Spinner className="mr-2" />}
              {updateInventoryMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditInventoryPage;
