import dotenv from "dotenv"
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { MongoClient } from "mongodb"
import { hashPassword } from "@better-auth/utils/password"

dotenv.config({ path: ".env.local" })

const rawSql = neon(process.env.DATABASE_URL)
const db = drizzle(rawSql)

const SEED_PASSWORD = "password123"

async function exec(query) {
  return await rawSql.query(query)
}

function getMongo() {
  const mongoUri = process.env.MONGODB_URI.replace(/^url=/, "")
  const mongo = new MongoClient(mongoUri)
  return { mongo, db: mongo.db("lianata_finance") }
}

async function clearAll() {
  console.log("⏳ Membersihkan database...")

  const tables = [
    "transactions", "budgets", "debts", "recurring", "user_segments",
    "surveys", "user_settings", "wallets", "categories", "users",
    "verification", "account", "session", "user",
  ]
  for (const t of tables) {
    await exec(`DELETE FROM "${t}"`)
  }

  try {
    const { mongo, db } = getMongo()
    await db.collection("activity_logs").deleteMany({})
    await db.collection("anomalies").deleteMany({})
    await mongo.close()
  } catch (_) {}

  console.log("✓ Database bersih\n")
}

const DAYS_IN_MONTH = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

function baseDay(m) {
  return Math.floor(Math.random() * (DAYS_IN_MONTH[m] - 14)) + 1
}

function pm(m) {
  return String(m).padStart(2, "0")
}
function pd(d) {
  return String(d).padStart(2, "0")
}

// ─────────────────────── Data definitions per user ───────────────────────

const DEMO = {
  authId: "demo-001", email: "demo@lianata.app", name: "Demo User",
  businessType: "pribadi", role: "user", userId: 1,
  categories: [
    [1,  1, "Gaji",       "income",  "Briefcase",  "#22c55e"],
    [2,  1, "Freelance",  "income",  "Laptop",     "#3b82f6"],
    [3,  1, "Investasi",  "income",  "TrendingUp", "#a855f7"],
    [4,  1, "Bisnis",     "income",  "Store",      "#f59e0b"],
    [5,  1, "Lain-lain",  "income",  "Plus",       "#64748b"],
    [6,  1, "Makanan",    "expense","Utensils",    "#ef4444"],
    [7,  1, "Transport",  "expense","Car",         "#f97316"],
    [8,  1, "Belanja",    "expense","ShoppingBag", "#ec4899"],
    [9,  1, "Tagihan",    "expense","FileText",    "#06b6d4"],
    [10, 1, "Hiburan",    "expense","Film",        "#8b5cf6"],
  ],
  wallets: [
    [1, 1, "Tunai",  "cash",    "2500000"],
    [2, 1, "BCA",    "bank",    "15000000"],
    [3, 1, "GoPay",  "ewallet", "850000"],
  ],
  transactions() {
    const data = []; let id = 1
    const months = [2, 3, 4, 5, 6]
    for (const m of months) {
      const d = baseDay(m)
      data.push(
        [id++, 1, 2, 1,  '8500000', 'income',  `Gaji Bulan ${m}`,          `2025-${pm(m)}-${pd(d)}`],
        [id++, 1, 1, 6,  '1200000', 'expense','Belanja bulanan',           `2025-${pm(m)}-${pd(d+2)}`],
        [id++, 1, 3, 7,   '350000', 'expense','Bensin & parkir',           `2025-${pm(m)}-${pd(d+5)}`],
        [id++, 1, 2, 9,   '750000', 'expense','Listrik & internet',        `2025-${pm(m)}-${pd(d+8)}`],
        [id++, 1, 2, 10,  '200000', 'expense','Nonton & nongkrong',        `2025-${pm(m)}-${pd(d+12)}`],
      )
    }
    data.push(
      [id++, 1, 2, 2,  '3500000', 'income',  'Project website',   '2025-06-15'],
      [id++, 1, 1, 3,   '500000', 'income',  'Dividen saham',     '2025-06-10'],
      [id++, 1, 2, 8,   '850000', 'expense','Baju & aksesoris',   '2025-06-18'],
    )
    return data
  },
  budgets: [
    [1, 1, 6,  '1500000', 'monthly', 6, 2025],
    [2, 1, 7,   '500000', 'monthly', 6, 2025],
    [3, 1, 9,   '800000', 'monthly', 6, 2025],
    [4, 1, 8,  '1000000', 'monthly', 6, 2025],
    [5, 1, 10,  '400000', 'monthly', 6, 2025],
  ],
  debts: [
    [1, 1, "Pinjaman Budi",  "2000000",  "500000",  "debt",       "active",  "2025-08-01"],
    [2, 1, "Kasbon Rina",    "1500000",  "1500000", "receivable", "paid",    "2025-05-15"],
    [3, 1, "Modal Usaha",    "5000000",  "1000000", "debt",       "partial", "2025-12-31"],
  ],
  recurring: [
    [1, 1, 2, 9, "550000", "expense", "Sewa kos",         "monthly", "2025-07-01"],
    [2, 1, 3, 9, "150000", "expense", "Spotify & Netflix","monthly", "2025-07-05"],
  ],
  settings: [1, 1, "IDR", "id-ID", "light"],
}

