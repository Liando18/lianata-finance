import {
  pgTable, serial, text, integer, decimal, timestamp, varchar, boolean, pgEnum,
} from "drizzle-orm/pg-core"

export const userPlanEnum = pgEnum("user_plan", ["free", "pro", "business"])
export const txnTypeEnum = pgEnum("txn_type", ["income", "expense"])
export const walletTypeEnum = pgEnum("wallet_type", ["cash", "bank", "ewallet"])
export const debtTypeEnum = pgEnum("debt_type", ["debt", "receivable"])
export const debtStatusEnum = pgEnum("debt_status", ["active", "partial", "paid"])
export const budgetPeriodEnum = pgEnum("budget_period", ["monthly", "yearly"])
export const freqEnum = pgEnum("frequency", ["daily", "weekly", "monthly", "yearly"])

// Better Auth tables
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  name: text("name").notNull(),
  image: text("image"),
  businessType: text("business_type"),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  providerId: text("provider_id").notNull(),
  accountId: text("account_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  identifier: text("identifier").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// App tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }),
  name: varchar("name", { length: 255 }).notNull(),
  avatar: text("avatar"),
  plan: userPlanEnum("plan").notNull().default("free"),
  googleId: varchar("google_id", { length: 255 }).unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  type: txnTypeEnum("type").notNull(),
  icon: varchar("icon", { length: 50 }).default("Circle"),
  color: varchar("color", { length: 7 }).default("#c12a58"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  type: walletTypeEnum("type").notNull().default("cash"),
  balance: decimal("balance", { precision: 15, scale: 2 }).notNull().default("0"),
  icon: varchar("icon", { length: 50 }).default("Wallet"),
  color: varchar("color", { length: 7 }).default("#c12a58"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  walletId: integer("wallet_id").notNull().references(() => wallets.id, { onDelete: "cascade" }),
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  type: txnTypeEnum("type").notNull(),
  description: text("description"),
  date: timestamp("date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  period: budgetPeriodEnum("period").notNull().default("monthly"),
  month: integer("month"),
  year: integer("year").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const debts = pgTable("debts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 15, scale: 2 }).notNull().default("0"),
  type: debtTypeEnum("type").notNull(),
  status: debtStatusEnum("status").notNull().default("active"),
  dueDate: timestamp("due_date"),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const recurring = pgTable("recurring", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  walletId: integer("wallet_id").notNull().references(() => wallets.id, { onDelete: "cascade" }),
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  type: txnTypeEnum("type").notNull(),
  description: text("description"),
  frequency: freqEnum("frequency").notNull(),
  nextDate: timestamp("next_date").notNull(),
  endDate: timestamp("end_date"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const segmentEnum = pgEnum("segment", ["Hemat", "Konsumtif", "Impulsif"])

export const userSegments = pgTable("user_segments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  segment: segmentEnum("segment").notNull(),
  totalExpense: varchar("total_expense", { length: 20 }),
  txnCount: integer("txn_count").default(0),
  avgAmount: varchar("avg_amount", { length: 20 }),
  variance: varchar("variance", { length: 20 }),
  calculatedAt: timestamp("calculated_at").notNull().defaultNow(),
})

export const surveys = pgTable("surveys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  message: text("message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  currency: varchar("currency", { length: 3 }).default("IDR"),
  locale: varchar("locale", { length: 10 }).default("id-ID"),
  theme: varchar("theme", { length: 20 }).default("light"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})
