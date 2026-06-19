/*
  Warnings:

  - Added the required column `userId` to the `Memo` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Memo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "starred" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER NOT NULL
);
INSERT INTO "new_Memo" ("createdAt", "id", "starred", "tags", "text", "title", "updatedAt", "userId") SELECT "createdAt", "id", "starred", "tags", "text", "title", "updatedAt", 1 FROM "Memo";
DROP TABLE "Memo";
ALTER TABLE "new_Memo" RENAME TO "Memo";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
