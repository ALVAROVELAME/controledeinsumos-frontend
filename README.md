# Controle de Insumos — Frontend

Aplicação web para acompanhar insumos, fornecedores, compras, vendas e estoque. O frontend reúne uma página institucional, autenticação e um painel protegido que consome uma API separada.

## Funcionalidades

- Cadastro, login, confirmação de e-mail e recuperação de senha por e-mail.
- Painel com indicadores, gráficos de compras, vendas, lucro e margem, além de alertas de reposição.
- Cadastro, consulta, edição e exclusão de insumos e fornecedores.
- Registro, edição, consulta e exclusão de movimentações de compra, venda e ajuste.
- Filtros e ordenação de dados; exportação de movimentações em CSV e download de backup em JSON.
- Tema claro ou escuro, navegação por teclado, paleta de comandos e páginas de termos e privacidade.
- Carregamento das páginas sob demanda e pré-carregamento em segundo plano quando as condições de conexão permitem.

A recuperação por e-mail depende da API e do serviço de envio de mensagens configurados. A interface de exclusão de conta ainda informa que a operação não está implementada, embora exista um método correspondente no serviço de autenticação. Os preços apresentados na página institucional são ilustrativos. Há recursos de acessibilidade, mas não há uma auditoria completa que comprove conformidade com uma norma específica.

## Tecnologias

- React 19, TypeScript, Vite e React Router.
- Axios para comunicação HTTP.
- Tailwind CSS integrado ao Vite, combinado com CSS global e estilos de componentes. A migração para Tailwind é parcial.
- ESLint, Vitest, React Testing Library e jsdom.

## Executar localmente

Use Node.js 22.12 ou superior em uma versão compatível com as dependências e npm. Instale os pacotes na raiz do projeto:

```sh
npm install
```

Configure o endereço da API para o ambiente de desenvolvimento usando o arquivo de exemplo de configuração fornecido no projeto. A API precisa estar acessível e aceitar requisições da origem do frontend. Não inclua credenciais ou valores privados em arquivos publicados.

```sh
npm run dev
```

O Vite exibirá o endereço local disponível no terminal.

## Comandos

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento. |
| `npm run build` | Verifica o TypeScript e gera o build em `dist/`. |
| `npm run preview` | Visualiza localmente o build gerado. |
| `npm run lint` | Executa o ESLint. |
| `npm test` | Executa os testes uma vez. |
| `npm run test:watch` | Executa os testes em modo contínuo. |
| `npm run test:coverage` | Gera relatório de cobertura em `coverage/`. |

## Rotas

| Rota | Página |
| --- | --- |
| `/` | Página institucional. |
| `/login` e `/signup` | Login e cadastro. |
| `/confirmar` | Confirmação de e-mail por token. |
| `/forgot-password` | Solicitação de recuperação de senha. |
| `/reset-password` | Definição de nova senha a partir do link recebido. |
| `/status` | Página genérica de status. |
| `/termos` e `/privacidade` | Documentos legais. |
| `/dashboard` | Painel protegido por autenticação. |

Páginas públicas de login e cadastro redirecionam usuários autenticados ao painel. Na inicialização, a aplicação valida a sessão existente; visitantes são direcionados ao login ao tentar acessar a rota protegida.

## Organização do projeto

```text
public/                     Logo e imagens públicas
src/
  components/               Componentes compartilhados
    auth/                   Ícone de senha, saída e proteção de rotas
  contexts/                 Estado de autenticação, insumos, notificações e tarefas
  mappers/                  Conversão e validação de dados de tarefas
  pages/
    auth/                   Login, cadastro, confirmação e recuperação de senha
    Dashboard/              Painel, navegação, abas, formulários e estilos
    legal/                  Termos e política de privacidade
    Landing.tsx             Página institucional
    Status.tsx              Tela genérica de status
  services/
    estoque/                Serviços de insumos, fornecedores e movimentações
    produtividade/          Serviços de tarefas e Pomodoro
    auth.service.ts         Operações de autenticação
    http.ts                 Cliente HTTP e tratamento de erros
  types/                    Tipos do domínio e contratos da API
  App.tsx                   Rotas, provedores e carregamento das páginas
  index.css                 Estilos globais e estilos compartilhados
  main.tsx                  Inicialização da aplicação
tests/
  autenticacao/             Sessão, rotas e recuperação de senha
  paginas/                  Páginas públicas e metadados
  painel/                   Navegação e formulários do Dashboard
  unidade/                  Testes de regras isoladas
  setup.ts                  Configuração compartilhada dos testes
```

O repositório também contém componentes, serviços e tipos de tarefas e Pomodoro. Nesta estrutura, eles não estão conectados às rotas ou às abas do painel de insumos.

## Integração com a API

O cliente HTTP centraliza as requisições e o tratamento de erros. O token da sessão é mantido no navegador e enviado às requisições autenticadas. As operações do painel dependem dos serviços de insumos, fornecedores e movimentações; a autenticação também utiliza os serviços de usuários e recuperação de senha da API configurada.

## Testes e publicação

A suíte cobre fluxos selecionados de autenticação, páginas públicas, recuperação de senha, navegação e formulários do painel, além de conversão de dados. Ela usa respostas simuladas e não substitui testes em navegador real ou testes integrados com uma API de teste. Consulte [TESTES.md](./TESTES.md) para detalhes.

O arquivo `vercel.json` configura o encaminhamento de rotas para a aplicação. Em outras hospedagens, configure o servidor para servir `index.html` nas rotas do React Router e forneça a configuração pública necessária ao build.
