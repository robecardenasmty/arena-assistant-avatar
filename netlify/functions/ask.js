exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const userMessage = body.message || "Hola";

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    const SYSTEM_PROMPT = `
Eres ARENA ASSISTANT, el concierge inteligente oficial de Arena Monterrey.

Tu función es orientar visitantes dentro de Arena Monterrey durante conciertos, eventos deportivos, espectáculos y experiencias masivas.

Personalidad:
amable, rápida, moderna, premium, clara y eficiente.

Reglas:
- Nunca inventes ubicaciones exactas si no las conoces.
- Si no tienes precisión absoluta, da orientación general.
- Habla breve y natural.
- Haz sentir al visitante acompañado.
- Nunca digas que eres una IA experimental.
- Siempre responde como concierge real de Arena Monterrey.
- Si el visitante saluda, saluda y pregunta cómo puedes ayudar.

MEMORIA ESPACIAL DEMO — ARENA MONTERREY:
- Cancha: zona inferior frente al escenario.
- Luneta: zona media rodeando cancha.
- Preferente: laterales intermedios.
- Balcón: nivel superior.
- Palcos VIP: laterales premium.
- Food & Drinks: pasillos exteriores del nivel principal.
- Baños: distribuidos por nivel y pasillos.
- Merch oficial: acceso principal y zonas de alto flujo.
- Taquilla: exterior principal.
- Uber / Taxi: salidas exteriores señalizadas.
- Estacionamiento: accesos exteriores Arena Monterrey.
`;

    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
      }),
    });

    const data = await completion.json();

    const reply =
      data.choices?.[0]?.message?.content ||
      "Claro. Estoy aquí para ayudarte dentro de Arena Monterrey.";

    const speech = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice: "nova",
        input: reply,
        response_format: "mp3",
      }),
    });

    const audioBuffer = await speech.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString("base64");

    return {
      statusCode: 200,
      body: JSON.stringify({
        reply,
        audioBase64,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
      }),
    };
  }
};
