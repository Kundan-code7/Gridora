const candidateModels = ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-pro-latest'];

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ success: false, error: 'Method not allowed.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return response.status(503).json({ success: false, error: 'AI service is not configured.' });
  }

  const { prompt, isJson = false } = request.body || {};
  if (typeof prompt !== 'string' || !prompt.trim()) {
    return response.status(400).json({ success: false, error: 'A prompt is required.' });
  }

  for (const model of candidateModels) {
    try {
      const generationConfig = { temperature: 0.3 };
      if (isJson) generationConfig.responseMimeType = 'application/json';

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig
          })
        }
      );
      const data = await geminiResponse.json().catch(() => ({}));
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (geminiResponse.ok && text) {
        return response.status(200).json({ success: true, modelUsed: model, text });
      }
    } catch {
      // Try the next supported model without exposing provider details.
    }
  }

  return response.status(502).json({ success: false, error: 'Gemini service is currently unavailable.' });
}