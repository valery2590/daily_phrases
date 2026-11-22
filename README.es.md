# Estoico en producción

[English](README.md) · **Español** · [Italiano](README.it.md)

*Calma estoica para sistemas que fallan.* Una cita estoica al día y una lección de una línea que la traduce a la vida de un desarrollador, en inglés, español e italiano, lista para compartir como imagen en Instagram, WhatsApp o Google Chat.

> «Algunas cosas dependen de nosotros y otras no». (Epicteto, *Enquiridión* 1)
>
> `// La API del otro lado no depende de ti. El timeout, el reintento y la alerta, sí.`

La idea de fondo es la dicotomía del control aplicada a las integraciones: no controlas si la API del otro lado se cae; sí controlas los reintentos, la idempotencia, las alertas y cómo reaccionas.

- **Catálogo curado**: cada cita es atribuible a una obra concreta y su lección está escrita para ella. Todo está traducido a mano, sin traducción automática.
- **Orden aleatorio pero estable por fecha UTC**: el catálogo se baraja en cada ciclo y no se repite ninguna cita hasta que han salido todas; la misma fecha da siempre la misma entrada. La página, la API y la imagen coinciden sin caché ni estado.
- **Límites de longitud comprobados en los tests**, para que la cita y la lección siempre quepan en la tarjeta.
- **`fetchWithRetry`** (timeout, reintentos selectivos, backoff, `Retry-After`) queda listo para la futura publicación automática en Instagram.

Los detalles técnicos, la API, cómo añadir entradas y cómo ejecutarlo están en el [README en inglés](README.md).

```bash
npm install && npm run dev
```
