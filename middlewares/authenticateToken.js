import { prisma } from "../services/prismaClient.js";
import { checkAndDeleteExpiredInstallToken } from "./checkAndDeleteExpiredInstallToken.js";
import { deleteExpiredAuthToken } from "./deleteExpiredAuthToken.js";
const JWT_SECRET = process.env.JWT_SECRET;


export const authenticateToken = async (req, res, next) => {
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