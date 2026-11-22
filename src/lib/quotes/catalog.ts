import type { Lang } from "./types";

/**
 * Curated catalog: one stoic quote + one dev lesson that translates it to
 * engineering life. Written and translated by hand, so there is no upstream API
 * and nothing to translate at runtime.
 *
 * Rules for new entries (enforced by tests/catalog.test.ts):
 * - the quote is attributable to a specific work (no internet misattributions);
 * - quote ≤ 170 characters and lesson ≤ 110 characters, in every language,
 *   so both always fit the share card;
 * - lessons are generic patterns of the craft, never stories from real projects.
 */

export const AUTHORS = {
  epictetus: { en: "Epictetus", es: "Epicteto", it: "Epitteto" },
  marcus: { en: "Marcus Aurelius", es: "Marco Aurelio", it: "Marco Aurelio" },
  seneca: { en: "Seneca", es: "Séneca", it: "Seneca" },
  zeno: { en: "Zeno of Citium", es: "Zenón de Citio", it: "Zenone di Cizio" },
} as const satisfies Record<string, Record<Lang, string>>;
export type AuthorKey = keyof typeof AUTHORS;

export const WORKS = {
  enchiridion: { en: "Enchiridion", es: "Enquiridión", it: "Manuale" },
  discourses: { en: "Discourses", es: "Disertaciones", it: "Diatribe" },
  fragments: { en: "Fragments", es: "Fragmentos", it: "Frammenti" },
  meditations: { en: "Meditations", es: "Meditaciones", it: "Pensieri" },
  letters: { en: "Letters to Lucilius", es: "Cartas a Lucilio", it: "Lettere a Lucilio" },
  onAnger: { en: "On Anger", es: "Sobre la ira", it: "L'ira" },
  shortnessOfLife: { en: "On the Shortness of Life", es: "Sobre la brevedad de la vida", it: "La brevità della vita" },
  lives: { en: "Diogenes Laërtius, Lives", es: "Diógenes Laercio, Vidas", it: "Diogene Laerzio, Vite" },
} as const satisfies Record<string, Record<Lang, string>>;
export type WorkKey = keyof typeof WORKS;

export interface CatalogEntry {
  id: string;
  author: AuthorKey;
  work: WorkKey;
  /** Book/chapter/letter reference, e.g. "12.17". Empty when the work has no numbering. */
  ref: string;
  quote: Record<Lang, string>;
  lesson: Record<Lang, string>;
}

