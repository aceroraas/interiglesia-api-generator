import { prisma } from "../services/prismaClient.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'
import { getJwtSecret } from "../services/jwtSecret.js";


export const loginController = async (req, res) => {
   try {
      const JWT_SECRET = getJwtSecret();
      const { username, password } = req.body;
      if (!username || !password) {
         return res.status(400).json({ error: 'Faltan credenciales' });
      }

      const user = await prisma.user.findUnique({ where: { username } });
      if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
         return res.status(401).json({ error: 'Credenciales incorrectas' });
      }

      // Verificar si el usuario ya tiene una sesión activa
      const activeSession = await prisma.session.findFirst({
         where: {
            userId: user.id,
            expiresAt: { gt: new Date() } // La sesión no ha expirado
         }
      });

      if (activeSession) {
         return res.status(200).json({ message: 'Ya tienes una sesión activa', token: activeSession.jwtToken });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
      await prisma.session.create({ data: { userId: user.id, jwtToken: token, expiresAt: new Date(Date.now() + 3600000) } });
      res.json({ token });
   } catch (error) {
      console.error(error);
      res.status(422).json({ error: 'No se pudo procesar', details: error.message });
   }
}

