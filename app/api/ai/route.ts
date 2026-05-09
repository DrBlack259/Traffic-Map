import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const { messages, context } = await req.json()

  const systemPrompt = `You are a helpful navigation assistant embedded in a live traffic map app.
The user is currently using a map with real-time traffic data.

Current context:
${context?.route ? `- Active route: ${context.route.origin} → ${context.route.destination}
- Distance: ${context.route.distance}
- Duration: ${context.route.duration}
- Transport mode: ${context.route.mode}` : '- No active route'}
${context?.incidents?.length ? `- Nearby traffic incidents: ${context.incidents.join(', ')}` : '- No nearby incidents'}
${context?.location ? `- User location: ${context.location}` : ''}

Be concise and helpful. Answer navigation questions, suggest nearby places, explain traffic conditions, or recommend routes. Keep responses under 3 sentences unless a detailed breakdown is needed.`

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (text: string) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))

      try {
        const response = await client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 512,
          system: [
            {
              type: 'text',
              text: systemPrompt,
              cache_control: { type: 'ephemeral' },
            },
          ],
          messages: messages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          })),
          stream: true,
        })

        for await (const event of response) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            send(event.delta.text)
          }
        }
      } catch (err) {
        send('[Error: ' + (err instanceof Error ? err.message : 'Unknown') + ']')
      } finally {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
