-- AlterTable
ALTER TABLE "public"."Project" ADD COLUMN     "canContact" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "slug" TEXT;
