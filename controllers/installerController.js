import { prisma } from "../services/prismaClient.js";
import { randomBytes } from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export const createInstallerToken = async (res) => {
   try {
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 3600 * 1000); // Token expira en 1 hora
      const newToken = await prisma.installationToken.create({
         data: { token, expiresAt }
      });
      res.json(newToken);
   } catch (error) {
      res.status(500).json({ error: 'No se pudo crear el token' });
   }
}


export const deleteInstallerToken = async (req, res) => {
   try {

      const installToken = req.query.install_token || req.body.install_token;
      if (!installToken) {
         return res.status(400).json({ error: 'Falta el parámetro install_token' });
      }
      await prisma.installationToken.delete({
         where: { token: installToken }
      });
      res.sendStatus(204);
   } catch (error) {
      res.status(500).json({ error: 'No se pudo eliminar el token' });
   }
}


export const getAllIntallerTokens = async (res) => {
   try {
      const tokens = await prisma.installationToken.findMany();
      res.json(tokens);
   } catch (error) {
      res.status(500).json({ error: 'No se pudo obtener los tokens' });
   }
}



export const generateInstallerFile = async (req, res) => {
   const __filename = fileURLToPath(import.meta.url);
   const __dirname = path.dirname(__filename);
   const { entityId, applicationId, tokenId } = req.query;

   if (!entityId || !applicationId || !tokenId) {
      return res.status(400).send('Faltan parámetros');
   }

   try {
      const entity = await prisma.entity.findUnique({
         where: { id: parseInt(entityId) },
      });

      const application = await prisma.application.findUnique({
         where: { id: parseInt(applicationId) },
      });

      const installationToken = await prisma.installationToken.findUnique({
         where: { id: parseInt(tokenId) },
      });

      let apiurl = "";

      if (!entity || !application || !installationToken) {
         return res.status(404).send('Entidad, aplicación o token no encontrado');
      }

      const install_hash = generateInstallHash();
      const entity_hash = entity.hashId;
      const install_token = installationToken.token;
      const github_url = application.gitUrl;

      const installerContent = `
        #!/bin/bash

        # Variables de entorno
        INSTALL_HASH=${install_hash}
        ENTITY_HASH=${entity_hash}
        INSTALL_TOKEN=${install_token}
        API_URL=${apiurl}

        # Crear archivo .env
        echo "INSTALL_HASH=\${INSTALL_HASH}" > .env
        echo "ENTITY_HASH=\${ENTITY_HASH}" >> .env
        echo "INSTALL_TOKEN=\${INSTALL_TOKEN}" >> .env

        # Clonar el repositorio de GitHub
        git clone ${github_url} || { echo "Error al clonar el repositorio."; exit 1; }

        # Obtener el nombre del directorio del repositorio clonado
        REPO_DIR=$(basename "${github_url}" .git)

        # Moverse al directorio del proyecto
        cd "\${REPO_DIR}" || { echo "Error al cambiar al directorio del proyecto."; exit 1; }

        # Ejecutar el script installdb.sh
        ./installdb.sh || { echo "Error al ejecutar installdb.sh."; exit 1; }

      curl -X POST "${apiurl}" \
      -H "Content-Type: application/json" \
      -d '{
           "install_hash": "${install_hash}",
           "entity_hash": "${entity_hash}",
           "install_token": "${install_token}"
         }' || { echo "Error al llamar al endpoint."; exit 1; }

        echo "Script ejecutado con éxito."
        `;

      const filePath = path.join(__dirname, 'installer.sh');
      fs.writeFile(filePath, installerContent.trim(), { mode: 0o755 }, (err) => {
         if (err) {
            return res.status(500).send('Error al escribir el archivo installer.sh');
         }

         res.download(filePath, 'installer.sh', (err) => {
            if (err) {
               return res.status(500).send('Error al descargar el archivo installer.sh');
            }
         });
      });
   } catch (error) {
      console.error(error);
      res.status(500).send('Error al generar el script installer.sh');
   }
}