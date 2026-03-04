import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("[SEED] Seeding database...");

  // Create Admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@ecanteen.com" },
    update: {},
    create: {
      name: "Admin Kantin",
      email: "admin@ecanteen.com",
      password: "admin123",
      role: "ADMIN",
      balance: 0,
    },
  });
  console.log(`[OK] Admin created: ${admin.name} (${admin.email})`);

  // Create sample User
  const user = await prisma.user.upsert({
    where: { email: "siswa@ecanteen.com" },
    update: {},
    create: {
      name: "Budi Siswa",
      email: "siswa@ecanteen.com",
      password: "siswa123",
      role: "USER",
      balance: 100000,
    },
  });
  console.log(`[OK] User created: ${user.name} (${user.email})`);

  // Create sample Menus
  const menus = [
    { name: "Nasi Goreng", price: 15000, available: true },
    { name: "Mie Goreng", price: 13000, available: true },
    { name: "Ayam Geprek", price: 18000, available: true },
    { name: "Nasi Uduk", price: 12000, available: true },
    { name: "Soto Ayam", price: 14000, available: true },
    { name: "Es Teh Manis", price: 5000, available: true },
    { name: "Es Jeruk", price: 6000, available: true },
    { name: "Air Mineral", price: 4000, available: true },
  ];

  for (const menu of menus) {
    await prisma.menu.upsert({
      where: { id: menus.indexOf(menu) + 1 },
      update: {},
      create: menu,
    });
  }
  console.log(`[OK] ${menus.length} menu items created`);

  console.log("\n[DONE] Seeding selesai!");
  console.log("\n[INFO] Akun Demo:");
  console.log("   Admin  → admin@ecanteen.com / admin123");
  console.log("   Siswa  → siswa@ecanteen.com / siswa123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