const ADMIN = {
  authId: "admin-001", email: "admin@lianata.app", name: "Admin User",
  businessType: "perusahaan", role: "admin", userId: 2,
  categories: [
    [11, 2, "Pendapatan Jasa", "income",  "Briefcase", "#22c55e"],
    [12, 2, "Modal Usaha",     "income",  "TrendingUp","#a855f7"],
    [13, 2, "Gaji Karyawan",   "expense","Users",      "#ef4444"],
    [14, 2, "Operasional",     "expense","FileText",   "#f97316"],
    [15, 2, "Marketing",       "expense","Megaphone",  "#ec4899"],
    [16, 2, "Sewa & Utilitas", "expense","Building2",  "#06b6d4"],
    [17, 2, "Lain-lain",       "expense","Plus",       "#64748b"],
  ],
  wallets: [
    [4, 2, "BRI Bisnis", "bank",    "50000000"],
    [5, 2, "Kas Kecil",  "cash",    "5000000"],
    [6, 2, "QRIS",       "ewallet", "2750000"],
  ],
  transactions() {
    const data = []; let id = 29
    const months = [4, 5, 6]
    for (const m of months) {
      const d = baseDay(m)
      data.push(
        [id++, 2, 4, 11, "15000000", "income",  `Project ${["A", "B", "C"][m-4]}`,     `2025-${pm(m)}-${pd(d)}`],
        [id++, 2, 6, 12,  "2000000", "income",  `Investor ${m}`,                       `2025-${pm(m)}-${pd(d+3)}`],
        [id++, 2, 4, 13,  "4500000", "expense","Gaji 3 karyawan",                      `2025-${pm(m)}-${pd(d+5)}`],
        [id++, 2, 5, 14,   "800000", "expense","ATK & perlengkapan",                   `2025-${pm(m)}-${pd(d+8)}`],
        [id++, 2, 6, 15,  "1200000", "expense","Iklan Instagram",                      `2025-${pm(m)}-${pd(d+10)}`],
      )
    }
    data.push(
      [id++, 2, 4, 16, "2500000", "expense","Sewa gedung",   "2025-06-01"],
      [id++, 2, 5, 17,  "350000", "expense","Konsumsi rapat", "2025-06-20"],
    )
    return data
  },
  budgets: [
    [6,  2, 13,  "5000000", "monthly", 6, 2025],
    [7,  2, 14,  "1500000", "monthly", 6, 2025],
    [8,  2, 15,  "2000000", "monthly", 6, 2025],
    [9,  2, 16,  "3000000", "monthly", 6, 2025],
  ],
  debts: [
    [4, 2, "Pinjaman Bank",   "20000000", "5000000", "debt",       "partial", "2027-06-01"],
    [5, 2, "Piutang Client X","15000000", "5000000", "receivable", "partial", "2025-09-30"],
  ],
  recurring: [
    [3, 2, 4, 16, "2500000", "expense", "Sewa gedung",  "monthly", "2025-07-01"],
  ],
  settings: [2, 2, "IDR", "id-ID", "dark"],
}

