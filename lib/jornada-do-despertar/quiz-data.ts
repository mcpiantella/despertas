export type JourneyArea = "CD" | "VP" | "FL" | "SR" | "IP";

export type ScoreMap = Record<JourneyArea, number>;

export type QuizOption = {
  id: string;
  label: string;
  scores: Partial<ScoreMap>;
};

export type QuizQuestion = {
  id: string;
  number: number;
  prompt: string;
  options: QuizOption[];
};

export type StepImage = {
  src: string;
  alt: string;
};

export type IntroStep = {
  id: string;
  title: string;
  body: string[];
  buttonLabel: string;
  image?: StepImage;
};

export const JOURNEY_RESULT_LABELS: Record<JourneyArea, string> = {
  CD: "Clareza e Direcao",
  VP: "Voz e Posicionamento",
  FL: "Fardos e Limites",
  SR: "Seguranca e Recomecos",
  IP: "Identidade e Proposito"
};

// Labels persisted in the database stay in ASCII (JOURNEY_RESULT_LABELS);
// anything shown to the user must use the accented display labels below.
export const JOURNEY_RESULT_DISPLAY_LABELS: Record<JourneyArea, string> = {
  CD: "Clareza e Direção",
  VP: "Voz e Posicionamento",
  FL: "Fardos e Limites",
  SR: "Segurança e Recomeços",
  IP: "Identidade e Propósito"
};

export const JOURNEY_AREAS: JourneyArea[] = ["CD", "VP", "FL", "SR", "IP"];

export const EMPTY_SCORES: ScoreMap = {
  CD: 0,
  VP: 0,
  FL: 0,
  SR: 0,
  IP: 0
};

export const INTRO_STEPS: IntroStep[] = [
  {
    id: "abertura",
    title: "Jornada do Despertar",
    body: [
      "Talvez você não esteja parada por falta de força.",
      "Talvez existam padrões funcionando no automático, influenciando suas decisões, sua constância e a forma como você se posiciona.",
      "Esta jornada foi criada para te ajudar a perceber esses sinais com mais clareza."
    ],
    buttonLabel: "Começar minha Jornada"
  },
  {
    id: "acolhimento",
    title: "Antes de começarmos...",
    body: [
      "Quero que saiba de uma coisa.",
      "Nada do que você responder aqui será julgado.",
      "Este é um espaço seguro.",
      "As perguntas existem apenas para ajudar você a enxergar padrões que talvez ainda não tenha percebido.",
      "Respire.",
      "Leve apenas alguns minutos."
    ],
    buttonLabel: "Estou pronta para começar"
  },
  {
    id: "apresentacao",
    title: "Primeiro, deixa eu me apresentar.",
    image: {
      src: "/juliana-apresentacao.jpg",
      alt: "Juliana Piantella"
    },
    body: [
      "Eu sou Juliana Piantella, Psicanalista Cristã, Terapeuta de Alta Performance e criadora do Método Despertar.",
      "Uno princípios bíblicos e ferramentas de autoconhecimento para ajudar mulheres a identificarem travas mentais, renovarem a mente e caminharem com mais clareza, constância e propósito.",
      "Aqui não existe peso religioso, cobrança ou julgamento.",
      "Existe verdade, discernimento e direção."
    ],
    buttonLabel: "Continuar"
  },
  {
    id: "como-responder",
    title: "Responda pensando na sua vida hoje.",
    body: [
      "Não procure a resposta mais bonita.",
      "Procure a resposta mais honesta.",
      "Às vezes, um padrão pequeno repetido por anos revela mais do que uma grande crise."
    ],
    buttonLabel: "Responder com sinceridade"
  }
];

