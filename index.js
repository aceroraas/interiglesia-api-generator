import express from 'express';
import cors from 'cors';
import getPort from 'get-port';
import router from './routers/routes.js';
import { logger } from './middlewares/logger.js';
import { generatePortRange } from './services/generatePortRange.js';



const app = express();
app.use(express.json());
app.use(cors());
app.use(logger);
app.use(router);



(async () => {
  const portRange = generatePortRange(3000, 3100);
  const port = await getPort({ port: portRange });
  app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
  });
  console.log(`Puerto disponible: ${port}`);
})();