import { NextRequest, NextResponse } from 'next/server'
import { shareStore } from '@/lib/cache'

// GET  /api/share/:id        → SSE stream of live location updates
// POST /api/share/:id        → update location (sharer calls this)
// PUT  /api/share/:id        → create/init session

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const accept = req.headers.get('accept') ?? ''

  // SSE mode for live viewer
  if (accept.includes('text/event-stream')) {
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: unknown) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        }

        // Send current position immediately
        const current = shareStore.get(id)
        if (current) send(current)
        else send({ error: 'session_not_found' })

        // Poll for updates every 2 seconds for up to 60 minutes
        let ticks = 0
        const interval = setInterval(() => {
          ticks++
          const loc = shareStore.get(id)
          if (loc) send(loc)
          else send({ error: 'session_expired' })
          if (ticks > 1800) { // 60 min
            clearInterval(interval)
            controller.close()
          }
        }, 2000)

        req.signal.addEventListener('abort', () => {
          clearInterval(interval)
          controller.close()
        })
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }

  // Regular GET: return current snapshot
  const loc = shareStore.get(id)
  if (!loc) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  return NextResponse.json(loc)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { lat, lon, name, speed, heading } = body

  if (typeof lat !== 'number' || typeof lon !== 'number') {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  const entry = { lat, lon, name: name ?? 'Shared Location', speed, heading, updatedAt: Date.now() }
  shareStore.set(id, entry, 3600) // 1 hour TTL

  return NextResponse.json({ ok: true })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  shareStore.set(id, { ...body, updatedAt: Date.now() }, 3600)
  return NextResponse.json({ id })
}
