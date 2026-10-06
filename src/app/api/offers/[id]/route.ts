import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { status } = await req.json();
  if (!["Pendente", "Aprovada", "Rejeitada"].includes(status)) return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  const { error } = await db().from("offers").update({ status }).eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
