import { NextResponse } from "next/server";
import { riddleCycleKey } from "../../lib/kimia";
import { submitRiddleAnswer } from "../../lib/kimia-db";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      cycleKey?: string;
      pseudo?: string;
      answer?: string;
    };
    const cycleKey = body.cycleKey || riddleCycleKey(new Date());
    const pseudo = body.pseudo?.trim();
    const answer = body.answer?.trim();

    if (!pseudo || !answer) {
      return NextResponse.json({ error: "Pseudo et reponse requis." }, { status: 400 });
    }

    const result = await submitRiddleAnswer(cycleKey, pseudo, answer);

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store, max-age=0"
      }
    });
  } catch (error) {
    console.error("Unable to submit answer", error);

    return NextResponse.json(
      { error: "La reponse n'a pas pu etre enregistree." },
      { status: 500 }
    );
  }
}
