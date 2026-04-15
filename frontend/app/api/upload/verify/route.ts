import { cookies } from "next/headers";

export async function POST(request: Request) {
  const body = await request.json();
  const cookieStore = await cookies();

  // forward all cookies as-is so HttpOnly auth cookie reaches Spring Boot
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/upload/verify`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const error = await res.text();
    return Response.json({ error }, { status: res.status });
  }

  return Response.json(await res.json());
}