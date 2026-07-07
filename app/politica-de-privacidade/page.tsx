import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | Juliana Piantella",
  description:
    "Como a Juliana Piantella coleta, usa e protege os dados enviados na Jornada do Despertar.",
  robots: { index: true, follow: true }
};

const LAST_UPDATE = "2 de julho de 2026";
const CONTACT_WHATSAPP = "(16) 99205-2252";

export default function PoliticaDePrivacidadePage() {
  return (
    <main className="jd-page">
      <article className="jd-shell jd-policy">
        <section className="jd-card">
          <p className="jd-eyebrow">Última atualização: {LAST_UPDATE}</p>
          <h1>Política de Privacidade</h1>

          <p>
            Esta política explica como <strong>Juliana Piantella</strong> (&quot;nós&quot;),
            responsável pela Jornada do Despertar e pelo Método Despertas, coleta, usa e
            protege as informações pessoais enviadas por você neste site, em conformidade
            com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).
          </p>

          <h2>Quais dados coletamos</h2>
          <p>Ao concluir a Jornada do Despertar, coletamos:</p>
          <ul>
            <li>Nome, número de WhatsApp e e-mail informados por você;</li>
            <li>Suas respostas às perguntas do quiz e a leitura inicial gerada;</li>
            <li>
              Informações de origem do acesso, como a página de chegada, o site de
              referência e parâmetros de campanha (UTMs);
            </li>
            <li>Registro do seu consentimento (data, hora e versão do texto aceito).</li>
          </ul>

          <h2>Para que usamos os seus dados</h2>
          <ul>
            <li>
              Entrar em contato com você, pelo WhatsApp ou e-mail, sobre a Jornada do
              Despertar e a Sessão de Identificação de Travas Mentais;
            </li>
            <li>Gerar e apresentar a sua leitura inicial;</li>
            <li>Entender quais campanhas e conteúdos trazem as visitantes do site.</li>
          </ul>
          <p>
            A base legal do tratamento é o seu <strong>consentimento</strong>, dado de
            forma expressa na caixa de seleção antes do envio do formulário.
          </p>

          <h2>Com quem compartilhamos</h2>
          <p>
            Seus dados não são vendidos nem compartilhados com terceiros para fins de
            marketing. Eles ficam armazenados em provedores de infraestrutura contratados
            por nós (banco de dados e ferramenta interna de gestão de contatos), usados
            exclusivamente para as finalidades descritas acima.
          </p>

          <h2>Por quanto tempo guardamos</h2>
          <p>
            Mantemos os seus dados enquanto durar o relacionamento com você ou até que
            você peça a exclusão, o que acontecer primeiro.
          </p>

          <h2>Seus direitos</h2>
          <p>
            Nos termos da LGPD, você pode a qualquer momento solicitar acesso, correção,
            exclusão dos seus dados ou a revogação do consentimento. Para isso, fale com a
            Juliana pelo WhatsApp {CONTACT_WHATSAPP}.
          </p>

          <h2>Sobre a Jornada do Despertar</h2>
          <p>
            A Jornada do Despertar é uma experiência de autoconhecimento. Ela não é
            avaliação psicológica, diagnóstico ou tratamento, e as suas respostas são
            usadas apenas para gerar a leitura inicial e para o contato descrito nesta
            política.
          </p>
        </section>
      </article>
    </main>
  );
}
