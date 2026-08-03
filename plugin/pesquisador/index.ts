import { tool } from "@opencode-ai/plugin/tool"
import { z } from "zod"
import type { Plugin } from "@opencode-ai/plugin"

export default (({ client, project, directory, $ }) => {
  return {
    tool: {
      pesquisa_profunda: tool({
        description: "Define a estratégia de pesquisa profunda para um tópico. Use ANTES de começar a pesquisar para estruturar a investigação.",
        args: {
          consulta: z.string().describe("Termo de pesquisa ou pergunta a ser investigada"),
          profundidade: z.number().min(1).max(5).default(3).describe("Nível de profundidade (1=rápida, 5=exaustiva)"),
          fontes_minimas: z.number().min(2).max(10).default(3).describe("Mínimo de fontes distintas a consultar"),
        },
        async execute(args, ctx) {
          return {
            output: JSON.stringify({
              consulta: args.consulta,
              profundidade: args.profundidade,
              fontes_minimas: args.fontes_minimas,
              estrategia: args.profundidade >= 4
                ? "Pesquisa exaustiva: busque em PT e EN, priorize papers e docs oficiais"
                : args.profundidade >= 3
                  ? "Pesquisa aprofundada: mínimo 5 fontes, valide cada uma"
                  : "Pesquisa direcionada: foque em fontes oficiais e documentação",
              pipeline: [
                { etapa: 1, acao: `Buscar "${args.consulta}" com websearch`, ferramenta: "websearch" },
                { etapa: 2, acao: "Extrair conteúdo das URLs mais relevantes", ferramenta: "webfetch" },
                { etapa: 3, acao: "Comparar informações entre fontes e marcar contradições", ferramenta: "analise manual" },
                { etapa: 4, acao: "Refinar busca com novos termos encontrados", ferramenta: "websearch" },
                { etapa: 5, acao: "Compilar relatório final estruturado", ferramenta: "gerar_relatorio" },
              ]
            }, null, 2),
            metadata: { tipo: "estrategia_pesquisa" }
          }
        }
      }),

      gerar_relatorio: tool({
        description: "Compila e estrutura todas as descobertas da pesquisa em relatório final. Use ao FINAL de cada ciclo de pesquisa.",
        args: {
          titulo: z.string().describe("Título do relatório de pesquisa"),
          descobertas: z.string().describe("JSON array com objetos {fato, fonte, confiabilidade}"),
          fontes: z.string().describe("JSON array com objetos {url, titulo, tipo, data}"),
        },
        async execute(args, ctx) {
          const relatorio = `# ${args.titulo}

## Principais Descobertas
${JSON.parse(args.descobertas).map((d: any, i: number) => 
  `- **${d.fato}** — Fonte: ${d.fonte} (Confiabilidade: ${d.confiabilidade})`
).join("\n")}

## Fontes Consultadas
${JSON.parse(args.fontes).map((f: any, i: number) =>
  `${i + 1}. [${f.titulo}](${f.url}) — ${f.tipo} (${f.data})`
).join("\n")}

## Contradições ou Pontos de Atenção
[Preencha com divergências encontradas entre fontes]

## Limitações da Pesquisa
[Identifique gaps e vieses]

## Próximos Passos
[Recomendações baseadas nas descobertas]
`
          return {
            output: relatorio,
            metadata: { tipo: "relatorio_final" }
          }
        }
      }),

      validar_fonte: tool({
        description: "Avalia a confiabilidade de uma fonte de pesquisa com critérios objetivos",
        args: {
          url: z.string().describe("URL da fonte a ser avaliada"),
          dominio: z.string().optional().describe("Domínio da fonte (extraído automaticamente da URL)"),
        },
        async execute(args, ctx) {
          const dominio = args.dominio || new URL(args.url).hostname
          const criterios = [
            { nome: "Domínio oficial (.gov, .edu, .org)", peso: "alto" },
            { nome: "Documentação oficial de projeto open-source", peso: "alto" },
            { nome: "Blog de empresa/instituição reconhecida", peso: "médio" },
            { nome: "Artigo com autor identificado e credenciais", peso: "médio" },
            { nome: "Fórum/redes sociais", peso: "baixo - exige verificação cruzada" },
            { nome: "Blog pessoal sem credenciais", peso: "baixo - exige verificação cruzada" },
          ]
          return {
            output: JSON.stringify({
              url: args.url,
              dominio,
              avaliacao: `Analisar "${dominio}" contra os critérios abaixo e atribuir nível de confiabilidade`,
              criterios,
              instrucao: "Compare contra outras fontes. Se for única fonte de uma informação, busque confirmação."
            }, null, 2),
            metadata: { tipo: "validacao_fonte" }
          }
        }
      }),
    },

    "experimental.chat.system.transform": async (input, output) => {
      output.system.push(`
[METODOLOGIA DE PESQUISA — PROTOCOLO CIENTÍFICO]
Sempre que fizer pesquisa, siga este ciclo:
1. HIPÓTESE → O que espero encontrar?
2. COLETA → Mínimo 5 fontes, priorizando oficiais
3. VERIFICAÇÃO → Cruzar informações entre fontes
4. SÍNTESE → Integrar em narrativa coesa
5. LIMITAÇÕES → Identificar gaps e vieses

FERRAMENTAS DISPONÍVEIS:
- pesquisa_profunda: Define estratégia antes de começar
- validar_fonte: Avalia confiabilidade de cada URL encontrada
- gerar_relatorio: Compila descobertas ao final

PRIORIDADE DE FONTES:
1. Documentação oficial / papers (máxima)
2. Repositórios oficiais (alta)
3. Sites institucionais (alta)
4. Blogs de autoridades no assunto (média)
5. Fóruns/redes sociais (baixa — validar com 2+ outras fontes)
`)
    },

    "tool.execute.before": async (input, output) => {
      if (input.tool === "websearch" && output.args?.query) {
        const query = output.args.query as string
        const cleaned = query
          .replace(/^(buscar|pesquisar|search|find|procure|ache)\s+/i, "")
          .trim()
        if (cleaned !== query) {
          output.args.query = cleaned
        }
      }
    },

    "tool.execute.after": async (input, output) => {
      if (input.tool === "webfetch" && output.output) {
        const len = output.output.length
        if (len > 60000) {
          const lines = output.output.split("\n")
          output.output = lines.slice(0, 400).join("\n") +
            "\n\n[... " + (lines.length - 500) + " linhas intermediárias omitidas para foco na pesquisa ...]\n\n" +
            lines.slice(-100).join("\n")
          output.title = output.title || "Página truncada (>60k chars)"
        }
      }
    },
  }
}) satisfies Plugin
