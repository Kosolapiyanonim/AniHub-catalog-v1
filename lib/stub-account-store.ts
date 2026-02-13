import { createHash, randomUUID } from "node:crypto"

export type StubUserAccount = {
  id: string
  email: string
  displayName: string
  createdAt: string
  updatedAt: string
}

type StubUserAccountRecord = StubUserAccount & {
  passwordHash: string
}

export type RegisterStubUserInput = {
  email: string
  password: string
  displayName: string
}

export type LoginStubUserInput = {
  email: string
  password: string
}

const store = new Map<string, StubUserAccountRecord>()

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex")
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function toPublicAccount(record: StubUserAccountRecord): StubUserAccount {
  return {
    id: record.id,
    email: record.email,
    displayName: record.displayName,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

function validateEmail(email: string) {
  const normalizedEmail = normalizeEmail(email)
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)

  if (!isEmail) {
    throw new Error("Некорректный email")
  }

  return normalizedEmail
}

function validatePassword(password: string) {
  if (password.length < 8) {
    throw new Error("Пароль должен содержать минимум 8 символов")
  }
}

function validateDisplayName(displayName: string) {
  const trimmedName = displayName.trim()

  if (trimmedName.length < 2) {
    throw new Error("Имя должно содержать минимум 2 символа")
  }

  if (trimmedName.length > 40) {
    throw new Error("Имя должно содержать максимум 40 символов")
  }

  return trimmedName
}

export function registerStubUser(input: RegisterStubUserInput): StubUserAccount {
  const email = validateEmail(input.email)
  validatePassword(input.password)
  const displayName = validateDisplayName(input.displayName)

  const existingUser = Array.from(store.values()).find((user) => user.email === email)
  if (existingUser) {
    throw new Error("Пользователь с таким email уже существует")
  }

  const timestamp = new Date().toISOString()
  const record: StubUserAccountRecord = {
    id: randomUUID(),
    email,
    displayName,
    passwordHash: hashPassword(input.password),
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  store.set(record.id, record)
  return toPublicAccount(record)
}

export function loginStubUser(input: LoginStubUserInput): StubUserAccount {
  const email = validateEmail(input.email)
  const passwordHash = hashPassword(input.password)

  const user = Array.from(store.values()).find((record) => record.email === email)
  if (!user || user.passwordHash !== passwordHash) {
    throw new Error("Неверный email или пароль")
  }

  return toPublicAccount(user)
}

export function getStubUserById(id: string): StubUserAccount | null {
  const user = store.get(id)
  if (!user) {
    return null
  }

  return toPublicAccount(user)
}

export function createStubAccessToken(userId: string): string {
  return `stub_${userId}`
}
