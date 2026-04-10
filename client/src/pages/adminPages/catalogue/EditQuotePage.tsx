import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { updateQuoteSchema, type UpdateQuoteInput } from "@/features/catalogue/catalogueSchema";
import { useGetCatalogueById, useUpdateQuote, useDeleteQuote } from "@/features/catalogue/hooks/useCatalogue";

const EditQuotePage = () => {
  const navigate = useNavigate();
  const { catalogueId, quoteId } = useParams();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const { data, isLoading } = useGetCatalogueById(catalogueId || null);
  const updateQuoteMutation = useUpdateQuote(catalogueId || "", quoteId || "");
  const deleteQuoteMutation = useDeleteQuote(catalogueId || "");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateQuoteInput>({
    resolver: zodResolver(updateQuoteSchema),
  });

  useEffect(() => {
    if (data?.data && quoteId) {
      const quote = data.data.supplierQuotes.find((q) => q.id === quoteId);
      if (quote) {
        reset({
          truePrice: Number.parseFloat(quote.truePrice),
          standardRate: Number.parseFloat(quote.standardRate),
          leadTimeDays: quote.leadTimeDays,
          validUntil: quote.validUntil,
        });
      }
    }
  }, [data, quoteId, reset]);

  const onSubmit = (formData: UpdateQuoteInput) => {
    updateQuoteMutation.mutate(formData, {
      onSuccess: () => {
        navigate(-1);
      },
    });
  };

  const handleDelete = () => {
    if (!quoteId) return;
    deleteQuoteMutation.mutate(quoteId, {
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

  const quote = data?.data?.supplierQuotes.find((q) => q.id === quoteId);

  return (
    <div className="flex h-full flex-col px-4 pb-4 pt-2 font-sans">
      <div className="mb-4 border-b border-border/70 pb-3">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Edit Supplier Quote
        </h1>
        {quote && (
          <p className="mt-1 font-display text-sm text-muted-foreground">
            Editing quote from {quote.supplier.name}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl space-y-8 pb-8 pr-4">
          <section>
            <h2 className="mb-4 font-sans text-lg font-semibold text-foreground">
              Quote Information
            </h2>
            <FieldGroup className="grid grid-cols-1 gap-5 md:grid-cols-2">
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

              <Field>
                <FieldLabel className="font-sans text-sm text-muted-foreground">
                  Valid Until (Optional)
                </FieldLabel>
                <Input
                  type="datetime-local"
                  {...register("validUntil")}
                  className="font-mono text-sm"
                />
                {errors.validUntil && (
                  <FieldError>{errors.validUntil.message}</FieldError>
                )}
              </Field>
            </FieldGroup>
          </section>

          {/* Form Actions */}
          <div className="flex items-center justify-between border-t border-border pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
              className="border-red-200 font-sans text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Quote
            </Button>
            <div className="flex gap-3">
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
                disabled={updateQuoteMutation.isPending}
                className="bg-green-700 font-sans text-white hover:bg-green-800"
              >
                {updateQuoteMutation.isPending && <Spinner className="mr-2" />}
                {updateQuoteMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="z-50">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-sans">Delete Quote</AlertDialogTitle>
            <AlertDialogDescription className="font-display">
              Are you sure you want to delete this supplier quote? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-sans">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteQuoteMutation.isPending}
              className="bg-red-600 font-sans hover:bg-red-700"
            >
              {deleteQuoteMutation.isPending && <Spinner className="mr-2" />}
              {deleteQuoteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EditQuotePage;
