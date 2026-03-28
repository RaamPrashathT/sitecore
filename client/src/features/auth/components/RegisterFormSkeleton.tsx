import { Skeleton } from "@/components/ui/skeleton"

export function RegistrationFormSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header Skeleton */}
      <div className="flex flex-col items-center gap-2 text-center">
        <Skeleton className="h-8 w-48" /> {/* "Create an account" text */}
        <Skeleton className="h-4 w-64" /> {/* "Registering as..." text */}
      </div>

      <div className="space-y-4">
        {/* Email Field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" /> {/* Label */}
          <Skeleton className="h-10 w-full" /> {/* Input */}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" /> {/* Label */}
          <Skeleton className="h-10 w-full" /> {/* Input */}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" /> {/* Label */}
          <Skeleton className="h-10 w-full" /> {/* Input */}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Separator */}
        <div className="flex items-center gap-4 py-2">
          <div className="h-px flex-1 bg-muted" />
          <Skeleton className="h-4 w-24" />
          <div className="h-px flex-1 bg-muted" />
        </div>

        {/* Google Button */}
        <Skeleton className="h-10 w-full" />

        {/* Footer Link */}
        <div className="flex justify-center pt-2">
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
    </div>
  )
}