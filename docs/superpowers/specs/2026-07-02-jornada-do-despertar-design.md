# Jornada do Despertar - Design Spec

## Contexto

O quiz Jornada do Despertar sera a porta de entrada do Metodo Despertar, da Juliana Piantella. Ele deve acolher, gerar identificacao e despertar consciencia sem funcionar como teste clinico, diagnostico ou entrega oficial de travas mentais.

Diretriz central:

> O Quiz acende a luz. A Sessao de Identificacao mostra o mapa.

O workspace atual nao contem um app web existente nem repositorio Git inicial. A primeira versao sera criada como um app Next.js novo dentro desta pasta, pronto para publicacao posterior em uma plataforma como Vercel.

## Objetivo

Criar uma experiencia online mobile-first, com uma pergunta por tela, que pareca uma conversa guiada. Ao final, a usuaria deve receber uma leitura inicial do padrao mais saliente nas respostas e ser conduzida para o WhatsApp da Juliana para saber mais sobre a Sessao de Identificacao de Travas Mentais.

## Escopo Do MVP

Inclui:

- Rota publica `/jornada-do-despertar`.
- Telas iniciais de acolhimento, apresentacao e instrucao.
- 10 perguntas com pontuacao nas 5 areas.
- Telas de transicao sobre familia e identidade.
- Captura de nome, WhatsApp e e-mail.
- Tela de carregamento de 3 a 5 segundos.
- Resultado personalizado com CTA para WhatsApp.
- Persistencia do lead no Supabase por API server-side.
- Consentimento explicito antes da captura do lead.
- Idempotencia de envio por `submission_id`.
- Protecao basica contra spam.
- Captura de origem, campanha e parametros UTM.
- Captura de URL de origem e referrer.
- Eventos de tracking preparados para GTM, GA4 e Meta Pixel.
- Testes automatizados para pontuacao, desempate, payload de lead e mensagens de WhatsApp.
- Validacao manual mobile e desktop.

Fora do MVP:

- Area administrativa.
- Edicao de perguntas via CMS.
- Dashboard de resultados.
- Automacoes de follow-up dentro do app.
- Diagnostico ou entrega completa das travas mentais.

## Arquitetura

Usar Next.js com App Router e TypeScript.

Fluxo principal:

1. Usuaria acessa `/jornada-do-despertar`.
2. O frontend conduz as etapas do quiz e guarda respostas em estado local.
3. Ao final das perguntas, o frontend calcula a leitura inicial para exibicao e monta o payload completo.
4. O formulario de lead so envia se o consentimento LGPD estiver aceito.
5. O formulario envia `POST /api/quiz-jornada/leads` com `submission_id`, respostas, dados do lead, UTMs, URL de origem e referrer.
6. A API valida os campos, aplica protecao basica contra spam, recalcula/valida pontuacao no servidor e grava no Supabase.
7. Se `CRM_WEBHOOK_URL` estiver configurada, a API notifica o CRM depois do insert bem-sucedido.
8. A tela de carregamento aparece por 3 a 5 segundos.
9. A tela de resultado e o CTA aparecem somente depois do lead salvo com sucesso.

O Supabase sera tratado como fonte confiavel dos leads. O CRM pode consumir a tabela ou receber webhook, mas a perda temporaria do webhook nao deve impedir o lead de ser salvo.

Se o Supabase falhar, a usuaria deve ver uma mensagem simples e poder tentar enviar novamente. O resultado nao deve aparecer antes do salvamento.

## Rotas E Arquivos

Estrutura proposta:

```txt
app/
  jornada-do-despertar/
    page.tsx
  api/
    quiz-jornada/
      leads/
        route.ts
components/
  jornada-do-despertar/
    quiz-shell.tsx
    quiz-step.tsx
    lead-form.tsx
    result-view.tsx
    progress-bar.tsx
lib/
  jornada-do-despertar/
    quiz-data.ts
    scoring.ts
    results.ts
    tracking.ts
    whatsapp.ts
    validation.ts
    lead-payload.ts
  supabase/
    server.ts
supabase/
  migrations/
    <timestamp>_create_quiz_jornada_leads.sql
```