const APRILIAN = {
  authId: "dev-aprilian", email: "aprilian@lianata.app", name: "Aprilian Gevindo",
  businessType: "perusahaan", role: "owner", userId: 3,
  categories: [
    [18, 3, "Gaji Direktur",    "income",  "Briefcase",  "#22c55e"],
    [19, 3, "Deviden",          "income",  "TrendingUp", "#a855f7"],
    [20, 3, "Investasi",        "income",  "PieChart",   "#f59e0b"],
    [21, 3, "Royalti",          "income",  "Copyright",  "#3b82f6"],
    [22, 3, "Kebutuhan Rumah",  "expense","Home",        "#ef4444"],
    [23, 3, "Kendaraan",        "expense","Car",         "#f97316"],
    [24, 3, "Asuransi",         "expense","Shield",      "#06b6d4"],
    [25, 3, "Donasi",           "expense","Heart",       "#ec4899"],
    [26, 3, "Travel",           "expense","Plane",       "#8b5cf6"],
  ],
  wallets: [
    [7, 3, "Mandiri Prioritas",  "bank",    "150000000"],
    [8, 3, "Jenius",            "bank",    "45000000"],
    [9, 3, "DANA",              "ewallet", "12500000"],
    [10, 3, "Kas Pribadi",      "cash",    "20000000"],
  ],
  transactions() {
    const data = []; let id = 54
    const months = [1, 2, 3, 4, 5, 6]
    for (const m of months) {
      const d = baseDay(m)
      data.push(
        [id++, 3,  7, 18,  "75000000", "income",  `Gaji direktur ${m}`,        `2025-${pm(m)}-${pd(d)}`],
        [id++, 3,  8, 20,  "5000000",  "income",  `Cair deposito ${m}`,        `2025-${pm(m)}-${pd(d+4)}`],
        [id++, 3,  9, 19,  "35000000", "income",  `Deviden Q${Math.ceil(m/2)}`, `2025-${pm(m)}-${pd(d+7)}`],
        [id++, 3,  7, 22,  "8500000",  "expense","Belanja bulanan rumah",      `2025-${pm(m)}-${pd(d+2)}`],
        [id++, 3, 10, 25,  "5000000",  "expense","Zakat & donasi",             `2025-${pm(m)}-${pd(d+10)}`],
      )
    }
    data.push(
      [id++, 3, 7, 23, "35000000", "expense","Cicilan Lexus",      "2025-06-05"],
      [id++, 3, 8, 26, "12000000", "expense","Trip Jepang",        "2025-03-20"],
      [id++, 3, 9, 21,  "8500000", "income", "Royalti buku",       "2025-04-10"],
      [id++, 3, 7, 24,  "2500000", "expense","Premi Asuransi Jiwa","2025-06-15"],
    )
    return data
  },
  budgets: [
    [10, 3, 22, "12000000", "monthly", 6, 2025],
    [11, 3, 23, "5000000",  "monthly", 6, 2025],
    [12, 3, 24, "3000000",  "monthly", 6, 2025],
    [13, 3, 25, "7000000",  "monthly", 6, 2025],
  ],
  debts: [
    [6, 3, "KPR Mandiri",    "850000000", "350000000", "debt",       "partial", "2045-01-15"],
    [7, 3, "Piutang PT Maju","50000000",  "15000000",  "receivable", "partial", "2025-12-31"],
  ],
  recurring: [
    [4, 3, 7, 23, "3500000", "expense", "Cicilan Lexus",       "monthly", "2025-07-05"],
    [5, 3, 7, 24, "2500000", "expense", "Premi Asuransi Jiwa",  "monthly", "2025-07-15"],
  ],
  settings: [3, 3, "IDR", "id-ID", "dark"],
}

