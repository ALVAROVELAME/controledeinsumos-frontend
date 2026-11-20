# Controle de Insumos — Frontend

Aplicação web para acompanhar insumos, fornecedores, compras, vendas e estoque. O projeto inclui uma página institucional, autenticação e um painel protegido que consome uma API separada.

## Funcionalidades

- Cadastro e login, confirmação de e-mail e exclusão de conta.
- Painel com visão geral, indicadores e gráficos de compras, vendas e lucro.
- Cadastro, edição, consulta e exclusão de insumos e fornecedores.
- Registro e consulta de movimentações, com filtros e exportação CSV.
- Alertas de estoque, preferências de tema e páginas de termos e privacidade.
- Navegação por teclado, indicadores de foco e suporte a movimento reduzido em partes da interface.

A recuperação de senha ainda **não está implementada**: o link de login abre uma página informativa. Os textos de preços na página institucional são ilustrativos. A interface inclui recursos de acessibilidade, mas o projeto ainda não possui uma auditoria completa que comprove conformidade com uma norma específica.

## Tecnologias

- React 19, TypeScript, Vite e React Router.
- Axios para comunicação HTTP.
- Tailwind CSS integrado ao Vite, em conjunto com CSS global e estilos existentes nos componentes. A migração para Tailwind ainda não está concluída.
- ESLint, Vitest, React Testing Library e jsdom para qualidade e testes.

## Executar localmente

Use Node.js 22.12 ou superior em uma versão suportada pelo Vitest (22, 24 ou 26+) e npm. Na raiz do projeto:

```sh
npm install
```

Crie um arquivo `.env` a partir de `.env.example` e configure `VITE_API_URL` com o endereço da sua API. O valor é obrigatório. Variáveis `VITE_` são incorporadas ao frontend e ficam visíveis no navegador: não coloque senhas, tokens ou outras credenciais nelas. Não publique o arquivo `.env`.

```sh
npm run dev
```

O Vite exibirá no terminal o endereço local disponível. A API precisa estar acessível e configurada para aceitar requisições da origem do frontend.

## Comandos

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento. |
| `npm run build` | Verifica TypeScript e gera o build em `dist/`. |
| `npm run preview` | Visualiza localmente o build gerado. |
| `npm run lint` | Executa o ESLint. |
| `npm test` | Executa os testes uma vez. |
| `npm run test:watch` | Executa os testes em modo contínuo. |
| `npm run test:coverage` | Gera o relatório de cobertura em `coverage/`. |

O ESLint apresenta avisos de Fast Refresh em módulos que exportam componentes junto com hooks ou utilitários. Esses avisos apontam possíveis limitações na atualização de módulos durante o desenvolvimento.

## Rotas

| Rota | Página |
| --- | --- |
| `/` | Página institucional. |
| `/login` e `/signup` | Login e cadastro; redirecionam usuários autenticados ao painel. |
| `/confirmar` | Confirmação de e-mail por token. |
| `/forgot-password` | Aviso de recuperação de senha indisponível. |
| `/status` | Página genérica de status. |
| `/termos` e `/privacidade` | Documentos legais. |
| `/dashboard` | Painel protegido por autenticação. |

## Organização

```text
public/                 Logo e arquivos públicos
src/components/         Componentes compartilhados e proteção de rotas
src/contexts/           Autenticação, insumos e notificações
src/pages/              Páginas públicas e painel
src/pages/Dashboard/    Componentes, estilos e funções do painel
src/services/           Cliente HTTP e serviços de API
src/types/              Tipos da API e do domínio
src/mappers/            Conversão de dados de tarefas legadas
tests/                  Testes automatizados
```

Há arquivos de tarefas e Pomodoro no repositório que pertencem a funcionalidades anteriores; eles não são as abas do painel atual.

## Autenticação e API

O cliente HTTP usa `VITE_API_URL` como endereço base e acrescenta o token armazenado no navegador às requisições. A sessão é validada ao iniciar; rotas protegidas redirecionam visitantes para o login. Os serviços ativos usam endpoints de autenticação, usuários, insumos, fornecedores e movimentações. A disponibilidade das operações depende da API configurada.

## Testes e publicação

A suíte usa respostas simuladas e não testa a API de produção. Ela cobre fluxos selecionados de autenticação, páginas públicas e navegação do painel, mas não substitui testes completos em navegador real ou de integração com uma API de teste. Veja [TESTES.md](./TESTES.md) para os cenários cobertos e pendentes.

O `vercel.json` fornece o fallback para rotas da aplicação. Em outras hospedagens, configure o servidor para encaminhar rotas do React Router ao `index.html` e informe a variável de ambiente de build.
