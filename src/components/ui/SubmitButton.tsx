"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useFormStatus } from "react-dom";

import { buttonStyles, type ButtonSize, type ButtonVariant } from "@/components/ui/Button";

type SubmitButtonProps = Omit<ComponentPropsWithoutRef<"button">, "type"> & {
  children: ReactNode;
  pendingLabel?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

/**
 * Submit button that disables itself and announces its busy state while the
 * enclosing form's Server Action is running, so a double click cannot send two
 * OTP requests.
 */
export function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  size = "md",
  className,
  disabled,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      aria-busy={pending || undefined}
      className={buttonStyles({ variant, size, className })}
      {...props}
    >
      {pending ? (pendingLabel ?? children) : children}
    </button>
  );
}
