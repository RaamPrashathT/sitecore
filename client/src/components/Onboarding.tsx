import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { X } from "lucide-react";

type FormData = {
  username: string;
  phone: string;
  profilePic: File | null;
};

const Onboarding = () => {
  const { register, handleSubmit, setValue } = useForm<FormData>();
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      // TODO: send data to backend
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  const handleImageClick = () => {
    fileRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValue("profilePic", file);
    setPreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setValue("profilePic", null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-muted/30">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm space-y-6 bg-background p-6 rounded-2xl shadow-sm border"
      >
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold">Complete your profile</h1>
          <p className="text-sm text-muted-foreground">
            Just a few quick details to get started
          </p>
        </div>

        {/* Avatar Upload */}
        <div className="flex justify-center">
          <div className="relative group">
            <div
              onClick={handleImageClick}
              className="cursor-pointer"
            >
              <Avatar className="h-20 w-20">
                {preview ? (
                  <AvatarImage src={preview} />
                ) : (
                  <AvatarFallback className="text-lg">+</AvatarFallback>
                )}
              </Avatar>

              {/* Hover overlay */}
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs">
                Upload
              </div>
            </div>

            {/* Remove button */}
            {preview && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-background border rounded-full p-1 shadow hover:bg-muted transition"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            ref={fileRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Username</label>
            <Input
              placeholder="Enter your name"
              {...register("username", { required: true })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Phone number</label>
            <Input
              placeholder="Enter your phone number"
              {...register("phone", { required: true })}
            />
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Saving..." : "Continue"}
        </Button>
      </form>
    </div>
  );
};

export default Onboarding;