# Daily Stoic

[English](README.md) · [Español](README.es.md) · **Italiano**

Una citazione stoica al giorno, in inglese, spagnolo e italiano, pronta da condividere come immagine su Instagram, WhatsApp o Google Chat.

L'app è piccola di proposito. Quello che mostra è come **integrare API di terze parti in modo che non si rompano**:

- **Timeout** su ogni tentativo, perché un'API bloccata non blocchi la pagina.
- **Retry solo quando ha senso** (errori di rete, timeout, 429 e 5xx), con backoff esponenziale e rispettando `Retry-After`. Un 4xx non viene ripetuto.
- **Validazione delle risposte con `zod`**: se l'API cambia, c'è un errore chiaro e non `undefined` sullo schermo.
- **Fallback**: se l'API delle citazioni non risponde, viene servita una citazione locale già tradotta.
- **Traduzione degradabile**: se una lingua fallisce, solo quella torna all'inglese.
- **Cache pensata per la quota gratuita**: circa 2 chiamate a MyMemory al giorno.
- **Adapter intercambiabili**: passare da MyMemory a DeepL significa scrivere un solo file.

I dettagli tecnici, il diagramma, l'API e come avviarla sono nel [README in inglese](README.md).

```bash
npm install && npm run dev
```
