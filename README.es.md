# Daily Stoic

[English](README.md) · **Español** · [Italiano](README.it.md)

Una cita estoica al día, en inglés, español e italiano, lista para compartir como imagen en Instagram, WhatsApp o Google Chat.

La app es pequeña a propósito. Lo que enseña es cómo **integrar APIs de terceros para que no se rompan**:

- **Timeout** en cada intento, para que una API colgada no cuelgue la página.
- **Reintentos solo cuando tiene sentido** (errores de red, timeouts, 429 y 5xx), con backoff exponencial y respetando `Retry-After`. Un 4xx no se reintenta.
- **Validación de las respuestas con `zod`**: si la API cambia, hay un error claro y no `undefined` en pantalla.
- **Fallback**: si la API de citas cae, se sirve una cita local ya traducida.
- **Traducción degradable**: si falla un idioma, solo ese idioma vuelve al inglés.
- **Caché pensada para la cuota gratuita**: unas 2 llamadas a MyMemory al día.
- **Adapters intercambiables**: cambiar MyMemory por DeepL es escribir un archivo.

Los detalles técnicos, el diagrama, la API y cómo ejecutarlo están en el [README en inglés](README.md).

```bash
npm install && npm run dev
```
