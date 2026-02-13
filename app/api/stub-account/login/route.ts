import { NextResponse } from "next/server"
import { createStubAccessToken, loginStubUser } from "@/lib/stub-account-store"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  if (!body) {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 })
  }

  try {
    const account = loginStubUser({
      email: body.email,
      password: body.password,
    })

    return NextResponse.json({
      account,
      accessToken: createStubAccessToken(account.id),
      mode: "stub",
      message: "Черновой вход выполнен успешно",
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось выполнить вход"
    return NextResponse.json({ error: message }, { status: 401 })
  }
}
