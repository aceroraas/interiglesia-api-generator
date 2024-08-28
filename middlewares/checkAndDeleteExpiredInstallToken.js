import { prisma } from "../services/prismaClient.js";

export const checkAndDeleteExpiredInstallToken = async (token) => {
  const tokenRecord = await prisma.installationToken.findUnique({
    where: { token },
  });

  if (tokenRecord && new Date() > new Date(tokenRecord.expiresAt)) {
    await prisma.installationToken.delete({
      where: { token },
    });
    return true; // Token was expired and deleted
  }
  return false; // Token is still valid
};
