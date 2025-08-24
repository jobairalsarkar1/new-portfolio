import { User, Skill, Project } from "@prisma/client";

declare global {
  type TUser = User;
  type TSkill = Skill;
  type TProject = Project;

  interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
  }
}

export {};
