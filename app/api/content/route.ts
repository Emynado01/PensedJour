import { NextResponse } from "next/server";
import { DailyQuote, DailyRiddle, riddleCycleKey } from "../../lib/kimia";
import { getOrCreateContent, resetContent, saveContent } from "../../lib/kimia-db";

function cycleKeyFrom(request: Request) {
  const url = new URL(request.url);
  return url.searchParams.get("cycleKey") || riddleCycleKey(new Date());
}

export async function GET(request: Request) {
  try {
    const content = await getOrCreateContent(cycleKeyFrom(request));

    return NextResponse.json(content, {
      headers: {
        "Cache-Control": "no-store, max-age=0"
      }
    });
  } catch (error) {
    console.error("Unable to load content", error);

    return NextResponse.json(
      { error: "Le contenu du jour n'a pas pu etre charge." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      cycleKey?: string;
      quote?: DailyQuote;
      riddle?: DailyRiddle;
    };

    if (!body.cycleKey || !body.quote || !body.riddle) {
      return NextResponse.json({ error: "Payload invalide." }, { status: 400 });
    }

    const content = await saveContent(body.cycleKey, body.quote, body.riddle);

    return NextResponse.json(content, {
      headers: {
        "Cache-Control": "no-store, max-age=0"
      }
    });
  } catch (error) {
    console.error("Unable to save content", error);

    return NextResponse.json(
      { error: "Le contenu n'a pas pu etre sauvegarde." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const content = await resetContent(cycleKeyFrom(request));

    return NextResponse.json(content, {
      headers: {
        "Cache-Control": "no-store, max-age=0"
      }
    });
  } catch (error) {
    console.error("Unable to reset content", error);

    return NextResponse.json(
      { error: "Le contenu n'a pas pu etre reinitialise." },
      { status: 500 }
    );
  }
}