const HESTI = {
  authId: "dev-hesti", email: "hesti@lianata.app", name: "Hesti Ananta",
  businessType: "pribadi", role: "admin", userId: 4,
  categories: [
    [27, 4, "Gaji",           "income",  "Briefcase",  "#22c55e"],
    [28, 4, "Review",         "income",  "Laptop",     "#3b82f6"],
    [29, 4, "Freelance UX",   "income",  "Palette",    "#a855f7"],
    [30, 4, "Jajan",          "expense","Coffee",      "#ef4444"],
    [31, 4, "Skincare",       "expense","Heart",       "#ec4899"],
    [32, 4, "Transport",      "expense","Car",         "#f97316"],
    [33, 4, "Tagihan",        "expense","FileText",    "#06b6d4"],
    [34, 4, "Hiburan",        "expense","Film",        "#8b5cf6"],
    [35, 4, "Lain-lain",      "expense","Plus",        "#64748b"],
  ],
  wallets: [
    [11, 4, "BCA",       "bank",    "28000000"],
    [12, 4, "GoPay",     "ewallet", "1500000"],
    [13, 4, "ShopeePay", "ewallet", "750000"],
    [14, 4, "Tunai",     "cash",    "1000000"],
  ],
  transactions() {
    const data = []; let id = 88
    const months = [3, 4, 5, 6]
    for (const m of months) {
      const d = baseDay(m)
      data.push(
        [id++, 4, 11, 27,   "8500000",  "income",  `Gaji ${m}`,                     `2025-${pm(m)}-${pd(d)}`],
        [id++, 4, 11, 28,   "1200000",  "income",  `Review produk ${m}`,            `2025-${pm(m)}-${pd(d+3)}`],
        [id++, 4, 11, 29,   "2500000",  "income",  `Project UI ${m}`,               `2025-${pm(m)}-${pd(d+6)}`],
        [id++, 4, 12, 30,    "250000",  "expense","Kopi & cemilan",                 `2025-${pm(m)}-${pd(d+2)}`],
        [id++, 4, 13, 31,    "450000",  "expense","Skincare & makeup",              `2025-${pm(m)}-${pd(d+5)}`],
        [id++, 4, 12, 34,    "200000",  "expense","Nobar & healing",                `2025-${pm(m)}-${pd(d+9)}`],
      )
    }
    data.push(
      [id++, 4, 12, 32,   "150000",  "expense","Gojek & transport",   "2025-06-18"],
      [id++, 4, 11, 33,   "650000",  "expense","Listrik & internet",  "2025-06-05"],
      [id++, 4, 14, 35,   "300000",  "expense","Beli tanaman hias",   "2025-06-12"],
    )
    return data
  },
  budgets: [
    [14, 4, 30,  "500000",  "monthly", 6, 2025],
    [15, 4, 31,  "600000",  "monthly", 6, 2025],
    [16, 4, 32,  "400000",  "monthly", 6, 2025],
    [17, 4, 33,  "800000",  "monthly", 6, 2025],
    [18, 4, 34,  "500000",  "monthly", 6, 2025],
  ],
  debts: [
    [8, 4, "Pinjaman Mama",   "3000000",  "1000000", "debt",       "partial", "2025-08-20"],
    [9, 4, "Piutang Tika",    "500000",   "500000",  "receivable", "paid",    "2025-05-10"],
  ],
  recurring: [
    [6, 4, 12, 33,  "250000",  "expense", "Langganan Spotify",        "monthly", "2025-07-01"],
    [7, 4, 11, 33,  "150000",  "expense", "Netflix & Disney+",        "monthly", "2025-07-10"],
  ],
  settings: [4, 4, "IDR", "id-ID", "light"],
}

const USERS = [DEMO, ADMIN, APRILIAN, HESTI]

// ─────────────────────── Seeding helpers ───────────────────────

