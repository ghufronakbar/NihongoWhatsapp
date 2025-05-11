-- CreateEnum
CREATE TYPE "KanjiLevel" AS ENUM ('N1', 'N2', 'N3', 'N4', 'N5');

-- CreateTable
CREATE TABLE "Kanji" (
    "id" SERIAL NOT NULL,
    "kanji" TEXT NOT NULL,
    "mean" TEXT NOT NULL,
    "level" "KanjiLevel" NOT NULL,
    "onyomi" TEXT[],
    "kunyomi" TEXT[],

    CONSTRAINT "Kanji_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanjiWord" (
    "id" SERIAL NOT NULL,
    "word" TEXT NOT NULL,
    "kana" TEXT NOT NULL,
    "mean" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "kanjiId" INTEGER NOT NULL,

    CONSTRAINT "KanjiWord_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "KanjiWord" ADD CONSTRAINT "KanjiWord_kanjiId_fkey" FOREIGN KEY ("kanjiId") REFERENCES "Kanji"("id") ON DELETE CASCADE ON UPDATE CASCADE;
