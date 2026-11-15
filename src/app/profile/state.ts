import type { FieldErrors } from "@/lib/validation";

export type ProfileActionState = {
  ok?: boolean;
  message?: string;
  errors?: FieldErrors;
};

export const initialProfileState: ProfileActionState = {};
