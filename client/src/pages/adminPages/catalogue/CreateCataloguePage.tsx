import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { createCatalogueSchema, type CreateCatalogueInput } from "@/features/catalogue/catalogueSchema";
import { useCreateCatalogue } from "@/features/catalogue/hooks/useCatalogue";
import { useGetFormOptions } from "@/features/catalogue/hooks/useFormOptions";

const CreateCataloguePage = () => {
  const navigate = useNavigate();
  const [showNewSupplier, setShowNewSupplier] = useState(false);
  const [showNewLocation, setShowNewLocation] = useState(false);

  // Fetch suppliers and locations in one request
  const { data: formOptions, isLoading: loadingFormOptions } = useGetFormOptions();
  const createMutation = useCreateCatalogue();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCatalogueInput>({
    resolver: zodResolver(createCatalogueSchema),
    defaultValues: {
      name: "",
      defaultLeadTime: 0,
      supplier: {
        truePrice: 0,
        standardRate: 0,
        leadTimeDays: 0,
      },
      inventory: {
        quantityOnHand: 0,
        averageUnitCost: 0,
      },
    },
  });

  const onSubmit = (data: CreateCatalogueInput) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        navigate(-1);
      },
    });
  };

  return (
    <div className="flex h-full flex-col px-4 pb-4 pt-2 font-sans">
      <div className="mb-4 border-b border-border/70 pb-3">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Create Catalogue Item
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl space-y-8 pb-8 pr-4">
          {/* Base Details Section */}
          <section>
            <h2 className="mb-4 font-sans text-lg font-semibold text-foreground">
              Base Details
            </h2>
            <FieldGroup className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field>
                <FieldLabel className="font-sans text-sm text-muted-foreground">
                  Item Name
                </FieldLabel>
                <Input
                  {...register("name")}
                  className="font-display text-sm"
                  placeholder="Enter item name"
                />
                {errors.name && (
                  <FieldError>{errors.name.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel className="font-sans text-sm text-muted-foreground">
                  Category
                </FieldLabel>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="font-display text-sm">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MATERIALS">Materials</SelectItem>
                        <SelectItem value="LABOUR">Labour</SelectItem>
                        <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                        <SelectItem value="SUBCONTRACTORS">Subcontractors</SelectItem>
                        <SelectItem value="TRANSPORT">Transport</SelectItem>
                        <SelectItem value="OVERHEAD">Overhead</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && (
                  <FieldError>{errors.category.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel className="font-sans text-sm text-muted-foreground">
                  Unit of Measurement
                </FieldLabel>
                <Controller
                  name="unit"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="font-display text-sm">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NOS">NOS</SelectItem>
                        <SelectItem value="BAG">BAG</SelectItem>
                        <SelectItem value="ROLL">ROLL</SelectItem>
                        <SelectItem value="BUNDLE">BUNDLE</SelectItem>
                        <SelectItem value="SET">SET</SelectItem>
                        <SelectItem value="PAIR">PAIR</SelectItem>
                        <SelectItem value="KG">KG</SelectItem>
                        <SelectItem value="MT">MT</SelectItem>
                        <SelectItem value="QUINTAL">QUINTAL</SelectItem>
                        <SelectItem value="CUM">CUM</SelectItem>
                        <SelectItem value="CFT">CFT</SelectItem>
                        <SelectItem value="LITRE">LITRE</SelectItem>
                        <SelectItem value="SQM">SQM</SelectItem>
                        <SelectItem value="SQFT">SQFT</SelectItem>
                        <SelectItem value="RMT">RMT</SelectItem>
                        <SelectItem value="RFT">RFT</SelectItem>
                        <SelectItem value="DAY">DAY</SelectItem>
                        <SelectItem value="HOUR">HOUR</SelectItem>
                        <SelectItem value="MONTH">MONTH</SelectItem>
                        <SelectItem value="TRIP">TRIP</SelectItem>
                        <SelectItem value="LS">LS</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.unit && (
                  <FieldError>{errors.unit.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel className="font-sans text-sm text-muted-foreground">
                  Default Lead Time (Days)
                </FieldLabel>
                <Input
                  type="number"
                  {...register("defaultLeadTime", { valueAsNumber: true })}
                  className="font-mono text-sm tabular-nums"
                  placeholder="0"
                />
                {errors.defaultLeadTime && (
                  <FieldError>{errors.defaultLeadTime.message}</FieldError>
                )}
              </Field>
            </FieldGroup>
          </section>

          {/* Supplier Info Section */}
          <section>
            <h2 className="mb-4 font-sans text-lg font-semibold text-foreground">
              Supplier Information
            </h2>
            <FieldGroup className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field className="md:col-span-2">
                <FieldLabel className="font-sans text-sm text-muted-foreground">
                  Supplier
                </FieldLabel>
                <Controller
                  name="supplier.id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) => {
                        if (value === "CREATE_NEW") {
                          setShowNewSupplier(true);
                          field.onChange(undefined);
                        } else {
                          setShowNewSupplier(false);
                          field.onChange(value);
                        }
                      }}
                      value={field.value}
                    >
                      <SelectTrigger className="font-display text-sm">
                        <SelectValue placeholder="Select supplier or create new" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CREATE_NEW">+ Create New Supplier</SelectItem>
                        {loadingFormOptions ? (
                          <SelectItem value="loading" disabled>Loading suppliers...</SelectItem>
                        ) : (
                          formOptions?.data.suppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              {supplier.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.supplier?.name && (
                  <FieldError>{errors.supplier.name.message}</FieldError>
                )}
              </Field>

              {showNewSupplier && (
                <Field className="md:col-span-2">
                  <FieldLabel className="font-sans text-sm text-muted-foreground">
                    New Supplier Name
                  </FieldLabel>
                  <Input
                    {...register("supplier.name")}
                    className="font-display text-sm"
                    placeholder="Enter supplier name"
                  />
                  {errors.supplier?.name && (
                    <FieldError>{errors.supplier.name.message}</FieldError>
                  )}
                </Field>
              )}

              <Field>
                <FieldLabel className="font-sans text-sm text-muted-foreground">
                  True Price
                </FieldLabel>
                <Input
                  type="number"
                  step="any"
                  {...register("supplier.truePrice", { valueAsNumber: true })}
                  className="font-mono text-sm tabular-nums"
                  placeholder="0.00"
                />
                {errors.supplier?.truePrice && (
                  <FieldError>{errors.supplier.truePrice.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel className="font-sans text-sm text-muted-foreground">
                  Standard Rate
                </FieldLabel>
                <Input
                  type="number"
                  step="any"
                  {...register("supplier.standardRate", { valueAsNumber: true })}
                  className="font-mono text-sm tabular-nums"
                  placeholder="0.00"
                />
                {errors.supplier?.standardRate && (
                  <FieldError>{errors.supplier.standardRate.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel className="font-sans text-sm text-muted-foreground">
                  Lead Time (Days)
                </FieldLabel>
                <Input
                  type="number"
                  {...register("supplier.leadTimeDays", { valueAsNumber: true })}
                  className="font-mono text-sm tabular-nums"
                  placeholder="0"
                />
                {errors.supplier?.leadTimeDays && (
                  <FieldError>{errors.supplier.leadTimeDays.message}</FieldError>
                )}
              </Field>
            </FieldGroup>
          </section>

          {/* Inventory Info Section */}
          <section>
            <h2 className="mb-4 font-sans text-lg font-semibold text-foreground">
              Inventory Information (Optional)
            </h2>
            <FieldGroup className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field className="md:col-span-2">
                <FieldLabel className="font-sans text-sm text-muted-foreground">
                  Location
                </FieldLabel>
                <Controller
                  name="inventory.locationId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) => {
                        if (value === "CREATE_NEW") {
                          setShowNewLocation(true);
                          field.onChange(undefined);
                        } else {
                          setShowNewLocation(false);
                          field.onChange(value);
                        }
                      }}
                      value={field.value}
                    >
                      <SelectTrigger className="font-display text-sm">
                        <SelectValue placeholder="Select location or create new" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CREATE_NEW">+ Create New Location</SelectItem>
                        {loadingFormOptions ? (
                          <SelectItem value="loading" disabled>Loading locations...</SelectItem>
                        ) : (
                          formOptions?.data.locations.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name} ({location.type})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.inventory?.locationName && (
                  <FieldError>{errors.inventory.locationName.message}</FieldError>
                )}
              </Field>

              {showNewLocation && (
                <>
                  <Field>
                    <FieldLabel className="font-sans text-sm text-muted-foreground">
                      New Location Name
                    </FieldLabel>
                    <Input
                      {...register("inventory.locationName")}
                      className="font-display text-sm"
                      placeholder="Enter location name"
                    />
                    {errors.inventory?.locationName && (
                      <FieldError>{errors.inventory.locationName.message}</FieldError>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel className="font-sans text-sm text-muted-foreground">
                      Location Type
                    </FieldLabel>
                    <Controller
                      name="inventory.locationType"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="font-display text-sm">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SITE">SITE</SelectItem>
                            <SelectItem value="WAREHOUSE">WAREHOUSE</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.inventory?.locationType && (
                      <FieldError>{errors.inventory.locationType.message}</FieldError>
                    )}
                  </Field>
                </>
              )}

              <Field>
                <FieldLabel className="font-sans text-sm text-muted-foreground">
                  Quantity on Hand
                </FieldLabel>
                <Input
                  type="number"
                  step="any"
                  {...register("inventory.quantityOnHand", { valueAsNumber: true })}
                  className="font-mono text-sm tabular-nums"
                  placeholder="0"
                />
                {errors.inventory?.quantityOnHand && (
                  <FieldError>{errors.inventory.quantityOnHand.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel className="font-sans text-sm text-muted-foreground">
                  Average Unit Cost
                </FieldLabel>
                <Input
                  type="number"
                  step="any"
                  {...register("inventory.averageUnitCost", { valueAsNumber: true })}
                  className="font-mono text-sm tabular-nums"
                  placeholder="0.00"
                />
                {errors.inventory?.averageUnitCost && (
                  <FieldError>{errors.inventory.averageUnitCost.message}</FieldError>
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
              disabled={createMutation.isPending}
              className="bg-green-700 font-sans text-white hover:bg-green-800"
            >
              {createMutation.isPending && <Spinner className="mr-2" />}
              {createMutation.isPending ? "Creating..." : "Create Item"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateCataloguePage;