Responsabilidades:

- `quiz-data.ts`: copy das telas, perguntas, alternativas e matriz de pontuacao.
- `scoring.ts`: soma, desempate e resultado final.
- `results.ts`: textos dos 5 resultados.
- `tracking.ts`: camada unica para `dataLayer`, `gtag` e `fbq`.
- `whatsapp.ts`: montagem de URLs de WhatsApp.
- `validation.ts`: validacao compartilhada de lead/payload.
- `lead-payload.ts`: montagem do payload com consentimento, origem, referrer, UTMs e `submission_id`.
- `route.ts`: validacao server-side, insert no Supabase e webhook opcional.

## Experiencia E Visual

A experiencia deve ser mobile-first e funcionar bem em telas pequenas antes de desktop.

Direcao visual:

- Fundo off-white quente.
- Texto escuro com alto contraste.
- Acentos em vinho, terracota e dourado suave.
- Tipografia elegante, com hierarquia clara.
- Cards simples, com bordas discretas e sem excesso de sombras.
- Botoes grandes, confortaveis para toque.
- Progresso discreto no topo.
- Transicoes suaves entre etapas, sem animacoes que distraiam.
- Navegacao por teclado funcional.
- Labels corretos em campos de formulario.
- Estados de erro visiveis.
- Preservacao basica do progresso em `sessionStorage`.

Tom de marca:

- Conversa sincera entre amigas.
- Fe madura como lente, nao como peso.
- Clareza, acolhimento e direcao.
- Sem jargao clinico.
- Sem posicionar a usuaria como vitima.

## Linguagem

Evitar:

- cura;
- diagnostico;
- tratamento;
- transtorno;
- paciente;
- doenca;
- avaliacao psicologica;
- psicoterapia;
- promessas diretas sobre ansiedade/depressao.

Priorizar:

- travas mentais;
- padroes;
- clareza;
- direcao;
- constancia;
- renovacao da mente;
- discernimento;
- identidade;
- proposito;
- fardos;
- limites;
- posicionamento;
- jornada;
- leitura inicial;
- primeiro espelho.

Os resultados nunca devem dizer "voce e", "voce tem" ou "sua trava e". Usar formulacoes como:

- "suas respostas sugerem";
- "talvez";
- "vale observar";
- "e possivel que".

## Conteudo Das Etapas

Usar a copy do pedido anexado para:

- Abertura.
- Acolhimento.
- Apresentacao da Juliana.
- Como responder.
- Perguntas 1 a 10.
- Transicao sobre familia.
- Transicao sobre identidade.
- Captura de lead.
- Carregamento.
- CTA final.

Cada pergunta ocupa uma tela propria. Alternativas devem ser botoes grandes, com texto legivel e estado selecionado claro.

O botao voltar deve permitir revisar etapas anteriores sem corromper respostas nem duplicar pontuacao. O progresso deve ser preservado no `sessionStorage` para reduzir perda acidental em recarregamento simples.

## Motor De Pontuacao

Areas:

```txt
CD = Clareza e Direcao
VP = Voz e Posicionamento
FL = Fardos e Limites
SR = Seguranca e Recomecos
IP = Identidade e Proposito
```

Cada alternativa soma pontos conforme o pedido original. O frontend pode calcular para feedback imediato, mas o servidor deve recalcular ou validar a pontuacao antes de salvar.

Regra de resultado:

1. Somar as 5 areas.
2. Identificar areas empatadas na maior pontuacao.
3. Antes da prioridade geral, aplicar perguntas-chave:
   - Se `IP` empatou e a pessoa pontuou `IP` nas perguntas 8, 9 ou 10, priorizar `IP`.
   - Se `FL` empatou e a pessoa pontuou `FL` nas perguntas 4, 6 ou 9, priorizar `FL`.
   - Se `VP` empatou e a pessoa pontuou `VP` nas perguntas 3, 5, 6 ou 7, priorizar `VP`.
   - Se `SR` empatou e a pessoa pontuou `SR` nas perguntas 2, 3, 6 ou 9, priorizar `SR`.