export const TRANSITION_STEPS = {
  family: {
    id: "familia",
    afterQuestion: "q5",
    title: "Agora vamos olhar com maturidade para os modelos aprendidos.",
    body: [
      "Isso não é sobre culpar pai, mãe ou família.",
      "É sobre perceber que muitas formas de pensar, reagir, carregar peso, se calar ou se proteger podem ter sido aprendidas ao longo da vida.",
      "Consciência não é acusação.",
      "É responsabilidade com a própria jornada."
    ],
    buttonLabel: "Continuar com maturidade"
  },
  identity: {
    id: "identidade",
    afterQuestion: "q7",
    title: "Agora, uma pergunta sobre direção.",
    body: [
      "Não sobre religião.",
      "Não sobre cobrança.",
      "Sobre a mulher que você acredita que foi criada para ser."
    ],
    buttonLabel: "Quero refletir sobre isso"
  }
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    number: 1,
    prompt:
      "Quando você olha para os últimos meses da sua vida, qual frase parece mais próxima da sua realidade?",
    options: [
      { id: "a", label: "Tenho feito muitas coisas, mas nem sempre sinto direção.", scores: { CD: 2, IP: 1 } },
      { id: "b", label: "Sei o que preciso fazer, mas tenho dificuldade de sustentar constância.", scores: { CD: 2, SR: 1 } },
      { id: "c", label: "Tenho vivido mais para responder demandas do que para caminhar com propósito.", scores: { FL: 2, IP: 1 } },
      { id: "d", label: "Tenho evitado decisões importantes porque não quero errar.", scores: { SR: 2, CD: 1 } },
      { id: "e", label: "Tenho sentido que existe algo me travando, mas ainda não sei nomear.", scores: { IP: 2, CD: 1 } }
    ]
  },
  {
    id: "q2",
    number: 2,
    prompt: "Quando surge uma oportunidade importante, qual costuma ser sua primeira reação interna?",
    options: [
      { id: "a", label: "Fico animada, mas logo começo a pensar se vou dar conta.", scores: { SR: 2, CD: 1 } },
      { id: "b", label: "Penso em tudo que pode dar errado antes mesmo de começar.", scores: { SR: 2, VP: 1 } },
      { id: "c", label: "Quero fazer, mas acabo adiando até “estar mais preparada”.", scores: { CD: 2, SR: 1 } },
      { id: "d", label: "Procuro imaginar o que as pessoas vão pensar antes de decidir.", scores: { VP: 2, SR: 1 } },
      { id: "e", label: "Sinto que talvez aquilo seja para outras pessoas, não para mim.", scores: { IP: 2, SR: 1 } }
    ]
  },
  {
    id: "q3",
    number: 3,
    prompt: "Quando você precisa tomar uma decisão importante, o que mais costuma acontecer?",
    options: [
      { id: "a", label: "Penso demais e acabo travando.", scores: { CD: 2, SR: 1 } },
      { id: "b", label: "Peço muitas opiniões e fico ainda mais confusa.", scores: { VP: 2, CD: 1 } },
      { id: "c", label: "Escolho o caminho que desagrada menos as pessoas.", scores: { VP: 2, FL: 1 } },
      { id: "d", label: "Adio até a situação me obrigar a decidir.", scores: { CD: 2, SR: 1 } },
      { id: "e", label: "Decido, mas depois fico questionando se fiz certo.", scores: { SR: 2, VP: 1 } }
    ]
  },
  {
    id: "q4",
    number: 4,
    prompt:
      "Quando alguém precisa de você, mesmo que você esteja no limite, qual resposta mais combina com você?",
    options: [
      { id: "a", label: "Eu ajudo, mesmo sabendo que vou me sobrecarregar.", scores: { FL: 2, VP: 1 } },
      { id: "b", label: "Eu digo sim rápido e depois me arrependo.", scores: { FL: 2, VP: 1 } },
      { id: "c", label: "Eu sinto culpa quando penso em dizer não.", scores: { VP: 2, FL: 1 } },
      { id: "d", label: "Eu tento resolver tudo porque parece que ninguém mais vai fazer.", scores: { FL: 2, IP: 1 } },
      { id: "e", label: "Eu até quero ajudar, mas estou começando a perceber que carrego coisas demais.", scores: { FL: 2, CD: 1 } }
    ]
  },
  {
    id: "q5",
    number: 5,
    prompt: "Quando algo te incomoda em uma relação, o que você costuma fazer primeiro?",
    options: [
      { id: "a", label: "Fico quieta para evitar conflito.", scores: { VP: 2, FL: 1 } },
      { id: "b", label: "Tento agir como se não tivesse me afetado.", scores: { VP: 2, SR: 1 } },
      { id: "c", label: "Espero a pessoa perceber sozinha.", scores: { VP: 2, CD: 1 } },
      { id: "d", label: "Falo, mas depois me culpo.", scores: { VP: 2, FL: 1 } },
      { id: "e", label: "Me afasto, mesmo sem explicar direito o que aconteceu.", scores: { SR: 2, VP: 1 } }
    ]
  },
  {
    id: "q6",
    number: 6,
    prompt: "Quando você olha para sua história familiar, qual dessas frases parece mais familiar?",
    options: [
      { id: "a", label: "Aprendi que precisava ser forte e não dar trabalho.", scores: { FL: 2, IP: 1 } },
      { id: "b", label: "Aprendi que era melhor ficar calada do que criar conflito.", scores: { VP: 2, FL: 1 } },
      { id: "c", label: "Aprendi que precisava agradar para manter a paz.", scores: { VP: 2, FL: 1 } },
      { id: "d", label: "Aprendi que descansar era quase o mesmo que ser irresponsável.", scores: { FL: 2, CD: 1 } },
      { id: "e", label: "Aprendi que mudar era perigoso ou difícil demais.", scores: { SR: 2, IP: 1 } },
      { id: "f", label: "Não sei dizer, mas sinto que alguns padrões podem ter vindo de lá.", scores: { IP: 2, CD: 1 } }
    ]
  },
  {
    id: "q7",
    number: 7,
    prompt:
      "Quando pensa em pai, mãe ou figuras importantes da sua criação, o que mais vale a pena observar hoje?",
    options: [
      { id: "a", label: "A forma como aprendi a lidar com autoridade.", scores: { VP: 2, IP: 1 } },
      { id: "b", label: "A forma como aprendi a receber ou demonstrar afeto.", scores: { VP: 2, FL: 1 } },
      { id: "c", label: "A forma como aprendi a me posicionar.", scores: { VP: 2, CD: 1 } },
      { id: "d", label: "A forma como aprendi a lidar com dinheiro, oportunidades ou falta.", scores: { SR: 2, IP: 1 } },
      { id: "e", label: "A forma como aprendi a carregar responsabilidades.", scores: { FL: 2, VP: 1 } },
      { id: "f", label: "Ainda não sei, mas sinto que existe algo importante nessa área.", scores: { IP: 2, CD: 1 } }
    ]
  },
  {
    id: "q8",
    number: 8,
    prompt: "Quando você pensa na mulher que acredita ter sido criada para ser, o que parece mais distante hoje?",
    options: [
      { id: "a", label: "Clareza para decidir.", scores: { CD: 2, IP: 1 } },
      { id: "b", label: "Constância para continuar.", scores: { CD: 2, SR: 1 } },
      { id: "c", label: "Coragem para me posicionar.", scores: { VP: 2, IP: 1 } },
      { id: "d", label: "Leveza para viver sem carregar tudo.", scores: { FL: 2, IP: 1 } },
      { id: "e", label: "Discernimento para escolher melhor meus caminhos.", scores: { IP: 2, CD: 1 } },
      { id: "f", label: "Confiança para ocupar meu lugar.", scores: { IP: 2, VP: 1 } }
    ]
  },
  {
    id: "q9",
    number: 9,
    prompt: "Qual frase mais confronta sua forma de viver hoje?",
    options: [
      { id: "a", label: "Tenho respondido mais às expectativas dos outros do que à minha direção.", scores: { VP: 2, IP: 1 } },
      { id: "b", label: "Tenho confundido responsabilidade com carregar tudo sozinha.", scores: { FL: 2, IP: 1 } },
      { id: "c", label: "Tenho esperado segurança para dar passos que exigem fé e decisão.", scores: { SR: 2, IP: 1 } },
      { id: "d", label: "Tenho chamado de prudência aquilo que talvez seja medo de avançar.", scores: { SR: 2, CD: 1 } },
      { id: "e", label: "Tenho vivido no automático por tempo demais.", scores: { IP: 2, CD: 1 } }
    ]
  },
  {
    id: "q10",
    number: 10,
    prompt: "Se os próximos meses fossem um novo começo, qual mudança faria mais sentido para você?",
    options: [
      { id: "a", label: "Decidir com mais clareza.", scores: { CD: 2, IP: 1 } },
      { id: "b", label: "Viver com mais constância.", scores: { CD: 2, SR: 1 } },
      { id: "c", label: "Me posicionar sem tanta culpa.", scores: { VP: 2, FL: 1 } },
      { id: "d", label: "Parar de carregar fardos que não são meus.", scores: { FL: 2, VP: 1 } },
      { id: "e", label: "Entender melhor os padrões que se repetem na minha vida.", scores: { IP: 2, CD: 1 } },
      { id: "f", label: "Caminhar com mais alinhamento entre fé, mente e propósito.", scores: { IP: 2, CD: 1 } }
    ]
  }
];
