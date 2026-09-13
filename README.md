# JARVIS V5 — Core Intelligence

Esta versão deixa de usar uma pequena lista de respostas dentro do HTML.
A interface continua no estilo do vídeo, mas o "cérebro" fica no servidor.

## Arquivos
- index.html — interface, voz, memória local e visual.
- api/chat.js — núcleo que conversa com o modelo de IA sem expor a chave no navegador.
- .env.example — variáveis do servidor.
- vercel.json — configuração da função.

## Vercel
1. Envie estes arquivos para um repositório GitHub.
2. Importe o repositório na Vercel.
3. Em Settings > Environment Variables, crie:
   OPENAI_API_KEY = sua chave
   OPENAI_MODEL = gpt-5.6-luna
4. Faça redeploy.
5. Abra o site e permita o microfone.

IMPORTANTE:
Nunca coloque OPENAI_API_KEY dentro do index.html ou em JavaScript que roda no navegador.

## Memória
O V5 salva localmente no navegador as informações que o usuário mandar o JARVIS memorizar.
Isso é uma primeira camada. Para memória sincronizada entre celulares/contas, a próxima etapa é ligar Firebase/Firestore ao endpoint.

## Conhecimento
O modelo fornece a base geral de conhecimento. O JARVIS não "contém todas as informações do mundo" dentro do HTML. Para atualização automática, a próxima camada deve adicionar pesquisa web e uma base de documentos/RAG.