export const CATALOG: readonly CatalogEntry[] = [
  {
    id: "opinions-not-things",
    author: "epictetus",
    work: "enchiridion",
    ref: "5",
    quote: {
      es: "No nos afecta lo que sucede, sino lo que pensamos sobre lo que sucede.",
      en: "It's not what happens that disturbs us, but what we think about what happens.",
      it: "Non ci turba ciò che accade, ma ciò che pensiamo di ciò che accade.",
    },
    lesson: {
      es: "El servidor se cayó a las 3 a.m. El drama es opcional; el plan de reintentos, no.",
      en: "The server went down at 3 a.m. Drama is optional; the retry plan isn't.",
      it: "Il server è caduto alle 3 di notte. Il dramma è facoltativo; il piano di retry no.",
    },
  },
  {
    id: "difficulties-show",
    author: "epictetus",
    work: "discourses",
    ref: "1.24",
    quote: {
      es: "La dificultad muestra lo que son los hombres.",
      en: "It is difficulties that show what men are.",
      it: "Sono le difficoltà a mostrare chi sono gli uomini.",
    },
    lesson: {
      es: "Cualquiera integra dos sistemas que funcionan. El oficio se ve cuando uno falla.",
      en: "Anyone can connect two working systems. The craft shows when one of them fails.",
      it: "Chiunque integra due sistemi che funzionano. Il mestiere si vede quando uno cade.",
    },
  },
  {
    id: "not-right-not-true",
    author: "marcus",
    work: "meditations",
    ref: "12.17",
    quote: {
      es: "Si no es correcto, no lo hagas; si no es verdad, no lo digas.",
      en: "If it is not right, do not do it; if it is not true, do not say it.",
      it: "Se non è giusto, non farlo; se non è vero, non dirlo.",
    },
    lesson: {
      es: "Si no puedes reintentarlo sin duplicar datos, no está listo para producción.",
      en: "If you can't retry it without duplicating data, it isn't ready for production.",
      it: "Se non puoi ritentarlo senza duplicare i dati, non è pronto per la produzione.",
    },
  },
  {
    id: "within-our-power",
    author: "epictetus",
    work: "enchiridion",
    ref: "1",
    quote: {
      es: "Algunas cosas dependen de nosotros y otras no.",
      en: "Some things are within our power, while others are not.",
      it: "Alcune cose dipendono da noi, altre no.",
    },
    lesson: {
      es: "La API del otro lado no depende de ti. El timeout, el reintento y la alerta, sí.",
      en: "The other side's API isn't up to you. The timeout, the retry and the alert are.",
      it: "L'API dall'altra parte non dipende da te. Timeout, retry e alert sì.",
    },
  },
  {
    id: "obstacle-is-the-way",
    author: "marcus",
    work: "meditations",
    ref: "5.20",
    quote: {
      es: "Lo que impide la acción hace avanzar la acción. Lo que se interpone en el camino se convierte en el camino.",
      en: "The impediment to action advances action. What stands in the way becomes the way.",
      it: "L'ostacolo all'azione fa avanzare l'azione. Ciò che sbarra la strada diventa la strada.",
    },
    lesson: {
      es: "Un rate limit no es el muro: es el diseño que faltaba. Cola y backoff.",
      en: "A rate limit isn't the wall; it's the missing design. Queue and backoff.",
      it: "Un rate limit non è il muro: è il design che mancava. Coda e backoff.",
    },
  },
  {
    id: "suffer-in-imagination",
    author: "seneca",
    work: "letters",
    ref: "13",
    quote: {
      es: "Sufrimos más a menudo en la imaginación que en la realidad.",
      en: "We suffer more often in imagination than in reality.",
      it: "Soffriamo più spesso nell'immaginazione che nella realtà.",
    },
    lesson: {
      es: "Antes de entrar en pánico, abre los logs. Casi siempre es menos de lo que parece.",
      en: "Before you panic, open the logs. It's almost always less than it looks.",
      it: "Prima di andare nel panico, apri i log. Quasi sempre è meno di quel che sembra.",
    },
  },
  {
    id: "be-one",
    author: "marcus",
    work: "meditations",
    ref: "10.16",
    quote: {
      es: "No pierdas más tiempo discutiendo cómo debe ser un hombre bueno. Sé uno.",
      en: "Waste no more time arguing what a good man should be. Be one.",
      it: "Non perdere altro tempo a discutere di come debba essere un uomo buono. Sii uno.",
    },
    lesson: {
      es: "Deja de debatir la arquitectura perfecta en el chat. Escribe el test que falla.",
      en: "Stop debating the perfect architecture in chat. Write the failing test.",
      it: "Smetti di discutere l'architettura perfetta in chat. Scrivi il test che fallisce.",
    },
  },
  {
    id: "no-wind-favourable",
    author: "seneca",
    work: "letters",
    ref: "71",
    quote: {
      es: "Si uno no sabe a qué puerto navega, ningún viento le es favorable.",
      en: "If a man does not know to which port he is sailing, no wind is favourable.",
      it: "Se uno non sa verso quale porto naviga, nessun vento gli è favorevole.",
    },
    lesson: {
      es: "Sin un contrato claro entre sistemas, ningún framework te va a salvar.",
      en: "Without a clear contract between systems, no framework will save you.",
      it: "Senza un contratto chiaro tra sistemi, nessun framework ti salverà.",
    },
  },
  {
    id: "say-what-you-would-be",
    author: "epictetus",
    work: "discourses",
    ref: "3.23",
    quote: {
      es: "Primero dite a ti mismo qué quieres ser; después haz lo que tengas que hacer.",
      en: "First say to yourself what you would be; and then do what you have to do.",
      it: "Prima di' a te stesso che cosa vuoi essere; poi fa' ciò che devi fare.",
    },
    lesson: {
      es: "Primero define qué significa «hecho». Después, escribe el código.",
      en: "First define what “done” means. Then write the code.",
      it: "Prima definisci cosa significa «fatto». Poi scrivi il codice.",
    },
  },
  {
    id: "do-less",
    author: "marcus",
    work: "meditations",
    ref: "4.24",
    quote: {
      es: "Si buscas tranquilidad, haz menos. O, mejor dicho, haz lo esencial.",
      en: "If you seek tranquility, do less. Or, more accurately, do what's essential.",
      it: "Se cerchi la tranquillità, fai meno. O, meglio, fai l'essenziale.",
    },
    lesson: {
      es: "Cada dependencia es un incidente en potencia. Integra solo lo esencial.",
      en: "Every dependency is a potential incident. Integrate only what's essential.",
      it: "Ogni dipendenza è un incidente potenziale. Integra solo l'essenziale.",
    },
  },
  {
    id: "while-we-postpone",
    author: "seneca",
    work: "letters",
    ref: "1",
    quote: {
      es: "Mientras aplazamos las cosas, la vida pasa de largo.",
      en: "While we are postponing, life speeds by.",
      it: "Mentre rimandiamo, la vita corre via.",
    },
    lesson: {
      es: "Ese TODO de «añadir manejo de errores» lleva meses ahí. Producción no espera.",
      en: "That “add error handling” TODO has been there for months. Production doesn't wait.",
      it: "Quel TODO «gestire gli errori» è lì da mesi. La produzione non aspetta.",
    },
  },
  {
    id: "best-revenge",
    author: "marcus",
    work: "meditations",
    ref: "6.6",
    quote: {
      es: "La mejor venganza es no parecerse a quien te hizo daño.",
      en: "The best revenge is not to be like the one who wronged you.",
      it: "La miglior vendetta è non somigliare a chi ti ha fatto del male.",
    },
    lesson: {
      es: "¿La API externa devuelve errores crípticos? La tuya, no. Mensajes claros, siempre.",
      en: "The external API returns cryptic errors? Yours doesn't. Clear messages, always.",
      it: "L'API esterna restituisce errori criptici? La tua no. Messaggi chiari, sempre.",
    },
  },
  {
    id: "wish-as-they-happen",
    author: "epictetus",
    work: "enchiridion",
    ref: "8",
    quote: {
      es: "No pretendas que las cosas sucedan como quieres; quiere que sucedan como suceden, y te irá bien.",
      en: "Don't demand that things happen as you wish, but wish them to happen as they do, and you will go on well.",
      it: "Non pretendere che le cose accadano come vuoi; vuoi che accadano come accadono, e ti andrà bene.",
    },
    lesson: {
      es: "No diseñes para el camino feliz. Diseña para la red que falla: es la que hay.",
      en: "Don't design for the happy path. Design for the failing network: it's the one you've got.",
      it: "Non progettare per il caso felice. Progetta per la rete che fallisce: è quella che hai.",
    },
  },
  {
    id: "remedy-for-anger",
    author: "seneca",
    work: "onAnger",
    ref: "2.29",
    quote: {
      es: "El mejor remedio para la ira es la demora.",
      en: "The greatest remedy for anger is delay.",
      it: "Il miglior rimedio contro l'ira è il rinvio.",
    },
    lesson: {
      es: "El mensaje enfadado al proveedor, mándalo mañana. El ticket con logs, hoy.",
      en: "Send the angry message to the vendor tomorrow. The ticket with logs, today.",
      it: "Il messaggio arrabbiato al fornitore, mandalo domani. Il ticket con i log, oggi.",
    },
  },
  {
    id: "future-same-weapons",
    author: "marcus",
    work: "meditations",
    ref: "7.8",
    quote: {
      es: "Que no te perturbe el futuro: lo afrontarás, si llega, con la misma razón que hoy usas para el presente.",
      en: "Never let the future disturb you. You will meet it, if you have to, with the same reason that arms you against the present.",
      it: "Non lasciare che il futuro ti turbi: lo affronterai, se dovrai, con la stessa ragione che oggi usi per il presente.",
    },
    lesson: {
      es: "No sobredimensiones para un tráfico que no tienes. Mide hoy; escala cuando toque.",
      en: "Don't overbuild for traffic you don't have. Measure today; scale when it's time.",
      it: "Non sovradimensionare per un traffico che non hai. Misura oggi; scala quando serve.",
    },
  },
  {
    id: "habits-by-actions",
    author: "epictetus",
    work: "discourses",
    ref: "2.18",
    quote: {
      es: "Todo hábito y facultad se conserva y crece con las acciones correspondientes.",
      en: "Every habit and faculty is maintained and increased by the corresponding actions.",
      it: "Ogni abitudine e facoltà si conserva e cresce con le azioni corrispondenti.",
    },
    lesson: {
      es: "Los simulacros de incidente se practican con calma, no a las 3 a.m.",
      en: "Incident drills are practised in calm, not at 3 a.m.",
      it: "Le simulazioni di incidente si fanno con calma, non alle 3 di notte.",
    },
  },
  {
    id: "everywhere-nowhere",
    author: "seneca",
    work: "letters",
    ref: "2",
    quote: {
      es: "Estar en todas partes es no estar en ninguna.",
      en: "Everywhere means nowhere.",
      it: "Essere ovunque è non essere da nessuna parte.",
    },
    lesson: {
      es: "Un servicio que lo hace todo no se puede depurar. Una responsabilidad por pieza.",
      en: "A service that does everything can't be debugged. One responsibility per piece.",
      it: "Un servizio che fa tutto non si può debuggare. Una responsabilità per pezzo.",
    },
  },
  {
    id: "universe-is-change",
    author: "marcus",
    work: "meditations",
    ref: "4.3",
    quote: {
      es: "El universo es cambio; la vida es lo que nuestros pensamientos hacen de ella.",
      en: "The universe is change; our life is what our thoughts make it.",
      it: "L'universo è mutamento; la vita è ciò che ne fanno i nostri pensieri.",
    },
    lesson: {
      es: "La API cambiará de versión. Que tu integración se entere antes que tus usuarios.",
      en: "The API will change versions. Make your integration notice before your users do.",
      it: "L'API cambierà versione. Fai in modo che l'integrazione se ne accorga prima degli utenti.",
    },
  },
  {
    id: "master-of-himself",
    author: "epictetus",
    work: "fragments",
    ref: "",
    quote: {
      es: "No es libre quien no es dueño de sí mismo.",
      en: "No man is free who is not master of himself.",
      it: "Non è libero chi non è padrone di sé.",
    },
    lesson: {
      es: "Si tu sistema depende de que el otro nunca falle, no es tuyo: es del otro.",
      en: "If your system relies on the other one never failing, it isn't yours. It's theirs.",
      it: "Se il tuo sistema conta sul fatto che l'altro non fallisca mai, non è tuo: è suo.",
    },
  },
  {
    id: "every-act-the-last",
    author: "marcus",
    work: "meditations",
    ref: "2.5",
    quote: {
      es: "Haz cada acto de tu vida como si fuera el último.",
      en: "Do every act of your life as though it were the very last act of your life.",
      it: "Compi ogni azione della tua vita come se fosse l'ultima.",
    },
    lesson: {
      es: "Escribe cada log como si fueras tú quien lo lee a las 3 a.m.",
      en: "Write every log as if you'll be the one reading it at 3 a.m.",
      it: "Scrivi ogni log come se fossi tu a leggerlo alle 3 di notte.",
    },
  },
  {
    id: "craves-more",
    author: "seneca",
    work: "letters",
    ref: "2",
    quote: {
      es: "No es pobre quien tiene poco, sino quien desea más.",
      en: "It is not the man who has too little, but the man who craves more, that is poor.",
      it: "Non è povero chi ha poco, ma chi desidera di più.",
    },
    lesson: {
      es: "No necesitas otra herramienta de monitorización. Necesitas mirar la que ya tienes.",
      en: "You don't need another monitoring tool. You need to look at the one you have.",
      it: "Non ti serve un altro strumento di monitoraggio. Ti serve guardare quello che hai.",
    },
  },
  {
    id: "rocky-headland",
    author: "marcus",
    work: "meditations",
    ref: "4.49",
    quote: {
      es: "Sé como el promontorio contra el que rompen las olas: se mantiene firme y a su alrededor se calma el agua.",
      en: "Be like the headland on which the waves constantly break: it stands firm, and around it the seething waters are laid to rest.",
      it: "Sii come il promontorio contro cui si infrangono le onde: resta saldo e intorno a lui l'acqua si placa.",
    },
    lesson: {
      es: "Picos de tráfico, tormentas de reintentos, webhooks duplicados. Una cola firme y todo se calma.",
      en: "Traffic spikes, retry storms, duplicate webhooks. A steady queue and it all settles.",
      it: "Picchi di traffico, tempeste di retry, webhook duplicati. Una coda salda e tutto si calma.",
    },
  },
  {
    id: "nothing-great-suddenly",
    author: "epictetus",
    work: "discourses",
    ref: "1.15",
    quote: {
      es: "Nada grande se crea de repente.",
      en: "No great thing is created suddenly.",
      it: "Nessuna grande cosa nasce all'improvviso.",
    },
    lesson: {
      es: "Una buena integración no sale en un sprint. Sale de muchos commits pequeños.",
      en: "A good integration doesn't ship in one sprint. It ships in many small commits.",
      it: "Una buona integrazione non nasce in uno sprint. Nasce da tanti piccoli commit.",
    },
  },
  {
    id: "learn-while-teaching",
    author: "seneca",
    work: "letters",
    ref: "7",
    quote: {
      es: "Los hombres aprenden mientras enseñan.",
      en: "Men learn while they teach.",
      it: "Gli uomini imparano mentre insegnano.",
    },
    lesson: {
      es: "Documenta la integración como si se la explicaras a alguien nuevo. Aprenderás tú.",
      en: "Document the integration as if explaining it to someone new. You'll be the one learning.",
      it: "Documenta l'integrazione come se la spiegassi a un nuovo collega. Imparerai tu.",
    },
  },
  {
    id: "look-within",
    author: "marcus",
    work: "meditations",
    ref: "7.59",
    quote: {
      es: "Mira dentro de ti. Dentro está la fuente del bien.",
      en: "Look within. Within is the fountain of good.",
      it: "Guarda dentro di te. Dentro c'è la fonte del bene.",
    },
    lesson: {
      es: "Antes de culpar a la API externa, revisa tu propio payload.",
      en: "Before blaming the external API, check your own payload.",
      it: "Prima di dare la colpa all'API esterna, controlla il tuo payload.",
    },
  },
  {
    id: "best-of-what-is-ours",
    author: "epictetus",
    work: "discourses",
    ref: "1.1",
    quote: {
      es: "Aprovecha al máximo lo que depende de ti y toma el resto como venga.",
      en: "Make the best use of what is in your power, and take the rest as it comes.",
      it: "Sfrutta al meglio ciò che dipende da te e prendi il resto come viene.",
    },
    lesson: {
      es: "No controlas al proveedor. Controlas la idempotencia, la cola y el mensaje de error.",
      en: "You don't control the vendor. You control idempotency, the queue and the error message.",
      it: "Non controlli il fornitore. Controlli idempotenza, coda e messaggio d'errore.",
    },
  },
  {
    id: "we-waste-time",
    author: "seneca",
    work: "shortnessOfLife",
    ref: "1",
    quote: {
      es: "No es que tengamos poco tiempo, sino que perdemos mucho.",
      en: "It is not that we have a short time to live, but that we waste a lot of it.",
      it: "Non è che abbiamo poco tempo, è che ne sprechiamo molto.",
    },
    lesson: {
      es: "Automatiza el despliegue una vez. Te devuelve horas cada semana.",
      en: "Automate the deploy once. It gives you hours back every week.",
      it: "Automatizza il deploy una volta. Ti restituisce ore ogni settimana.",
    },
  },
  {
    id: "soul-dyed-by-thoughts",
    author: "marcus",
    work: "meditations",
    ref: "5.16",
    quote: {
      es: "Tal como sean tus pensamientos habituales, así será tu mente: el alma se tiñe de sus pensamientos.",
      en: "Such as are your habitual thoughts, such also will be your mind; for the soul is dyed by the thoughts.",
      it: "Come sono i tuoi pensieri abituali, così sarà la tua mente: l'anima si tinge dei suoi pensieri.",
    },
    lesson: {
      es: "Si cada día parcheas a mano, tu sistema acaba siendo un parche. Automatiza el hábito.",
      en: "Patch by hand every day and your system becomes a patch. Automate the habit.",
      it: "Se ogni giorno metti pezze a mano, il sistema diventa una pezza. Automatizza l'abitudine.",
    },
  },
  {
    id: "two-ears-one-mouth",
    author: "zeno",
    work: "lives",
    ref: "7.23",
    quote: {
      es: "Tenemos dos orejas y una sola boca para escuchar más y hablar menos.",
      en: "We have two ears and one mouth, so that we may listen more and talk less.",
      it: "Abbiamo due orecchie e una bocca sola per ascoltare di più e parlare di meno.",
    },
    lesson: {
      es: "Antes de integrar, escucha: lee la documentación entera y los errores que devuelve.",
      en: "Before integrating, listen: read the whole documentation and the errors it returns.",
      it: "Prima di integrare, ascolta: leggi tutta la documentazione e gli errori che restituisce.",
    },
  },
  {
    id: "cease-to-hope",
    author: "seneca",
    work: "letters",
    ref: "5",
    quote: {
      es: "Deja de esperar y dejarás de temer.",
      en: "Cease to hope and you will cease to fear.",
      it: "Smetti di sperare e smetterai di temere.",
    },
    lesson: {
      es: "No esperes que el webhook llegue una sola vez. Asume duplicados y dormirás tranquilo.",
      en: "Don't hope the webhook arrives only once. Assume duplicates and sleep well.",
      it: "Non sperare che il webhook arrivi una volta sola. Dai per scontati i duplicati e dormi sereno.",
    },
  },
];
