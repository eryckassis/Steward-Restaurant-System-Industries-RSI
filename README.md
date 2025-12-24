<img width="1584" height="396" alt="Design sem nome (1)" src="https://github.com/user-attachments/assets/031eb32c-bfeb-4043-9441-666a1e6c7dbe" />


# STEWARD  - RESTAURANT SYSTEM INDUSTRIES RSI

Sistema completo de gerenciamento de inventário para restaurantes com autenticação, CRUD completo e análises em tempo real.

## Funcionalidades

### Autenticação e Segurança
- Login e registro de usuários com Supabase Auth
- Autenticação JWT com cookies HTTP-only
- Proteção de rotas com middleware
- Row Level Security (RLS) no banco de dados
- Logout funcional com limpeza de sessão
- Redirecionamento automático para páginas protegidas

### Dashboard
- Visão geral do inventário em tempo real
- Estatísticas de itens, valor total e desperdício
- Gráficos de níveis de inventário
- Alertas de estoque baixo
- Registro de atividades recentes

### Inventário
- CRUD completo de itens (Criar, Ler, Atualizar, Deletar)
- Busca em tempo real por nome
- Filtros por categoria (Vegetais, Carnes, Laticínios, Temperos, Grãos, Bebidas)
- Filtros por status (Crítico, Baixo, Médio, OK)
- Badges visuais para status do estoque
- Registro automático de atividades

### Perfil
- Upload de logo do restaurante (Vercel Blob)
- Edição de informações do restaurante
- Formulário completo com validação
- Preview de imagem em tempo real

## Tecnologias

- **Next.js 16** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Supabase** - Banco de dados PostgreSQL + Auth
- **Vercel Blob** - Storage de imagens
- **Tailwind CSS v4** - Estilização
- **shadcn/ui** - Componentes UI
- **SWR** - Cache e sincronização de dados
- **Lucide Icons** - Ícones

## Como Usar

### 1. Primeiro Acesso

1. Acesse a aplicação
2. Clique em "Criar Conta"
3. Preencha:
   - Nome do Restaurante
   - Email
   - Senha (mínimo 6 caracteres)
   - Confirme a senha
4. Verifique seu email para confirmar a conta
5. Faça login com suas credenciais

### 2. Dashboard

Após o login, você será redirecionado para o dashboard onde pode ver:
- Total de itens no inventário
- Itens com estoque baixo
- Valor total do inventário
- Gráficos e atividades recentes

### 3. Gerenciar Inventário

**Adicionar Item:**
1. Vá para a página "Inventário"
2. Clique em "Adicionar Item"
3. Preencha os dados:
   - Nome do ingrediente
   - Categoria
   - Quantidade
   - Unidade de medida
   - Estoque mínimo
   - Custo por unidade
   - Fornecedor
4. Clique em "Salvar"

**Editar Item:**
1. Clique no ícone de edição (lápis) ao lado do item
2. Modifique os dados necessários
3. Clique em "Salvar"

**Deletar Item:**
1. Clique no ícone de deletar (lixeira) ao lado do item
2. Confirme a exclusão

**Buscar e Filtrar:**
- Use a barra de busca para encontrar itens por nome
- Selecione categorias para filtrar por tipo
- Selecione status para ver itens críticos, baixos, médios ou ok

### 4. Atualizar Perfil

1. Clique no avatar no canto superior direito
2. Selecione "Perfil"
3. Faça upload do logo do restaurante (opcional)
4. Preencha as informações:
   - Nome do restaurante
   - Email de contato
   - Telefone
   - Endereço completo
5. Clique em "Salvar Alterações"

### 5. Logout

1. Clique no avatar no canto superior direito
2. Clique em "Sair"
3. Você será redirecionado para a página de login

## Estrutura do Banco de Dados

### Tabelas

**inventory_items**
- id, name, category, quantity, unit
- min_stock, cost_per_unit, supplier
- last_restocked, created_at, updated_at

**activity_log**
- id, item_id, action, quantity
- description, created_at

**restaurant_profile**
- id, user_id, name, email, phone
- address, city, state, zip_code, country
- logo_url, created_at, updated_at

### Row Level Security (RLS)

Todas as tabelas possuem RLS ativado:
- Usuários autenticados podem ver e gerenciar todos os itens do inventário
- Usuários só podem ver e editar seu próprio perfil
- Logs de atividade são protegidos por autenticação

## API Routes

Todas as rotas exigem autenticação JWT:

### Autenticação
- `POST /api/auth/logout` - Fazer logout
- `GET /api/auth/user` - Obter usuário atual

### Inventário
- `GET /api/inventory` - Listar itens (com busca e filtros)
- `POST /api/inventory` - Criar item
- `PUT /api/inventory/[id]` - Atualizar item
- `DELETE /api/inventory/[id]` - Deletar item

### Perfil
- `GET /api/profile` - Obter perfil do restaurante
- `PUT /api/profile` - Atualizar perfil

### Outros
- `GET /api/stats` - Obter estatísticas do dashboard
- `GET /api/activity` - Obter atividades recentes
- `POST /api/upload` - Upload de imagens

## Segurança

O sistema implementa múltiplas camadas de segurança:

1. **Autenticação JWT** - Tokens seguros gerenciados pelo Supabase
2. **Cookies HTTP-only** - Proteção contra XSS
3. **Middleware** - Validação de autenticação em todas as rotas protegidas
4. **Row Level Security** - Políticas de acesso no banco de dados
5. **Validação de entrada** - Validação de dados no frontend e backend
6. **HTTPS** - Comunicação criptografada (quando em produção)

## Scripts SQL Disponíveis

Execute os scripts na ordem para configurar o banco de dados:

1. `001_create_tables.sql` - Cria tabelas principais
2. `002_seed_data.sql` - Insere dados de exemplo
3. `003_create_restaurant_profile.sql` - Cria tabela de perfil
4. `004_enable_rls.sql` - Ativa Row Level Security

## Suporte

Para problemas ou dúvidas, entre em contato com o suporte.
