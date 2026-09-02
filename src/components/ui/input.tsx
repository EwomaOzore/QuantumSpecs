import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-8 w-full rounded-md border border-qs-border bg-qs-bg px-2.5 text-[13px] text-qs-text placeholder:text-qs-faint outline-none focus:border-qs-accent/50",
        className,
      )}
      {...props}
    />
  );
}
