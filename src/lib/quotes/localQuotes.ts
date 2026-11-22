import type { Lang } from "./types";

export interface LocalQuote {
  author: string;
  text: Record<Lang, string>;
}

/**
 * Curated, pre-translated quotes. Used when the upstream API is down or returns
 * something invalid, so the page always has content and makes no translation calls.
 */
export const LOCAL_QUOTES: readonly LocalQuote[] = [
  {
    author: "Diogenes of Sinope",
    text: {
      en: "We sell things of great value for things of very little, and vice versa.",
      es: "Vendemos cosas de gran valor por cosas de muy poco, y viceversa.",
      it: "Vendiamo cose di grande valore in cambio di cose che valgono pochissimo, e viceversa.",
    },
  },
  {
    author: "Marcus Aurelius",
    text: {
      en: "How does your ruling reason manage itself? For in that is the key to everything. Whatever else remains, be it in the power of your choice or not, is but a corpse and smoke.",
      es: "¿Cómo se gobierna tu razón rectora? Porque en eso está la clave de todo. Todo lo demás, dependa o no de tu elección, no es más que cadáver y humo.",
      it: "Come si governa la tua ragione dominante? Perché lì sta la chiave di tutto. Tutto il resto, che dipenda o no dalla tua scelta, non è che cadavere e fumo.",
    },
  },
  {
    author: "Epictetus",
    text: {
      en: "Freedom isn't secured by filling up your heart's desire, but by removing your desires.",
      es: "La libertad no se consigue satisfaciendo los deseos de tu corazón, sino eliminando tus deseos.",
      it: "La libertà non si ottiene soddisfacendo i desideri del cuore, ma eliminando i propri desideri.",
    },
  },
  {
    author: "Seneca",
    text: {
      en: "Life without a design is erratic. As soon as one is in place, principles become necessary. I think you'll concede that nothing is more shameful than uncertain and wavering conduct, and beating a cowardly retreat. This will happen in all our affairs unless we remove the faults that seize and detain our spirits, preventing them from pushing forward and making an all-out effort.",
      es: "La vida sin un propósito es errática. En cuanto se establece uno, los principios se vuelven necesarios. Creo que admitirás que no hay nada más vergonzoso que una conducta incierta y vacilante, y una retirada cobarde. Esto sucederá en todos nuestros asuntos a menos que eliminemos los defectos que se apoderan de nuestro espíritu y lo detienen, impidiéndole seguir adelante y dar lo mejor de sí.",
      it: "La vita senza un progetto è erratica. Non appena se ne stabilisce uno, i principi diventano necessari. Credo che converrai che nulla è più vergognoso di una condotta incerta e vacillante, e di una ritirata codarda. Questo accadrà in tutte le nostre faccende, a meno che non eliminiamo i difetti che afferrano e trattengono il nostro spirito, impedendogli di andare avanti e di dare il massimo.",
    },
  },
  {
    author: "Epictetus",
    text: {
      en: "If you should ever turn your will to things outside your control in order to impress someone, be sure that you have wrecked your whole purpose in life. Be content, then, to be a philosopher in all that you do, and if you wish also to be seen as one, show yourself first that you are and you will succeed.",
      es: "Si alguna vez diriges tu voluntad hacia cosas fuera de tu control para impresionar a alguien, ten por seguro que has arruinado todo tu propósito en la vida. Conténtate, pues, con ser filósofo en todo lo que hagas, y si además quieres que te vean como tal, demuéstratelo primero a ti mismo y lo conseguirás.",
      it: "Se mai rivolgessi la tua volontà a cose fuori dal tuo controllo per impressionare qualcuno, sappi che hai rovinato l'intero scopo della tua vita. Accontentati, dunque, di essere filosofo in tutto ciò che fai, e se vuoi anche essere visto come tale, dimostralo prima a te stesso e ci riuscirai.",
    },
  },
];

/** Same date → same quote, on every server instance, without shared state. */
export function pickLocalQuote(date: string, quotes: readonly LocalQuote[] = LOCAL_QUOTES): LocalQuote {
  let hash = 0;
  for (const char of date) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return quotes[hash % quotes.length];
}
