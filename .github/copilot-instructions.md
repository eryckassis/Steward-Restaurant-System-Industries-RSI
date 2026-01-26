# Instruções do Copilot

## Guidelines de Performance

Sempre consulte e aplique as regras em `guidelines/` ao:

- Criar ou modificar componentes React
- Implementar data fetching
- Revisar código existente
- Otimizar performance

### Estrutura de arquivos:

- `guidelines/SKILL.md` - Metadados e referência rápida das regras
- `guidelines/AGENTS.md` - Documento principal com explicações detalhadas
- `guidelines/rules/*.md` - Regras individuais com exemplos específicos

### Prioridade das regras:

1. **CRÍTICO**: `async-*` (waterfalls) e `bundle-*` (bundle size)
2. **ALTO**: `server-*` (server-side)
3. **MÉDIO**: `client-*`, `rerender-*`, `rendering-*`
4. **BAIXO**: `js-*`, `advanced-*`

### Quando consultar:

- `guidelines/SKILL.md` → Para visão geral e quando aplicar
- `guidelines/AGENTS.md` → Para explicações completas
- `guidelines/rules/<prefixo>-<regra>.md` → Para detalhes específicos de uma regra
