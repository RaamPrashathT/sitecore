import { Skeleton } from "@/components/ui/skeleton"

export function LoginFormSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-sm mx-auto">
      {/* Header Skeleton */}
      <div className="flex flex-col items-center gap-2 text-center">
        <Skeleton className="h-8 w-56" /> {/* "Login to your account" */}
        <Skeleton className="h-4 w-64" /> {/* Optional "Logging in as..." subtitle */}
      </div>

      <div className="space-y-4">
        {/* Email Field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" /> {/* Label: Email */}
          <Skeleton className="h-10 w-full" /> {/* Input */}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" /> {/* Label: Password */}
          <Skeleton className="h-10 w-full" /> {/* Input */}
        </div>

        {/* Login Button */}
        <div className="pt-2">
          <Skeleton className="h-10 w-full" />
        </div>

        {/* FieldSeparator Mimic */}
        <div className="flex items-center gap-4 py-2">
          <div className="h-px flex-1 bg-muted" />
          <Skeleton className="h-3 w-28" /> {/* "Or continue with" */}
          <div className="h-px flex-1 bg-muted" />
        </div>

        {/* Google Login Button */}
        <Skeleton className="h-10 w-full" />

        {/* Footer link */}
        <div className="flex justify-center pt-2">
          <Skeleton className="h-4 w-52" /> {/* "Don't have an account? Register" */}
        </div>
      </div>
    </div>
  )
}