# ERP WhatsApp Frontend

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto frontend com:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Nota:** Se não configurado, o sistema usa `http://localhost:3001` por padrão.

## Páginas Disponíveis

- `/admin/dashboard` - Dashboard principal
- `/admin/pos` - Sistema de vendas (POS)
- `/admin/products` - Gestão de produtos
- `/admin/customers` - Gestão de clientes
- `/admin/whatsapp` - Teste do WhatsApp Agent

## WhatsApp Agent

A página `/admin/whatsapp` permite testar o agent diretamente pela interface:

- Chat temporário para testes
- Configuração personalizada de Thread ID
- Histórico da conversa
- Interface responsiva

### Como usar:

1. Certifique-se de que o backend está rodando em `http://localhost:3001`
2. Acesse `/admin/whatsapp`
3. Digite mensagens para testar o agent
4. Use o botão "Limpar Chat" para reiniciar

## Desenvolvimento

```bash
npm run dev
```

Abre em [http://localhost:3000](http://localhost:3000)

## Funcionalidades

- **Produtos**: CRUD completo com variações, imagens e categorias
- **Clientes**: Gestão de clientes e histórico
- **POS**: Sistema de vendas com cálculos automáticos
- **Dashboard**: Métricas e gráficos
- **WhatsApp Agent**: Chat AI para atendimento

## API Integration

O frontend se comunica com o backend em `http://localhost:3001` usando:

- REST API para CRUD operations
- WebSocket para chat em tempo real (WhatsApp Agent)
- Authentication via JWT tokens
