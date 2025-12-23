# Guia de Implantação

## Pré-requisitos

1. Conta no Vercel
2. Integração Supabase configurada
3. Integração Vercel Blob configurada

## Variáveis de Ambiente

As seguintes variáveis são configuradas automaticamente pelas integrações:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database (Supabase)
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=
POSTGRES_HOST=

# Vercel Blob
BLOB_READ_WRITE_TOKEN=

# Desenvolvimento (opcional)
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
```

## Passos para Deploy

### 1. Configurar Integrações

No v0 ou Vercel:
1. Conecte a integração Supabase
2. Conecte a integração Vercel Blob
3. Verifique se todas as variáveis de ambiente estão configuradas

### 2. Executar Scripts SQL

Execute os scripts na ordem:
1. `001_create_tables.sql`
2. `002_seed_data.sql`
3. `003_create_restaurant_profile.sql`
4. `004_enable_rls.sql`

Você pode executar diretamente no v0 clicando nos botões de execução.

### 3. Deploy

O deploy é automático no Vercel quando você:
1. Faz commit no repositório
2. Ou clica em "Publish" no v0

### 4. Configurar Email do Supabase (Produção)

Para produção, configure o provedor de email no Supabase:
1. Vá para Project Settings > Auth > Email Templates
2. Configure SMTP ou use o provedor padrão
3. Personalize os templates de email se necessário

### 5. Verificar Funcionamento

1. Acesse a URL de produção
2. Crie uma conta de teste
3. Verifique o email de confirmação
4. Faça login e teste todas as funcionalidades

## Troubleshooting

### Email não está chegando
- Verifique a pasta de spam
- Configure SMTP no Supabase
- Para desenvolvimento, desabilite confirmação de email

### Erro 401 nas APIs
- Verifique se o usuário está autenticado
- Limpe os cookies e faça login novamente
- Verifique se as variáveis de ambiente estão corretas

### RLS bloqueando operações
- Verifique se o usuário confirmou o email
- Verifique se as políticas RLS estão corretas
- Verifique se o user_id está sendo passado corretamente

### Imagens não carregam
- Verifique se BLOB_READ_WRITE_TOKEN está configurado
- Verifique se o arquivo é menor que 5MB
- Verifique o formato do arquivo (jpg, png, gif, webp)

## Monitoramento

Use o Vercel Analytics para monitorar:
- Tempo de resposta das APIs
- Erros e exceções
- Uso de recursos
- Performance do frontend

## Backup

Configure backups automáticos no Supabase:
1. Project Settings > Database > Backups
2. Configure schedule de backups diários
3. Mantenha pelo menos 7 dias de histórico
