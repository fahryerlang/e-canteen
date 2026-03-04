import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("[SEED] Seeding database...");

  // ── Admin ────────────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@ecanteen.com" },
    update: { password: "admin123", role: "ADMIN" },
    create: {
      name: "Admin Kantin",
      email: "admin@ecanteen.com",
      password: "admin123",
      role: "ADMIN",
      balance: 0,
    },
  });
  console.log(`[OK] Admin created: ${admin.name} (${admin.email})`);

  // ── Canteens ──────────────────────────────────────────────────────────────
  const kantin1 = await prisma.canteen.upsert({
    where: { id: 1 },
    update: {},
    create: { name: "Kantin 1 – Makanan Berat", description: "Nasi, lauk, dan mi" },
  });
  const kantin2 = await prisma.canteen.upsert({
    where: { id: 2 },
    update: {},
    create: { name: "Kantin 2 – Minuman & Snack", description: "Minuman segar dan cemilan" },
  });
  console.log(`[OK] Canteens created: ${kantin1.name}, ${kantin2.name}`);

  // ── Sellers ───────────────────────────────────────────────────────────────
  const seller1 = await prisma.user.upsert({
    where: { email: "kantin1@ecanteen.com" },
    update: { password: "seller123", role: "SELLER", canteenId: kantin1.id },
    create: {
      name: "Penjual Kantin 1",
      email: "kantin1@ecanteen.com",
      password: "seller123",
      role: "SELLER",
      canteenId: kantin1.id,
      balance: 0,
    },
  });
  const seller2 = await prisma.user.upsert({
    where: { email: "kantin2@ecanteen.com" },
    update: { password: "seller123", role: "SELLER", canteenId: kantin2.id },
    create: {
      name: "Penjual Kantin 2",
      email: "kantin2@ecanteen.com",
      password: "seller123",
      role: "SELLER",
      canteenId: kantin2.id,
      balance: 0,
    },
  });
  console.log(`[OK] Sellers created: ${seller1.name}, ${seller2.name}`);

  // ── Buyer ─────────────────────────────────────────────────────────────────
  const user = await prisma.user.upsert({
    where: { email: "siswa@ecanteen.com" },
    update: { password: "siswa123", role: "USER" },
    create: {
      name: "Budi Siswa",
      email: "siswa@ecanteen.com",
      password: "siswa123",
      role: "USER",
      balance: 100000,
    },
  });
  console.log(`[OK] User created: ${user.name} (${user.email})`);

  // ── Menus for Kantin 1 ────────────────────────────────────────────────────
  const menusKantin1 = [
    { name: "Nasi Goreng", price: 15000, canteenId: kantin1.id },
    { name: "Mie Goreng", price: 13000, canteenId: kantin1.id },
    { name: "Ayam Geprek", price: 18000, canteenId: kantin1.id },
    { name: "Nasi Uduk", price: 12000, canteenId: kantin1.id },
    { name: "Soto Ayam", price: 14000, canteenId: kantin1.id },
  ];

  // ── Menus for Kantin 2 ────────────────────────────────────────────────────
  const menusKantin2 = [
    { name: "Es Teh Manis", price: 5000, canteenId: kantin2.id },
    { name: "Es Jeruk", price: 6000, canteenId: kantin2.id },
    { name: "Air Mineral", price: 4000, canteenId: kantin2.id },
    { name: "Roti Bakar", price: 8000, canteenId: kantin2.id },
    { name: "Pisang Goreng", price: 7000, canteenId: kantin2.id },
  ];

  const allMenus = [...menusKantin1, ...menusKantin2];
  for (let i = 0; i < allMenus.length; i++) {
    await prisma.menu.upsert({
      where: { id: i + 1 },
      update: {},
      create: { ...allMenus[i], available: true },
    });
  }
  console.log(`[OK] ${allMenus.length} menu items created across 2 canteens`);

  console.log("\n[DONE] Seeding selesai!");
  console.log("\n[INFO] Akun Demo:");
  console.log("   Admin   → admin@ecanteen.com  / admin123");
  console.log("   Pembeli → siswa@ecanteen.com  / siswa123");
  console.log("   Penjual 1 → kantin1@ecanteen.com / seller123  (Kantin 1)");
  console.log("   Penjual 2 → kantin2@ecanteen.com / seller123  (Kantin 2)");
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
