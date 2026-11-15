import type { FieldErrors } from "@/lib/validation";

export type EventActionState = {
  ok?: boolean;
  message?: string;
  errors?: FieldErrors;
};

export const initialEventActionState: EventActionState = {};
