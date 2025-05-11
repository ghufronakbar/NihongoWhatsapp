/*
  Warnings:

  - Added the required column `day` to the `Kanji` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Kanji" ADD COLUMN     "day" INTEGER NOT NULL;
