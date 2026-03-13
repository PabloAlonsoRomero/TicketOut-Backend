import { PrismaClient, Role, TicketStatus, TicketPriority } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Limpiar datos existentes (En orden inverso de relaciones)
  await prisma.ticketEvent.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Database cleaned.');

  // 2. Crear Usuarios con Hashing de contraseñas
  const commonPassword = 'Password123!';
  const hashedPassword = await bcrypt.hash(commonPassword, 12);

  console.log('👤 Creating users...');

  // Superusuario
  const superuser = await prisma.user.create({
    data: {
      username: 'superadmin',
      email: 'super@ticketsout.com',
      name: 'Jorge Superuser',
      passwordHash: hashedPassword,
      role: Role.SUPERUSER,
    },
  });

  // Administrador
  const admin = await prisma.user.create({
    data: {
      username: 'admin_pablo',
      email: 'admin@ticketsout.com',
      name: 'Pablo Admin',
      passwordHash: hashedPassword,
      role: Role.ADMIN,
    },
  });

  // Usuario estándar
  const user = await prisma.user.create({
    data: {
      username: 'user_dev',
      email: 'user@ticketsout.com',
      name: 'Standard User',
      passwordHash: hashedPassword,
      role: Role.USER,
    },
  });

  console.log('✅ Users created.');

  // 3. Crear Tickets de ejemplo
  console.log('🎫 Creating sample tickets...');
  const ticket1 = await prisma.ticket.create({
    data: {
      title: 'Error en el login con Docker',
      description: 'El sistema arroja error P3014 al intentar migrar la base de datos.',
      status: TicketStatus.RESOLVED,
      priority: TicketPriority.URGENT,
      category: 'Infraestructura',
      createdById: superuser.id,
      assignedToId: admin.id,
    },
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      title: 'Ajustar estilos del header',
      description: 'El logo se ve muy pequeño en dispositivos móviles.',
      status: TicketStatus.OPEN,
      priority: TicketPriority.LOW,
      category: 'UI/UX',
      createdById: admin.id,
    },
  });

  const ticket3 = await prisma.ticket.create({
    data: {
      title: 'Pantalla parpadea',
      description: 'Mi pantalla secundaria parpadea al conectar el HDMI',
      status: TicketStatus.OPEN,
      priority: TicketPriority.MEDIUM,
      category: 'Hardware',
      createdById: user.id
    }
  });

  const ticket4 = await prisma.ticket.create({
    data: {
      title: 'No tengo acceso a Github',
      description: 'Dice que mi token está expirado o no tengo permisos',
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.HIGH,
      category: 'Accesos / Permisos',
      createdById: user.id
    }
  });

  console.log('✅ Tickets created.');

  // 4. Crear un comentario
  await prisma.comment.create({
    data: {
      body: 'Ya hemos corregido esto configurando el usuario root en el .env',
      isInternal: false,
      ticketId: ticket1.id,
      authorId: admin.id,
    },
  });

  console.log('💬 Comments created.');

  console.log(`
🚀 Seeding finished successfully!
----------------------------------
USARIOS DISPONIBLES:
----------------------------------
1.⁠ ⁠SUPERUSER:
   Email: super@ticketsout.com
   Pass:  Password123!

2.⁠ ⁠ADMIN:
   Email: admin@ticketsout.com
   Pass:  Password123!

3.⁠ ⁠USER:
   Email: user@ticketsout.com
   Pass:  Password123!
----------------------------------
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });