import { getJwtSecret } from "../services/jwtSecret.js";
import { prisma } from "../services/prismaClient.js";
import jwt from 'jsonwebtoken'



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



export const deleteExpiredAuthToken = async (token) => {
   await prisma.session.delete({
      where: { jwtToken: token },
   });
};


export const authenticateToken = async (req, res, next) => {
   const JWT_SECRET = getJwtSecret();
   const authToken = req.header('Authorization')?.split(' ')[1];
   const installToken = req.query.install_token || req.body.install_token;
   if (!authToken && !installToken) return res.sendStatus(401);
   if (installToken) {
      // Verificar y eliminar el token de instalación si está vencido
      const isExpired = await checkAndDeleteExpiredInstallToken(installToken);
      if (isExpired) return res.sendStatus(401); // Token de instalación vencido
      // Si el token de instalación es válido, continuar
      return next();
   }
   if (authToken) {
      jwt.verify(authToken, JWT_SECRET, async (err, user) => {
         if (err) {
            if (err.name === 'TokenExpiredError') {
               await deleteExpiredAuthToken(authToken);
               return res.sendStatus(401);
            }
            return res.sendStatus(403);
         }

         const session = await prisma.session.findUnique({
            where: { jwtToken: authToken },
         });

         if (!session || new Date() > session.expiresAt) {
            await deleteExpiredAuthToken(authToken);
            return res.sendStatus(401);
         }
         req.user = user;
         next();
      });
   }
};

