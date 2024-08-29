import bcrypt from 'bcryptjs';
import { prisma } from '../services/prismaClient.js';




async function main() {
  const password = process.env.INSTALL_PASSWORD;
  if (!password) {
    console.error('INSTALL_PASSWORD no está definida en las variables de entorno');
    process.exit(1);
  }
  console.log({ INSTALL_PASSWORD: password });

  const hashedPassword = await bcrypt.hash(password, 10);

  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: hashedPassword,
    },
  });

  console.log('Usuario admin creado:', adminUser);

  const installationOperation = await prisma.installationOperation.createMany({
    data: [{
      name: 'Instalacion',
    },
    {
      name: 'Actualizacion',
    }, {
      name: 'Eliminacion',
    }],
  })

  const Status = await prisma.status.createMany({
    data: [
      { name: 'Produccion' },
      { name: 'Prueba' },
    ],
  });
}



main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
