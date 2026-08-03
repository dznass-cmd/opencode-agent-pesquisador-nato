# OpenCode - Agente Pesquisador Nato

Configuração completa do OpenCode com agente **Pesquisador** e **plugin de ferramentas** para pesquisa adaptativa.

## Agentes

### 🧠 Pesquisador (Subagente)
Agente que executa pesquisa científica em loop contínuo com 4 fases:

1. **Estratégia** — Define profundidade e pipeline com `pesquisa_profunda`
2. **Coleta** — Busca multi-fonte (`websearch`), valida com `validar_fonte`, extrai com `webfetch`
3. **Análise** — Cruza informações, identifica contradições e consensos
4. **Síntese** — Gera relatório estruturado com `gerar_relatorio`

## Plugin — Ferramentas de Pesquisa

O plugin `pesquisador` adiciona 3 ferramentas customizadas:

| Ferramenta | Função |
|---|---|
| `pesquisa_profunda` | Define estratégia, profundidade e pipeline antes de começar |
| `validar_fonte` | Avalia confiabilidade de URLs com critérios objetivos |
| `gerar_relatorio` | Compila descobertas em relatório estruturado final |

### Hooks do plugin
- `system.transform` — Injeta protocolo científico no system prompt
- `tool.execute.before` — Otimiza queries de busca (remove palavras desnecessárias)
- `tool.execute.after` — Trunca páginas muito longas (>60k chars) para foco na pesquisa

## Estrutura

```
~/.config/opencode/
├── agent/
│   └── pesquisador.md           # Agente pesquisador
├── plugin/
│   └── pesquisador/
│       └── index.ts             # Plugin com ferramentas customizadas
├── command/                     # Comandos customizados
├── opencode.jsonc.example      # Template de config
├── AGENTS.md.example           # Template de regras
├── MODELOS-GATUITOS.md         # Documentação de modelos gratuitos
├── tui.json                    # Config da interface
└── .gitignore
```

## Instalação

```bash
# Clone no diretório de config do OpenCode
git clone git@github.com:dznass-cmd/opencode-agent-pesquisador-nato.git ~/.config/opencode

# Copie e edite os templates com suas credenciais
cp opencode.jsonc.example opencode.jsonc
cp AGENTS.md.example AGENTS.md

# Instale as dependências do plugin
npm install

# Reinicie o opencode
```
