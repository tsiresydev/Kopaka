CREATE TABLE "PlatformBootstrap" (
 "id" VARCHAR(8) PRIMARY KEY CHECK ("id" = 'sprint-1'),
 "schemaVersion" INTEGER NOT NULL CHECK ("schemaVersion" > 0),
 "initializedAt" TIMESTAMPTZ(3) NOT NULL
);
INSERT INTO "PlatformBootstrap" ("id", "schemaVersion", "initializedAt") VALUES ('sprint-1', 1, CURRENT_TIMESTAMP);
