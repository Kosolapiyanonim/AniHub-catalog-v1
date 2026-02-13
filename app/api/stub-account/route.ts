import { NextResponse } from "next/server"
import { createStubAccessToken, getStubUserById, registerStubUser } from "@/lib/stub-account-store"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  if (!body) {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 })
  }

  try {
    const account = registerStubUser({
      email: body.email,
      password: body.password,
      displayName: body.displayName,
    })

    return NextResponse.json(
      {
        account,
        accessToken: createStubAccessToken(account.id),
        mode: "stub",
        message: "Черновой аккаунт создан. Можно использовать для интеграции в UI.",
      },
      { status: 201 },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось создать пользователя"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Укажите id" }, { status: 400 })
  }

  const account = getStubUserById(id)
  if (!account) {
    return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 })
  }

  return NextResponse.json({ account, mode: "stub" })
}