4. Se continuar empatado, usar prioridade:
   1. `IP`
   2. `FL`
   3. `VP`
   4. `SR`
   5. `CD`

## Resultados

Criar 5 resultados:

- Clareza e Direcao.
- Voz e Posicionamento.
- Fardos e Limites.
- Seguranca e Recomecos.
- Identidade e Proposito.

Cada resultado deve conter:

- Titulo da leitura inicial.
- Paragrafo acolhedor com linguagem sugestiva.
- 2 ou 3 sinais/padroes para observar.
- Ponte para aprofundamento na Sessao de Identificacao.
- CTA principal e secundario para WhatsApp.

Texto comum de CTA:

> Quer olhar para isso com mais profundidade?
>
> Perceber um padrao e importante.
>
> Mas identificar quais travas mentais podem estar por tras dele exige um processo mais completo.
>
> A Sessao de Identificacao de Travas Mentais e o proximo passo da Jornada do Despertar.
>
> Nessa sessao, Juliana conduz o processo completo de identificacao e te ajuda a enxergar com mais clareza quais padroes podem estar influenciando sua vida hoje.
>
> O Quiz acendeu a luz.
> A Sessao de Identificacao mostra o mapa.

## WhatsApp

Usar numero configuravel por ambiente:

```txt
NEXT_PUBLIC_JULIANA_WHATSAPP_NUMBER
```

Botao principal:

```txt
Oi, Juliana! Fiz a Jornada do Despertar e meu resultado foi "[RESULTADO]". Quero saber mais sobre a Sessao de Identificacao de Travas Mentais.
```

Botao secundario:

```txt
Oi, Juliana! Fiz a Jornada do Despertar e fiquei com uma duvida antes de agendar a Sessao de Identificacao.
```

As URLs devem ser geradas com `encodeURIComponent`.

## Consentimento E LGPD

Antes de salvar o lead, exibir consentimento simples junto ao formulario:

> Ao continuar, voce autoriza o envio das suas informacoes para que a Juliana Piantella possa retornar sobre a Jornada do Despertar e a Sessao de Identificacao de Travas Mentais.

Regras:

- O consentimento deve ser uma caixa de selecao obrigatoria.
- O botao "Ver minha leitura inicial" so envia se o consentimento estiver aceito.
- Registrar `consent_accepted = true`, `consent_accepted_at`, `consent_version` e `privacy_policy_url`.
- `consent_version` inicial: `jornada-do-despertar-v1`.
- `privacy_policy_url` deve vir de variavel de ambiente ou configuracao do app. Se a URL ainda nao existir no dia da implementacao, salvar string vazia e manter a arquitetura pronta para preencher.

## Supabase

Tabela proposta: `quiz_jornada_leads`.

Campos:

```sql
create extension if not exists pgcrypto;

id uuid primary key default gen_random_uuid(),
created_at timestamptz not null default now(),
submission_id uuid not null unique,
name text not null,
whatsapp_raw text not null,
whatsapp_normalized text not null,
email text not null,
result_key text not null,
result_label text not null,
score_cd integer not null,
score_vp integer not null,
score_fl integer not null,
score_sr integer not null,
score_ip integer not null,
answers jsonb not null,
consent_accepted boolean not null default false,
consent_accepted_at timestamptz,
consent_version text,
privacy_policy_url text,
utm_source text,
utm_medium text,
utm_campaign text,
utm_term text,
utm_content text,
landing_url text,
referrer text,
origin text,
campaign text,
status text not null default 'Novo lead',
crm_webhook_status text,
crm_webhook_error text
```

Constraints:

