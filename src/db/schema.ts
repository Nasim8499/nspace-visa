import {
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 200 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  phone: varchar("phone", { length: 40 }).default("").notNull(),
  nationality: varchar("nationality", { length: 80 }).default("Bangladesh").notNull(),
  passportNumber: varchar("passport_number", { length: 40 }).default("").notNull(),
  passportExpiry: varchar("passport_expiry", { length: 20 }).default("").notNull(),
  dob: varchar("dob", { length: 20 }).default("").notNull(),
  city: varchar("city", { length: 80 }).default("Dhaka").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    tokenHash: varchar("token_hash", { length: 100 }).notNull().unique(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at").notNull(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const applications = pgTable(
  "applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ref: varchar("ref", { length: 20 }).notNull().unique(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    destination: varchar("destination", { length: 60 }).notNull(),
    visaType: varchar("visa_type", { length: 120 }).notNull(),
    travelers: integer("travelers").default(1).notNull(),
    travelDate: varchar("travel_date", { length: 20 }).notNull(),
    fullName: varchar("full_name", { length: 120 }).notNull(),
    passportNumber: varchar("passport_number", { length: 40 }).notNull(),
    passportExpiry: varchar("passport_expiry", { length: 20 }).notNull(),
    dob: varchar("dob", { length: 20 }).notNull(),
    email: varchar("email", { length: 200 }).notNull(),
    phone: varchar("phone", { length: 40 }).notNull(),
    purpose: varchar("purpose", { length: 40 }).default("Tourism").notNull(),
    paymentMethod: varchar("payment_method", { length: 30 }).default("bKash").notNull(),
    amountBdt: integer("amount_bdt").notNull(),
    status: varchar("status", { length: 30 }).default("submitted").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [index("applications_user_idx").on(t.userId)],
);

export const applicationEvents = pgTable(
  "application_events",
  {
    id: serial("id").primaryKey(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 30 }).notNull(),
    note: text("note").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("events_app_idx").on(t.applicationId)],
);

export const visaHistory = pgTable(
  "visa_history",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    destination: varchar("destination", { length: 60 }).notNull(),
    visaType: varchar("visa_type", { length: 120 }).notNull(),
    issuedOn: varchar("issued_on", { length: 20 }).notNull(),
    expiresOn: varchar("expires_on", { length: 20 }).default("").notNull(),
    outcome: varchar("outcome", { length: 20 }).default("approved").notNull(),
    notes: text("notes").default("").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("history_user_idx").on(t.userId)],
);
