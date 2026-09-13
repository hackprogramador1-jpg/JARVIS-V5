export default async function handler(req, res) {
  // Permitir chamadas do navegador
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Responder ao preflight do navegador
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Aceitar somente POST
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método não permitido."
    });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OPENAI_API_KEY não configurada no Vercel."
      });
    }

    const body = req.body || {};

    const message = String(body.message || "").trim();

    const memory = Array.isArray(body.memory)
      ? body.memory.slice(-30)
      : [];

    if (!message) {
      return res.status(400).json({
        error: "Nenhuma mensagem foi enviada."
      });
    }

    const model =
      process.env.OPENAI_MODEL || "gpt-5.6-luna";

    // Memórias conhecidas pelo JARVIS
    const memoryText =
      memory.length > 0
        ? memory
            .map((item, index) => {
              return `${index + 1}. ${String(item)}`;
            })
            .join("\n")
        : "Nenhuma memória registrada.";

    const instructions = `
Você é JARVIS, um assistente de inteligência artificial avançado.

Sua função é conversar, responder perguntas, explicar assuntos,
analisar problemas, ensinar, estudar, programar, raciocinar e ajudar
o usuário de maneira clara e útil.

Você pode responder sobre:
- programação
- JavaScript
- HTML
- CSS
- Firebase
- bancos de dados
- APIs
- desenvolvimento web
- Android
- jogos
- inteligência artificial
- matemática
- física
- química
- biologia
- história
- geografia
- ciência
- tecnologia
- estudos
- lógica
- negócios
- criação de projetos
- análise de problemas
- assuntos gerais

REGRAS:

1. Nunca invente informações quando não tiver segurança.
2. Se não souber algo, diga claramente que não sabe.
3. Explique assuntos difíceis de forma simples quando necessário.
4. Quando estiver ensinando programação, dê exemplos funcionais.
5. Considere as memórias do usuário como contexto, mas não trate
   informações possivelmente falsas como fatos confirmados.
6. Não revele chaves de API, senhas ou informações secretas.
7. Responda em português do Brasil, salvo se o usuário pedir outro idioma.
8. Seja direto, mas dê detalhes suficientes para resolver o problema.
9. Se o usuário pedir para guardar uma informação, indique no final:
   MEMORY_TO_SAVE: informação que deve ser guardada
10. Se não houver nada para guardar, não escreva MEMORY_TO_SAVE.

MEMÓRIA ATUAL DO JARVIS:
${memoryText}
`;

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          instructions,
          input: message
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro da OpenAI:", data);

      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "Erro ao consultar a inteligência do JARVIS."
      });
    }

    let answer = "";

    // Resposta simplificada da Responses API
    if (typeof data.output_text === "string") {
      answer = data.output_text;
    }

    // Fallback caso output_text não venha disponível
    if (!answer && Array.isArray(data.output)) {
      for (const item of data.output) {
        if (!Array.isArray(item.content)) continue;

        for (const content of item.content) {
          if (
            content &&
            content.type === "output_text" &&
            typeof content.text === "string"
          ) {
            answer += content.text;
          }
        }
      }
    }

    answer = answer.trim();

    if (!answer) {
      return res.status(500).json({
        error: "O JARVIS não retornou uma resposta."
      });
    }

    // Detectar informação que o usuário pediu para memorizar
    let memoryToSave = null;

    const marker = "MEMORY_TO_SAVE:";

    const markerIndex = answer.indexOf(marker);

    if (markerIndex !== -1) {
      memoryToSave = answer
        .substring(markerIndex + marker.length)
        .trim();

      answer = answer
        .substring(0, markerIndex)
        .trim();
    }

    return res.status(200).json({
      success: true,
      answer,
      memoryToSave,
      model
    });

  } catch (error) {
    console.error("Erro interno:", error);

    return res.status(500).json({
      error:
        error?.message ||
        "Erro interno no servidor do JARVIS."
    });
  }
}
