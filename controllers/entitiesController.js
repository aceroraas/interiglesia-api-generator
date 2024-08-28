import { generateHash } from "../services/generateHash.js";
import { prisma } from "../services/prismaClient.js";

export const createEntity = async (req, res) => {
   try {
      const { name, legalIdentificationNumber } = req.body;
      if (!name || !legalIdentificationNumber) {
         return res.status(400).json({ error: 'Faltan parámetros: name y legalIdentificationNumber son requeridos' });
      }
      const hashId = generateHash(16);
      const entity = await prisma.entity.create({ data: { name, legalIdentificationNumber, hashId } });
      res.json(entity);
   } catch (error) {
      if (error instanceof prisma.Prisma.PrismaClientKnownRequestError) {
         res.status(400).json({ error: 'Error en los parámetros' });
      } else {
         res.status(422).json({ error: 'No se pudo procesar' });
      }
   }
}


export const getAllEntities = async (req, res) => {
   try {
      const entities = await prisma.entity.findMany();
      res.json(entities);
   } catch (error) {
      res.status(422).json({ error: 'No se pudo procesar' });
   }
}