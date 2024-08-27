const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const getPort = require('get-port');

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware para registrar solicitudes
app.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'GET') {
    console.log(JSON.stringify({
      method: req.method,
      url: req.url,
      path: req.path,
      params: req.params,
      query: req.query,
      body: req.body
    }, null, 2));
  }
  next();
});

// Middleware de autenticación
const checkAndDeleteExpiredInstallToken = async (token) => {
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

const deleteExpiredAuthToken = async (token) => {
  await prisma.session.delete({
    where: { jwtToken: token },
  });
};
const authenticateToken = async (req, res, next) => {
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


// Rutas de autenticación
app.post('/login', async (req, res) => {
  try {
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
});



// CRUD para Entity
app.post('/entities', authenticateToken, async (req, res) => {
  try {
    const { name, legalIdentificationNumber } = req.body;
    if (!name || !legalIdentificationNumber) {
      return res.status(400).json({ error: 'Faltan parámetros: name y legalIdentificationNumber son requeridos' });
    }
    const hashId = require('crypto').randomBytes(16).toString('hex');
    const entity = await prisma.entity.create({ data: { name, legalIdentificationNumber, hashId } });
    res.json(entity);
  } catch (error) {
    if (error instanceof prisma.Prisma.PrismaClientKnownRequestError) {
      res.status(400).json({ error: 'Error en los parámetros' });
    } else {
      res.status(422).json({ error: 'No se pudo procesar' });
    }
  }
});

app.get('/entities', authenticateToken, async (req, res) => {
  try {
    const entities = await prisma.entity.findMany();
    res.json(entities);
  } catch (error) {
    res.status(422).json({ error: 'No se pudo procesar' });
  }
});

// CRUD para Application
app.post('/applications', authenticateToken, async (req, res) => {
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
});

app.get('/applications', authenticateToken, async (req, res) => {
  try {
    const applications = await prisma.application.findMany();
    res.json(applications);
  } catch (error) {
    res.status(422).json({ error: 'No se pudo procesar' });
  }
});

// Crear un nuevo token (GET)
app.get('/installtoken', authenticateToken, async (req, res) => {
  try {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600 * 1000); // Token expira en 1 hora
    const newToken = await prisma.installationToken.create({
      data: { token, expiresAt }
    });
    res.json(newToken);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo crear el token' });
  }
});

// Eliminar un token (DELETE)
app.delete('/installtoken', authenticateToken, async (req, res) => {
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
});

// Mostrar todos los tokens de instalación (GET)
app.get('/installtokens', authenticateToken, async (req, res) => {
  try {
    const tokens = await prisma.installationToken.findMany();
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo obtener los tokens' });
  }
});

(async () => {
  const port = await getPort({ port: getPort.makeRange(3000, 3100) });
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
})();