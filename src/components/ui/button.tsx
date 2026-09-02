import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-md text-[13px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-qs-accent/60",
  {
    variants: {
      variant: {
        primary: "bg-qs-accent text-qs-bg hover:bg-[#5ff0e2]",
        secondary: "bg-qs-elevated text-qs-text border border-qs-border hover:bg-qs-hover",
        ghost: "text-qs-muted hover:text-qs-text hover:bg-qs-hover",
        danger: "bg-qs-danger text-qs-bg hover:opacity-90",
        warning: "bg-qs-warning text-qs-bg hover:opacity-90",
      },
      size: {
        sm: "h-7 px-2.5",
        md: "h-8 px-3",
        lg: "h-9 px-3.5",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  },
);

type Props = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: Props) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
