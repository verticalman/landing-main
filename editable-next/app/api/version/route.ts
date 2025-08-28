import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const sha = process.env.NEXT_PUBLIC_BUILD_SHA || 'unknown'
  const time = process.env.NEXT_PUBLIC_BUILD_TIME || 'unknown'
  return NextResponse.json({ sha, time })
}
