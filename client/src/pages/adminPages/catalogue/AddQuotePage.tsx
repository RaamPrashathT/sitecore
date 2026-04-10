import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { createQuoteSchema, type CreateQuoteInput } from "@/features/catalogue/catalogueSchema";
import { useCreateQuote } from "@/features/catalogue/hooks/useCatalogue";
import { useGetSuppliers } from "@/features/catalogue/hooks/useSuppliers";

const AddQuotePage = () => {
  const navigate = useNavigate();
  const { catalogueId } = useParams();
  
  const { data: suppliersData } = useGetSuppliers();
  const createQuoteMutation = useCreateQuote(catalogueId || "");

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateQuoteInput>({
    resolver: zodResolver(createQuoteSchema),
    defaultValues: {
      truePrice: 0,
      standardRate: 0,
      leadTimeDays: 0,
    },
  });

  const onSubmit = (data: CreateQuoteInput) => {
    createQuoteMutation.mutate(data, {
      onSuccess: () => {
        navigate(-1);
      },
    });
  };

  return (
    <div className="flex h-full flex-col px-4 pb-4 pt-2 font-sans">
      <div className="mb-4 border-b border-border/70 pb-3">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Add Supplier Quote
        </h1>
        <p className="mt-1 font-display text-sm text-muted-foreground">
          Add a new supplier quote for this catalogue item
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-auto">
        <div className="mx-auto max-w-4xl space-y-8 pb-8">
          <section>
            <h2 className="mb-4 font-sans text-lg font-semibold text-foreground">
              Quote Information
            </h2>
            <FieldGroup className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field className="md:col-span-2">
                <FieldLabel className="font-sans text-sm text-muted-foreground">
                  Supplier
                </FieldLabel>
                <Controller
                  name="supplierId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="font-display text-sm">
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliersData?.data.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.supplierId && (
                  <FieldError>{errors.supplierId.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel className="font-sans text-sm text-muted-foreground">
                  True Price
                </FieldLabel>
                <Input
                  type="number"
                  step="any"
                  {...register("truePrice", { valueAsNumber: true })}
                  className="font-mono text-sm tabular-nums"
                  placeholder="0.00"
                />
                {errors.truePrice && (
                  <FieldError>{errors.truePrice.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel className="font-sans text-sm text-muted-foreground">
                  Standard Rate
                </FieldLabel>
                <Input
                  type="number"
                  step="any"
                  {...register("standardRate", { valueAsNumber: true })}
                  className="font-mono text-sm tabular-nums"
                  placeholder="0.00"
                />
                {errors.standardRate && (
                  <FieldError>{errors.standardRate.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel className="font-sans text-sm text-muted-foreground">
                  Lead Time (Days)
                </FieldLabel>
                <Input
                  type="number"
                  {...register("leadTimeDays", { valueAsNumber: true })}
                  className="font-mono text-sm tabular-nums"
                  placeholder="0"
                />
                {errors.leadTimeDays && (
                  <FieldError>{errors.leadTimeDays.message}</FieldError>
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
              disabled={createQuoteMutation.isPending}
              className="bg-green-700 font-sans text-white hover:bg-green-800"
            >
              {createQuoteMutation.isPending && <Spinner className="mr-2" />}
              {createQuoteMutation.isPending ? "Adding..." : "Add Quote"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddQuotePage;
