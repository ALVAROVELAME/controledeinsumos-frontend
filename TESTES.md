# Testes automatizados

Os testes usam Vitest, jsdom e React Testing Library. Chamadas de autenticação e dados do painel são simulados; a suíte não acessa a API de produção.

```sh
npm test                 # execução única
npm run test:watch       # reexecuta durante o desenvolvimento
npm run test:coverage    # gera relatório em coverage/index.html
```

## Áreas prioritárias

- Páginas públicas: navegação, FAQ, documentos legais e status.
- Autenticação: login, cadastro, confirmação de e-mail, estados de erro, sessão e acesso às rotas.
- Painel: navegação por todas as seções, formulários de insumos e fornecedores e pré-condição para movimentações.
- Conversão e validação dos dados recebidos da API.

## Cobertura ainda necessária

Os testes atuais são uma base, não uma verificação exaustiva. Devem ser ampliados para incluir criação, edição e exclusão completas de insumos, fornecedores e movimentações, filtros, relatórios, exportação, acessibilidade, responsividade e falhas da API. Testes em navegador real e integração com uma API de teste também são necessários; jsdom não comprova aparência visual nem comportamento entre navegadores.