async function seedAuth() {
  const rows = USERS.map(u =>
    `('${u.authId}', '${u.email}', true, '${u.name}', '${u.businessType}', '${u.role}')`
  ).join(",\n    ")
  await exec(`INSERT INTO "user" (id, email, email_verified, name, business_type, role) VALUES\n    ${rows}`)
  console.log(`  ✓ user (auth) — ${USERS.length} baris`)

  const us = USERS.map(u =>
    `(${u.userId}, '${u.email}', '${u.name}', 'free')`
  ).join(",\n    ")
  await exec(`INSERT INTO "users" (id, email, name, plan) VALUES\n    ${us}`)
  console.log(`  ✓ users — ${USERS.length} baris`)

  const hash = await hashPassword(SEED_PASSWORD)
  const now = new Date().toISOString()
  const accRows = USERS.map((u, i) =>
    `('acc-seed-${i}', 'credential', '${u.email}', '${u.authId}', '${hash}', '${now}', '${now}')`
  ).join(",\n    ")
  await exec(`INSERT INTO "account" (id, provider_id, account_id, user_id, password, created_at, updated_at) VALUES\n    ${accRows}`)
  console.log(`  ✓ account (password) — ${USERS.length} baris`)
}

async function seedCategories() {
  const all = USERS.flatMap(u => u.categories)
  const rows = all.map(c =>
    `(${c[0]}, ${c[1]}, '${c[2]}', '${c[3]}', '${c[4]}', '${c[5]}')`
  ).join(",\n    ")
  await exec(`INSERT INTO "categories" (id, user_id, name, type, icon, color) VALUES\n    ${rows}`)
  console.log(`  ✓ categories — ${all.length} baris`)
}

async function seedWallets() {
  const all = USERS.flatMap(u => u.wallets)
  const rows = all.map(w =>
    `(${w[0]}, ${w[1]}, '${w[2]}', '${w[3]}', '${w[4]}')`
  ).join(",\n    ")
  await exec(`INSERT INTO "wallets" (id, user_id, name, type, balance) VALUES\n    ${rows}`)
  console.log(`  ✓ wallets — ${all.length} baris`)
}

async function seedTransactions() {
  const all = USERS.flatMap(u => u.transactions())
  const rows = all.map(t =>
    `(${t[0]}, ${t[1]}, ${t[2]}, ${t[3]}, '${t[4]}', '${t[5]}', '${t[6]}', '${t[7]}')`
  ).join(",\n    ")
  await exec(`INSERT INTO "transactions" (id, user_id, wallet_id, category_id, amount, type, description, date) VALUES\n    ${rows}`)
  console.log(`  ✓ transactions — ${all.length} baris`)
}

async function seedBudgets() {
  const all = USERS.flatMap(u => u.budgets)
  const rows = all.map(b =>
    `(${b[0]}, ${b[1]}, ${b[2]}, '${b[3]}', '${b[4]}', ${b[5]}, ${b[6]})`
  ).join(",\n    ")
  await exec(`INSERT INTO "budgets" (id, user_id, category_id, amount, period, month, year) VALUES\n    ${rows}`)
  console.log(`  ✓ budgets — ${all.length} baris`)
}

async function seedDebts() {
  const all = USERS.flatMap(u => u.debts)
  const rows = all.map(d =>
    `(${d[0]}, ${d[1]}, '${d[2]}', '${d[3]}', '${d[4]}', '${d[5]}', '${d[6]}', '${d[7]}')`
  ).join(",\n    ")
  await exec(`INSERT INTO "debts" (id, user_id, name, amount, paid_amount, type, status, due_date) VALUES\n    ${rows}`)
  console.log(`  ✓ debts — ${all.length} baris`)
}

async function seedRecurring() {
  const all = USERS.flatMap(u => u.recurring)
  const rows = all.map(r =>
    `(${r[0]}, ${r[1]}, ${r[2]}, ${r[3]}, '${r[4]}', '${r[5]}', '${r[6]}', '${r[7]}', '${r[8]}')`
  ).join(",\n    ")
  await exec(`INSERT INTO "recurring" (id, user_id, wallet_id, category_id, amount, type, description, frequency, next_date) VALUES\n    ${rows}`)
  console.log(`  ✓ recurring — ${all.length} baris`)
}

