# RestaurantOS - Sistema de Gerenciamento de Inventário para Restaurantes

## Funcionalidades Implementadas

### 🔐 Autenticação e Segurança

- **Sistema de Login/Registro**
  - Autenticação via Supabase Auth com JWT
  - Email de verificação obrigatório
  - Proteção de rotas via middleware
  - Sessões seguras com cookies HTTP-only
  - Row Level Security (RLS) em todas as tabelas

- **Gestão de Senha**
  - Alteração de senha com validação
  - Requisito mínimo de 6 caracteres
  - Verificação de senha atual antes de alterar

- **Autenticação de 2 Fatores (2FA)**
  - Suporte via Email ou SMS
  - Badge de verificação apenas para emails confirmados
  - Ativação/desativação sob demanda

### 👤 Perfil de Usuário

- **Informações Pessoais**
  - Nome completo editável
  - Email com validação e confirmação
  - Avatar com upload e crop de imagem
  - Badge de verificação visual

- **Upload de Imagens**
  - Crop de imagem com opções quadrada ou circular
  - Zoom e ajuste de enquadramento
  - Validação de tamanho (máx 5MB)
  - Validação de resolução (máx 3840px - abaixo de 4K)
  - Preview em tempo real

### 🏢 Perfil do Restaurante

- **Informações do Estabelecimento**
  - Nome do restaurante
  - Logo com upload e crop
  - Email e telefone de contato
  - Endereço completo (rua, cidade, estado, CEP, país)

- **Estado Global**
  - Context API para sincronização de dados
  - Logo atualiza automaticamente no header
  - Avatar do usuário sincronizado em tempo real

### 📦 Gerenciamento de Inventário

- **Itens de Inventário**
  - CRUD completo (Criar, Ler, Atualizar, Deletar)
  - Imagem de produto com crop
  - Nome, categoria, quantidade, unidade
  - Estoque mínimo e custo unitário
  - Fornecedor opcional

- **Busca e Filtros**
  - Busca em tempo real por nome
  - Filtro por categoria (Vegetais, Carnes, Laticínios, etc.)
  - Filtro por status (Crítico, Baixo, Médio, OK)
  - Badges visuais de filtros ativos
  - Botão de limpar todos os filtros

- **Movimentações de Estoque**
  - Registro de entradas
  - Registro de saídas
  - Registro de desperdícios
  - Ajustes de inventário
  - Histórico completo de movimentações

- **Alertas de Estoque**
  - Alerta crítico (≤30% do mínimo)
  - Alerta baixo (≤60% do mínimo)
  - Alerta médio (≤100% do mínimo)
  - Status OK (>100% do mínimo)

### 🔔 Sistema de Notificações

- **Notificações no Header**
  - Badge com contagem de notificações não lidas
  - Dropdown com lista de notificações
  - Tipos: estoque baixo, crítico, desperdício, reabastecimento
  - Marcar como lida
  - Filtrar por tipo

### 📊 Dashboard e Analytics

- **Estatísticas em Tempo Real**
  - Total de itens no inventário
  - Valor total do estoque
  - Itens com estoque baixo
  - Total de desperdício

- **Gráficos de Inventário**
  - Dados reais dos últimos 6 meses
  - Movimentações por data
  - Agrupamento por mês
  - Integração com banco de dados

- **Gráfico de Desperdício**
  - Dados reais de desperdícios
  - Custos por período
  - Análise de tendências

- **Atividades Recentes**
  - Log de todas as ações
  - Histórico de movimentações
  - Timestamps precisos

### 🎨 Interface e Design

- **Modo Escuro/Claro**
  - Toggle no header
  - Tema escuro com preto puro (#000)
  - Tema claro profissional
  - Persistência de preferência
  - Transições suaves

- **Design Responsivo**
  - Mobile-first
  - Layouts adaptativos
  - Componentes shadcn/ui
  - Ícones Lucide React

- **Estados de Loading**
  - Skeletons animados
  - Feedback visual em todas as operações
  - Indicadores de progresso
  - Mensagens de erro amigáveis

### 🛠️ Tecnologias Utilizadas

- **Frontend**
  - Next.js 16 (App Router)
  - React 19.2
  - TypeScript
  - Tailwind CSS v4
  - shadcn/ui components
  - react-easy-crop para crop de imagens

- **Backend**
  - Next.js API Routes
  - Supabase (PostgreSQL)
  - Supabase Auth (JWT)
  - Row Level Security (RLS)

- **Armazenamento**
  - Vercel Blob (imagens)
  - Supabase PostgreSQL (dados)

### 📝 Scripts SQL Disponíveis

1. `001_create_tables.sql` - Tabelas principais
2. `002_seed_data.sql` - Dados de exemplo
3. `003_create_restaurant_profile.sql` - Perfil do restaurante
4. `004_enable_rls.sql` - Segurança RLS
5. `005_fix_restaurant_profile.sql` - Correções de perfil
6. `006_add_user_id_to_profile.sql` - Vínculo de usuário
7. `007_create_stock_movements.sql` - Movimentações e notificações
8. `008_add_image_to_inventory.sql` - Suporte a imagens

### 🚀 Como Usar

1. Execute os scripts SQL na ordem numérica
2. Configure as variáveis de ambiente (Supabase e Vercel Blob)
3. Faça login ou crie uma conta
4. Configure o perfil do restaurante
5. Adicione itens ao inventário
6. Registre movimentações de entrada/saída
7. Monitore alertas e estatísticas no dashboard

### 🔒 Segurança

- Todas as rotas de API protegidas com autenticação
- Row Level Security habilitado em todas as tabelas
- Tokens JWT gerenciados pelo Supabase
- Cookies HTTP-only para sessões
- Validação de inputs em cliente e servidor
- Sanitização de queries SQL via Supabase client

### 📱 Funcionalidades Futuras Sugeridas

- Relatórios em PDF
- Exportação de dados (CSV/Excel)
- Integração com fornecedores
- Sistema de pedidos automáticos
- Previsão de demanda com IA
- Multi-restaurante (franquias)
- App mobile nativo
