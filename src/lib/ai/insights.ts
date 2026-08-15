export async function generateInsight(prompt: string, context: object): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: buildPrompt(prompt, context),
        },
      ],
    }),
  })

  const data = await response.json()
  return data.content[0].text
}

function buildPrompt(question: string, context: object): string {
  return `You are a workforce analytics assistant for a construction company. Use the following data to answer the question.\n\nContext:\n${JSON.stringify(context, null, 2)}\n\nQuestion: ${question}`
}
