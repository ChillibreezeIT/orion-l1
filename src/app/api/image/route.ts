import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  const image = await openai.images.generate({
    prompt,
    model: "dall-e-3",
    n: 1,
    size: "1024x1024",
  });

  return NextResponse.json({ imageUrl: image.data[0].url });
}
