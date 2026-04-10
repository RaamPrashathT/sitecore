import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { addInventorySchema, type AddInventoryInput } from "@/features/catalogue/catalogueSchema";
import { useAddInventory } from "@/features/catalogue/hooks/useCatalogue";
import { useGetFormOptions } from "@/features/catalogue/hooks/useFormOptions";

const AddInventoryPage = () => {
  const navigate = useNavigate();
  const { catalogueId } = useParams();
  const [showNewLocation, setShowNewLocation] = useState(false);
  
  const { data: formOptions, isLoading: isLoadingOptions } = useGetFormOptions();
  const addInventoryMutation = useAddInventory(catalogueId || "");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddInventoryInput>({
    resolver: zodResolver(addInventorySchema),
  });

  const selectedLocationId = watch("locationId");
  const locationType = watch("locationType");

  const onSubmit = (formData: AddInventoryInput) => {
    addInventoryMutation.mutate(formData, {
      onSuccess: () => {
        navigate(-1);
      },
    });
  };

  return (
    <div className="flex h-full flex-col px-4 pb-4 pt-2 font-sans">
      <div className="mb-4 border-b border-border/70 pb-3">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Add Inventory
        </h1>
        <p className="mt-1 font-display text-sm text-muted-foreground">
          Add inventory for this catalogue item
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl space-y-8 pb-8 pr-4">
          <section>
            <h2 className="mb-4 font-sans text-lg font-semibold text-foreground">
              Location Information
            </h2>
            <FieldGroup className="grid grid-cols-1 gap-5">
              {!showNewLocation ? (
                <Field>
                  <FieldLabel className="font-sans text-sm text-muted-foreground">
                    Location
                  </FieldLabel>
                  <Select
                    value={selectedLocationId || ""}
                    onValueChange={(value) => {
                      if (value === "__create_new__") {
                        setShowNewLocation(true);
                        setValue("locationId", undefined);
                      } else {
                        setValue("locationId", value);
                      }
                    }}
                  >
                    <SelectTrigger className="font-display">
                      <SelectValue placeholder="Select a location" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingOptions ? (
                        <SelectItem value="loading" disabled>
                          Loading...
                        </SelectItem>
                      ) : (
                        <>
                          {formOptions?.data?.locations.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name} ({location.type})
                            </SelectItem>
                          ))}
                          <SelectItem value="__create_new__" className="text-green-700 font-semibold">
                            + Create New Location
                          </SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.locationId && (
                    <FieldError>{errors.locationId.message}</FieldError>
                  )}
                </Field>
              ) : (
                <>
                  <Field>
                    <FieldLabel className="font-sans text-sm text-muted-foreground">
                      New Location Name
                    </FieldLabel>
                    <Input
                      {...register("locationName")}
                      className="font-display text-sm"
                      placeholder="Enter location name"
                    />
                    {errors.locationName && (
                      <FieldError>{errors.locationName.message}</FieldError>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel className="font-sans text-sm text-muted-foreground">
                      Location Type
                    </FieldLabel>
                    <Select
                      value={locationType || ""}
                      onValueChange={(value) => setValue("locationType", value as "SITE" | "WAREHOUSE")}
                    >
                      <SelectTrigger className="font-display">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SITE">Site</SelectItem>
                        <SelectItem value="WAREHOUSE">Warehouse</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.locationType && (
                      <FieldError>{errors.locationType.message}</FieldError>
                    )}
                  </Field>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowNewLocation(false);
                      setValue("locationName", undefined);
                      setValue("locationType", undefined);
                    }}
                    className="w-fit font-sans text-muted-foreground"
                  >
                    ← Select Existing Location
                  </Button>
                </>
              )}
            </FieldGroup>
          </section>

          <section>
            <h2 className="mb-4 font-sans text-lg font-semibold text-foreground">
              Inventory Details
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
              disabled={addInventoryMutation.isPending}
              className="bg-green-700 font-sans text-white hover:bg-green-800"
            >
              {addInventoryMutation.isPending && <Spinner className="mr-2" />}
              {addInventoryMutation.isPending ? "Adding..." : "Add Inventory"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddInventoryPage;
