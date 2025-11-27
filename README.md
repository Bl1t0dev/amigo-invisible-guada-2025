# Amigo Invisible - Paquete completo

Estructura:
- server.js            (backend Node.js + Express + SQLite)
- package.json
- .env.example
- /public
  - index.html         (página pública)
  - admin.html         (panel administrador)

## Cómo usar (local, pruebas)

1. Copia `.env.example` a `.env` y modifica si quieres. Por defecto `SMS_PROVIDER=mock` (no envía SMS, muestra OTP en consola).
2. Instala dependencias:
   ```
   npm install
   ```
3. Inicia servidor:
   ```
   npm start
   ```
4. Abre `http://localhost:3000/public/admin.html` o `http://localhost:3000/admin.html` (según tu servidor) para crear evento, subir CSV y generar sorteo.
   - CSV: debe tener cabecera `name,phone` y cada fila con nombre y teléfono (prefijo internacional recomendado).
   - Restricciones: en admin, escribe por línea `giverPhone,receiverPhone`.

5. Participantes usan `http://localhost:3000/` para solicitar OTP y ver su asignado (en modo mock, el OTP aparece en la consola donde corre el servidor).

## Seguridad y producción
- Añade autenticación para el panel admin antes de usar en producción.
- Si usas Twilio, pon `SMS_PROVIDER=twilio` y rellena las credenciales en `.env`.
- Usa HTTPS y considera cifrar números de teléfono si se requiere.
"# amigo-invisible-guada-2025" 
"# amigo-invisible-guada-2025" 
