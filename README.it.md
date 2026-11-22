# Estoico en producción

[English](README.md) · [Español](README.es.md) · **Italiano**

*Calma stoica per sistemi che falliscono.* Una citazione stoica al giorno e una lezione di una riga che la traduce nella vita di uno sviluppatore, in inglese, spagnolo e italiano, pronta da condividere come immagine su Instagram, WhatsApp o Google Chat.

> «Alcune cose dipendono da noi, altre no». (Epitteto, *Manuale* 1)
>
> `// L'API dall'altra parte non dipende da te. Timeout, retry e alert sì.`

L'idea di fondo è la dicotomia del controllo applicata alle integrazioni: non controlli se l'API dall'altra parte cade; controlli i retry, l'idempotenza, gli alert e come reagisci. Il nome è un nome proprio e resta in spagnolo.

- **Catalogo curato**: ogni citazione è attribuibile a un'opera precisa e la sua lezione è scritta per lei. Tutto è tradotto a mano, senza traduzione automatica.
- **Rotazione deterministica per data UTC, senza mai ripetere**: la stessa data dà sempre la stessa voce. Pagina, API e immagine coincidono senza cache né stato. Quando il catalogo finisce non ricomincia: l'app avvisa quanti giorni di contenuti restano.
- **Limiti di lunghezza verificati dai test**, così citazione e lezione stanno sempre nella card.
- **`fetchWithRetry`** (timeout, retry selettivi, backoff, `Retry-After`) resta pronto per la futura pubblicazione automatica su Instagram.

I dettagli tecnici, l'API, come aggiungere voci e come avviarla sono nel [README in inglese](README.md).

```bash
npm install && npm run dev
```
