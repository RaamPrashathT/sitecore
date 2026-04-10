import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { updateCatalogueSchema, type UpdateCatalogueInput } from "@/features/catalogue/catalogueSchema";
import { useGetCatalogueById, useUpdateCatalogue } from "@/features/catalogue/hooks/useCatalogue";

const EditCataloguePage = () => {
  const navigate = useNavigate();
  const { catalogueId } = useParams();
  
  const { data, isLoading } = useGetCatalogueById(catalogueId || null);
  const updateMutation = useUpdateCatalogue(catalogueId || "");

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateCatalogueInput>({
    resolver: zodResolver(updateCatalogueSchema),
  });

  useEffect(() => {
    if (data?.data) {
      reset({
        name: data.data.name,
        category: data.data.category,
        unit: data.data.unit,
        defaultLeadTime: data.data.defaultLeadTime,
      });
    }
  }, [data, reset]);

  const onSubmit = (formData: UpdateCatalogueInput) => {
    updateMutation.mutate(formData, {
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
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col px-4 pb-4 pt-2 font-sans">
      <div className="mb-4 border-b border-border/70 pb-3">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Edit Catalogue Item
        </h1>
        <p className="mt-1 font-display text-sm text-muted-foreground">
          Update master catalogue information
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-auto">
        <div className="mx-auto max-w-4xl space-y-8 pb-8">
          <section>
            <h2 className="mb-4 font-sans text-lg font-semibold text-foreground">
              Master Information
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
              disabled={updateMutation.isPending}
              className="bg-green-700 font-sans text-white hover:bg-green-800"
            >
              {updateMutation.isPending && <Spinner className="mr-2" />}
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditCataloguePage;
