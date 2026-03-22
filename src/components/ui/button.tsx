import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 backdrop-blur-md",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-[0_4px_24px_hsla(158,42%,36%,0.35),inset_0_1px_0_hsla(0,0%,100%,0.18)] hover:shadow-[0_10px_36px_hsla(158,42%,36%,0.45),inset_0_1px_0_hsla(0,0%,100%,0.22)] hover:-translate-y-0.5",
        destructive:
          "bg-destructive/90 text-destructive-foreground backdrop-blur-lg border border-destructive/30 shadow-[0_4px_20px_hsla(0,72%,55%,0.25)] hover:bg-destructive hover:shadow-[0_8px_30px_hsla(0,72%,55%,0.35)] hover:-translate-y-0.5",
        outline:
          "border border-border/60 bg-card/40 backdrop-blur-xl hover:bg-card/60 hover:border-primary/40 hover:shadow-[0_4px_20px_hsla(148,40%,50%,0.12)] hover:-translate-y-0.5 text-foreground",
        secondary:
          "bg-muted/50 text-foreground backdrop-blur-lg border border-border/40 hover:bg-muted/70 hover:border-primary/30 hover:shadow-[0_4px_16px_hsla(148,35%,50%,0.10)]",
        ghost:
          "hover:bg-accent/40 hover:text-accent-foreground hover:backdrop-blur-md",
        link: "text-primary underline-offset-4 hover:underline backdrop-blur-none",
        glass:
          "bg-card/35 backdrop-blur-2xl border border-border/50 text-foreground shadow-[0_2px_16px_hsla(148,35%,40%,0.10)] hover:bg-card/55 hover:border-primary/40 hover:shadow-[0_6px_24px_hsla(148,35%,40%,0.16)] hover:-translate-y-0.5",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-xl px-3.5",
        lg: "h-12 rounded-2xl px-8",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