```sql
check (result_key in ('CD', 'VP', 'FL', 'SR', 'IP')),
check (score_cd >= 0),
check (score_vp >= 0),
check (score_fl >= 0),
check (score_sr >= 0),
check (score_ip >= 0),
check (status in (
  'Novo lead',
  'Chamou no WhatsApp',
  'Explicacao enviada',
  'Interessada',
  'Aguardando pagamento',
  'Sessao agendada',
  'Nao respondeu',
  'Perdida',
  'Virou acompanhamento'
)),
check (consent_accepted = true)
```

Observacao: os valores do banco ficam em ASCII para consistencia tecnica. A interface pode exibir acentos normalmente.

RLS:

- Ativar RLS na tabela.
- Nao criar policy de leitura publica.
- O insert sera feito pela API server-side usando credencial segura, nunca pelo browser com chave secreta.
- A chave service role ou secret key nao deve usar prefixo `NEXT_PUBLIC_`.

Variaveis:

```txt
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
CRM_WEBHOOK_URL
NEXT_PUBLIC_JULIANA_WHATSAPP_NUMBER
NEXT_PUBLIC_PRIVACY_POLICY_URL
```

`CRM_WEBHOOK_URL` e opcional na primeira versao. Quando configurada, a API deve chamar o webhook depois de salvar o lead e registrar sucesso/falha sem apagar o lead ja salvo.

Depois do webhook, a API deve atualizar o lead salvo:

- `crm_webhook_status = 'success'` quando o webhook funcionar.
- `crm_webhook_status = 'failed'` e `crm_webhook_error` quando falhar.
- Falha do webhook nao bloqueia a exibicao do resultado quando o lead ja foi salvo.

## Idempotencia

O frontend deve gerar um `submission_id` UUID no inicio do quiz e persistir esse valor no `sessionStorage` junto ao progresso. Esse ID acompanha o payload ate a API.

Regras:

- A tabela tem `unique(submission_id)`.
- Se o mesmo `submission_id` for enviado duas vezes, a API deve responder de forma segura, retornando o lead ja salvo ou uma resposta de sucesso equivalente.
- Clique duplo no botao de envio deve desabilitar o botao enquanto a requisicao estiver em andamento.
- O resultado so aparece depois de uma resposta de sucesso da API.

## Protecao Basica Contra Spam

Implementar no MVP:

- Honeypot invisivel no formulario de lead.
- Rejeicao server-side quando o honeypot vier preenchido.
- Desabilitar reenvio enquanto a requisicao estiver pendente.

Opcional para fase seguinte:

- Rate limit por IP.
- Cloudflare Turnstile.

## Normalizacao De WhatsApp

Salvar dois campos:

- `whatsapp_raw`: valor digitado pela usuaria.
- `whatsapp_normalized`: somente numeros, com codigo do Brasil quando fizer sentido.

Regra inicial:

1. Remover tudo que nao for numero.
2. Se o numero tiver 10 ou 11 digitos, prefixar `55`.
3. Se ja comecar com `55` e tiver tamanho plausivel, manter.
4. Rejeitar numeros curtos demais ou longos demais com mensagem simples.

## Origem E Referrer

Capturar e salvar:

- `landing_url`: URL completa acessada pela usuaria, incluindo query string.
- `referrer`: `document.referrer`, quando existir.
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`.
- `origin` e `campaign`, quando informados por query string ou configuracao.

## Tracking

Eventos:

```txt
quiz_started
quiz_question_answered
quiz_completed
lead_captured
result_viewed
cta_identificacao_clicked
whatsapp_clicked
```

Implementar `trackQuizEvent(name, payload)` com:

- `window.dataLayer.push({ event: name, ...payload })` quando existir.
- `window.gtag('event', name, payload)` quando existir.
- `window.fbq('trackCustom', name, payload)` quando existir.

O tracking nao pode quebrar a experiencia se qualquer pixel/script nao estiver carregado.

## Validacao E Erros

Formulario:

- Nome obrigatorio, minimo 2 caracteres.
- WhatsApp obrigatorio, salvo como digitado e normalizado para digitos com tamanho plausivel.
- E-mail obrigatorio em formato valido.
- Respostas obrigatorias para as 10 perguntas.
- Consentimento obrigatorio.
- Honeypot deve estar vazio.

Erros:

- Se o lead falhar ao salvar, mostrar mensagem simples e permitir tentar novamente.
- Se o webhook do CRM falhar apos o insert no Supabase, a usuaria ainda deve ver o resultado.
- O frontend nao deve exibir detalhes tecnicos de erro.
- Envio duplicado com o mesmo `submission_id` deve ser tratado como sucesso seguro quando ja houver lead salvo.

## Testes

Testes automatizados:

- Soma correta por alternativa.
- Desempate por pergunta-chave para `IP`, `FL`, `VP` e `SR`.
- Desempate final por prioridade geral.
- Geracao correta das mensagens e URLs de WhatsApp.
- Normalizacao de WhatsApp.
- Validacao de payload do lead.
- Obrigatoriedade do consentimento.
- Idempotencia por `submission_id`.
- Honeypot rejeitado quando preenchido.
- API rejeita payload incompleto.
- O scaffold inicial deve permitir `npm test` antes da criacao dos testes, usando `vitest run --passWithNoTests` ou teste minimo equivalente.

Validacao manual:

- Mobile: iPhone pequeno e Android comum.
- Desktop: largura media.
- Todas as perguntas avancam e preservam escolha.
- Botao voltar nao corrompe pontuacao.
- Progresso basico e preservado em `sessionStorage`.
- Campos possuem labels corretos.
- Navegacao por teclado funciona nos campos e botoes.
- Estados de erro sao visiveis.
- Contraste e area de toque estao adequados.
- Lead e salvo no Supabase.
- UTMs sao salvas.
- `landing_url` e `referrer` sao salvos.
- WhatsApp abre com mensagem correta.
- Eventos sao disparados sem erro quando GTM/GA4/Meta nao existem.

## Metadata Da Pagina

Adicionar metadata para a rota:

- `title`: `Jornada do Despertar | Juliana Piantella`
- `description`: `Um caminho breve para perceber padroes que talvez estejam influenciando sua clareza, constancia e direcao.`
- Open Graph com titulo e descricao equivalentes.
- Imagem compartilhavel se um asset de marca existir no momento da implementacao.
- Favicon/branding basico do app.

## Criterios De Aceite

A primeira versao esta pronta quando:

- `/jornada-do-despertar` abre corretamente.
- O quiz funciona 100% no mobile.
- Ha uma pergunta por tela.
- A pontuacao final segue a regra definida.
- O resultado aparece com linguagem sugestiva e nao clinica.
- O lead e salvo no Supabase com todos os dados exigidos.
- O lead so e salvo com consentimento aceito.
- Envios duplicados com o mesmo `submission_id` nao criam duplicidade.
- Honeypot impede submissao automatizada basica.
- UTMs, origem e campanha sao capturadas.
- URL de origem e referrer sao capturados.
- O WhatsApp abre com a mensagem correta.
- Os eventos de tracking sao disparados.
- Acessibilidade basica foi validada: contraste, labels, teclado, toque e estados de erro.
- O progresso basico e preservado em `sessionStorage`.
- Metadata da pagina foi configurada.
- O visual esta alinhado ao Metodo Despertar.
- A experiencia nao parece um formulario generico.
- Os testes automatizados principais passam.

## Decisoes Registradas

- Usar Next.js + API route + Supabase como abordagem recomendada.
- Supabase sera fonte confiavel dos leads.
- Webhook do CRM sera opcional e posterior ao insert.
- O numero do WhatsApp sera configurado por variavel de ambiente.
- A implementacao deve ser test-first para a logica de pontuacao e validacao.
- Inicializar Git antes de qualquer codigo de aplicacao e versionar a spec aprovada.
- Criar branch `feature/jornada-do-despertar` para implementacao.
- Exibir resultado somente depois do lead salvo com sucesso.
- Incluir consentimento LGPD, idempotencia, honeypot, normalizacao de WhatsApp, `landing_url` e `referrer` no MVP.
