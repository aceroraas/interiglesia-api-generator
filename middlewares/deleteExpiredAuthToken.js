import { prisma } from "../services/prismaClient.js";

export const deleteExpiredAuthToken = async (token) => {
  await prisma.session.delete({
    where: { jwtToken: token },
  });
};
