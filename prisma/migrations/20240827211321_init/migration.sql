-- CreateTable
CREATE TABLE "Entity" (
    "id" SERIAL NOT NULL,
    "hashId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legalIdentificationNumber" TEXT NOT NULL,

    CONSTRAINT "Entity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "gitUrl" TEXT NOT NULL,
    "softwareVersion" TEXT NOT NULL,
    "commitHash" TEXT NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Status" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstallationOperation" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "InstallationOperation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntityApplication" (
    "id" SERIAL NOT NULL,
    "entityId" INTEGER NOT NULL,
    "applicationId" INTEGER NOT NULL,
    "statusId" INTEGER NOT NULL,
    "installedVersion" TEXT NOT NULL,
    "installationHash" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL,

    CONSTRAINT "EntityApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntityInstallationHistory" (
    "id" SERIAL NOT NULL,
    "entityId" INTEGER NOT NULL,
    "applicationId" INTEGER NOT NULL,
    "operationId" INTEGER NOT NULL,
    "statusId" INTEGER NOT NULL,
    "commitHash" TEXT NOT NULL,
    "operationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entityApplicationId" INTEGER NOT NULL,

    CONSTRAINT "EntityInstallationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "jwtToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstallationToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstallationToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Entity_hashId_key" ON "Entity"("hashId");

-- CreateIndex
CREATE UNIQUE INDEX "Status_name_key" ON "Status"("name");

-- CreateIndex
CREATE UNIQUE INDEX "InstallationOperation_name_key" ON "InstallationOperation"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Session_jwtToken_key" ON "Session"("jwtToken");

-- CreateIndex
CREATE UNIQUE INDEX "InstallationToken_token_key" ON "InstallationToken"("token");

-- AddForeignKey
ALTER TABLE "EntityApplication" ADD CONSTRAINT "EntityApplication_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityApplication" ADD CONSTRAINT "EntityApplication_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityApplication" ADD CONSTRAINT "EntityApplication_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityInstallationHistory" ADD CONSTRAINT "EntityInstallationHistory_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityInstallationHistory" ADD CONSTRAINT "EntityInstallationHistory_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityInstallationHistory" ADD CONSTRAINT "EntityInstallationHistory_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "InstallationOperation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityInstallationHistory" ADD CONSTRAINT "EntityInstallationHistory_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityInstallationHistory" ADD CONSTRAINT "EntityInstallationHistory_entityApplicationId_fkey" FOREIGN KEY ("entityApplicationId") REFERENCES "EntityApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
