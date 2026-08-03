# OpenCode - Agente Pesquisador Nato

Configuração completa do OpenCode com agente **Pesquisador** — subagente que executa loops de pesquisa adaptativa.

## Agentes

### 🧠 Pesquisador
Executa pesquisa em loop contínuo, refinando buscas com base nos resultados encontrados:
- Busca múltiplas fontes (mínimo 3)
- Analisa e extrai termos-chave
- Refina buscas iterativamente
- Cruza informações e valida consistência
- Entrega resumo estruturado com fontes e recomendações

## Estrutura

```
~/.config/opencode/
├── agent/
│   └── pesquisador.md       # Agente pesquisador
├── command/                 # Comandos customizados
├── plugin/                  # Plugins
├── opencode.jsonc.example  # Template de config (copie para opencode.jsonc)
├── AGENTS.md.example       # Template de regras (copie para AGENTS.md)
├── MODELOS-GATUITOS.md     # Documentação de modelos gratuitos
├── tui.json                # Config da interface
└── .gitignore              # Exclui arquivos sensíveis
```

## Instalação

```bash
# Clone no diretório de config do OpenCode
git clone git@github.com:SEU_USER/opencode-agent-pesquisador-nato.git ~/.config/opencode

# Copie e edite os templates com suas credenciais
cp opencode.jsonc.example opencode.jsonc
cp AGENTS.md.example AGENTS.md

# Reinicie o opencode
```
