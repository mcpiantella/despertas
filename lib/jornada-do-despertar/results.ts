import type { JourneyArea } from "./quiz-data";

export type JourneyResultContent = {
  title: string;
  paragraphs: string[];
  observations: string[];
};

export const JOURNEY_RESULTS: Record<JourneyArea, JourneyResultContent> = {
  CD: {
    title: "Clareza e Direção",
    paragraphs: [
      "Suas respostas sugerem que talvez exista uma busca importante por direção neste momento.",
      "É possível que você esteja fazendo muitas coisas, mas ainda sentindo falta de um eixo mais claro para decidir e continuar."
    ],
    observations: [
      "Vale observar onde você tem gastado energia sem perceber avanço real.",
      "Talvez algumas decisões estejam esperando uma clareza que nasce no caminho.",
      "Seu próximo passo pode ser enxergar quais padrões confundem sua direção."
    ]
  },
  VP: {
    title: "Voz e Posicionamento",
    paragraphs: [
      "Suas respostas sugerem que talvez sua voz esteja pedindo mais espaço.",
      "É possível que agradar, evitar conflito ou medir demais a reação das pessoas esteja pesando nas suas escolhas."
    ],
    observations: [
      "Vale observar onde o silêncio tem custado caro.",
      "Talvez exista culpa associada a se posicionar com verdade.",
      "Seu próximo passo pode ser reconhecer padrões que diminuem sua expressão."
    ]
  },
  FL: {
    title: "Fardos e Limites",
    paragraphs: [
      "Suas respostas sugerem que talvez você esteja carregando mais do que deveria.",
      "É possível que responsabilidade, cuidado e amor tenham se misturado com pesos que já não cabem na sua jornada."
    ],
    observations: [
      "Vale observar onde você diz sim quando o corpo e a alma já disseram não.",
      "Talvez alguns limites precisem ser reconstruídos com maturidade.",
      "Seu próximo passo pode ser discernir o que é seu e o que não é."
    ]
  },
  SR: {
    title: "Segurança e Recomeços",
    paragraphs: [
      "Suas respostas sugerem que talvez exista uma tensão entre desejo de avançar e necessidade de se sentir segura.",
      "É possível que alguns recomeços estejam sendo adiados por medo de errar, perder ou não dar conta."
    ],
    observations: [
      "Vale observar onde a prudência termina e o medo começa.",
      "Talvez você esteja esperando uma segurança que só aparece depois do primeiro passo.",
      "Seu próximo passo pode ser entender quais padrões tornam o avanço mais pesado."
    ]
  },
  IP: {
    title: "Identidade e Propósito",
    paragraphs: [
      "Suas respostas sugerem que talvez exista uma pergunta mais profunda sobre identidade, direção e propósito.",
      "É possível que você perceba sinais de algo travando sua caminhada, mas ainda não consiga nomear com clareza."
    ],
    observations: [
      "Vale observar onde você tem vivido no automático.",
      "Talvez sua imagem sobre si mesma esteja influenciando seus passos.",
      "Seu próximo passo pode ser enxergar quais padrões estão competindo com a mulher que você acredita ter sido criada para ser."
    ]
  }
};
