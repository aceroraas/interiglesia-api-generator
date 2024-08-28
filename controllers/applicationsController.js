import { prisma } from "../services/prismaClient.js";

export const createApp = async (res, req) => {
   try {
      const { name, gitUrl, softwareVersion, commitHash } = req.body;
      if (!name || !gitUrl || !softwareVersion || !commitHash) {
         return res.status(400).json({ error: 'Faltan parámetros: name, gitUrl, softwareVersion y commitHash son requeridos' });
      }
      const application = await prisma.application.create({ data: { name, gitUrl, softwareVersion, commitHash } });
      res.json(application);
   } catch (error) {
      if (error instanceof prisma.Prisma.PrismaClientKnownRequestError) {
         res.status(400).json({ error: 'Error en los parámetros' });
      } else {
         res.status(422).json({ error: 'No se pudo procesar' });
      }
   }
}

export const getApps = async (res) => {
   try {
      const applications = await prisma.application.findMany();
      res.json(applications);
   } catch (error) {
      res.status(422).json({ error: 'No se pudo procesar' });
   }
}