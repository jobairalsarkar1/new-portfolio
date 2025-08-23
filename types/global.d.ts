import { User } from "@prisma/client";

declare global {
  type TUser = User;

  interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
  }
}

export {};
