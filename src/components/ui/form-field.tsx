import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  required = false,
  error,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor} className="flex items-center gap-1">
        {label}
        {required && (
          <span className="text-destructive" aria-hidden="true">*</span>
        )}
      </Label>
      {children}
      {error && (
        <p className="text-sm text-destructive animate-in fade-in slide-in-from-top-1 duration-200" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