async function seedSettings() {
  const all = USERS.map(u => u.settings)
  const rows = all.map(s =>
    `(${s[0]}, ${s[1]}, '${s[2]}', '${s[3]}', '${s[4]}')`
  ).join(",\n    ")
  await exec(`INSERT INTO "user_settings" (id, user_id, currency, locale, theme) VALUES\n    ${rows}`)
  console.log(`  ✓ user_settings — ${all.length} baris`)
}

async function seedNeon() {
  console.log("⏳ Menyemai data PostgreSQL...\n")
  await seedAuth()
  await seedCategories()
  await seedWallets()
  await seedTransactions()
  await seedBudgets()
  await seedDebts()
  await seedRecurring()
  await seedSettings()
  console.log()
}

async function seedMongo() {
  console.log("⏳ Menyemai data MongoDB...\n")

  try {
    const { mongo, db } = getMongo()

    const logs = [
      { userId: 1, action: "login", detail: "Login via email", createdAt: new Date("2025-06-01T08:00:00Z") },
      { userId: 1, action: "create_transaction", detail: "Gaji Bulan 6 — Rp8.500.000", createdAt: new Date("2025-06-01T09:00:00Z") },
      { userId: 1, action: "create_transaction", detail: "Belanja bulanan — Rp1.200.000", createdAt: new Date("2025-06-03T10:30:00Z") },
      { userId: 1, action: "create_budget", detail: "Budget Makanan — Rp1.500.000", createdAt: new Date("2025-06-01T11:00:00Z") },
      { userId: 1, action: "view_report", detail: "Laporan bulan Mei", createdAt: new Date("2025-06-02T14:00:00Z") },
      { userId: 1, action: "ml_segment", detail: "Segment: Hemat", createdAt: new Date("2025-06-05T12:00:00Z") },
    ]
    await db.collection("activity_logs").insertMany(logs)
    console.log(`  ✓ activity_logs — ${logs.length} baris`)

    const anomalies = [
      {
        userId: 1, type: "amount_spike", severity: "medium",
        detail: "Transaksi Rp3.500.000 tidak biasa (3x dari rata-rata)",
        detectedAt: new Date("2025-06-15T10:00:00Z"),
      },
      {
        userId: 1, type: "unusual_time", severity: "low",
        detail: "Transaksi di luar jam aktivitas normal (03:00)",
        detectedAt: new Date("2025-06-12T03:15:00Z"),
      },
    ]
    await db.collection("anomalies").insertMany(anomalies)
    console.log(`  ✓ anomalies — ${anomalies.length} baris\n`)

    await mongo.close()
  } catch (e) {
    console.log("  ⚠ MongoDB tidak tersedia, lewati...")
    console.log(`  ⚠ ${e.message}`)
  }
}

async function main() {
  console.log("╔════════════════════════════════════════╗")
  console.log("║   🌱 Lianata Finance — Seed           ║")
  console.log("║   Dikembangkan oleh:                   ║")
  console.log("║   • Aprilian Gevindo                   ║")
  console.log("║   • Hesti Ananta                       ║")
  console.log("╚════════════════════════════════════════╝\n")

  await clearAll()
  await seedNeon()
  await seedMongo()

  console.log("╔════════════════════════════════════════╗")
  console.log("║  ✅ Seed selesai!                      ║")
  console.log("║                                       ║")
  console.log("║  Semua akun password: password123      ║")
  console.log("║                                       ║")
  console.log("║  Akun yang tersedia:                   ║")
  console.log("║  • demo@lianata.app   (user/demo)     ║")
  console.log("║  • admin@lianata.app  (admin)         ║")
  console.log("║  • aprilian@lianata.app  (owner/dev)  ║")
  console.log("║  • hesti@lianata.app     (admin/dev)  ║")
  console.log("║                                       ║")
  console.log("║  Langsung login aja, ga perlu verify! ║")
  console.log("╚════════════════════════════════════════╝")
  process.exit(0)
}

main().catch((e) => {
  console.error("❌ Gagal:", e.message)
  process.exit(1)
})
