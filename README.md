# Portafolio — Ferley Orobio

Portafolio web bilingüe (español / inglés) para conseguir empleo y captar clientes freelance.
HTML, CSS y JavaScript puros: sin dependencias, sin compilación y sin nada que instalar.

## Cómo verlo

Abre `index.html` haciendo doble clic. Si prefieres un servidor local, que replica mejor el
comportamiento real:

```powershell
npx http-server -p 8000
```

Luego entra a `http://localhost:8000`.

## Estructura

```
├── index.html          Estructura de la página
├── css/styles.css      Todos los estilos
├── js/content.js       ← TUS TEXTOS: el único archivo que necesitas editar
├── js/main.js          Lógica (idioma, tema, filtros, formulario)
├── assets/             Favicon, tu CV en PDF e imágenes de proyectos
├── tools/              Comprobaciones automáticas (opcional, ver más abajo)
├── .gitignore          Evita subir credenciales por accidente
└── robots.txt
```

### Comprobar que no rompiste nada

Después de editar `content.js`, esto te avisa si falta una traducción, si un bloque `es`
tiene más elementos que el `en` o si quedó algún dato sin rellenar:

```powershell
node tools/verify.js
```

Y esto simula la página completa y prueba el cambio de idioma, el tema, los filtros y el
formulario. Necesita instalar una librería la primera vez:

```powershell
npm install jsdom
node tools/test.js
```

Ninguno de los dos modifica archivos. Si no quieres usarlos, puedes borrar la carpeta
`tools/` sin que la web se vea afectada.

---

## Lo que falta por completar

1. **Años en la formación.** Si tienes las fechas exactas del tecnólogo y de Burica S.A.
   (por ejemplo 2023 — 2025), dímelas y las pongo. Ahora aparece "SENA" y "1 año".
2. **Tu CV en PDF.** Guárdalo en `assets/CV.pdf` y luego, en `content.js`, cambia
   `cvEs: ""` por `cvEs: "assets/CV.pdf"`. Mientras esté vacío, el botón de descarga
   no aparece, que es preferible a un botón que da error.
3. **Precios.** Los cuatro servicios dicen "Presupuesto a medida". Si tienes tarifas,
   cambia el campo `price` de cada servicio en `content.js`.

### Otras cosas pendientes

- **Tu CV en PDF.** Guárdalo en `assets/CV.pdf` y luego, en `content.js`, cambia
  `cvEs: ""` por `cvEs: "assets/CV.pdf"`. Mientras esté vacío, el botón de descarga
  no aparece, que es preferible a un botón que da error.
- **Teléfono o WhatsApp.** El campo `phone` está vacío y por eso esa fila no se muestra.
  Si quieres que te escriban por WhatsApp, ponlo así: `phone: "+57 300 000 0000"`.
- **Precios.** Los cuatro servicios dicen "Presupuesto a medida" porque no sé tus tarifas.
  Poner cifras filtra clientes y te ahorra reuniones inútiles; si te animas, cambia el campo
  `price` de cada servicio en `content.js`.
- **Referencias.** Quité esa sección porque no tenías testimonios reales. Cuando un cliente
  o un jefe te escriba algo bueno, pídele permiso para publicarlo y la volvemos a montar.

---

## Personalización

### Textos y datos (`js/content.js`)

Al principio está el objeto `PROFILE`: nombre, correo, ubicación, redes y CV. Cualquier campo
que dejes vacío (`""`) desaparece de la página en lugar de quedarse a medias.

Debajo está `CONTENT`, con dos bloques idénticos: `es` y `en`. Puedes añadir o quitar
servicios, proyectos y trabajos libremente; la página se regenera con lo que haya en las
listas. Los filtros de la sección de proyectos se crean solos a partir del campo `category`.

### Metadatos y SEO (`index.html`)

Cuando publiques la web, sustituye `https://tudominio.com/` por tu URL real en tres sitios:
la etiqueta `canonical`, las etiquetas `og:` y el bloque `application/ld+json` del final.

### Imágenes de los proyectos

Cada proyecto admite un campo `image`, por ejemplo `image: "assets/chatbot.jpg"`. Si lo dejas
vacío se muestra una portada degradada con el título, que ya se ve bien. Aun así, una captura
real convence mucho más: una conversación del chatbot en WhatsApp o el panel de inventario
valen más que cualquier descripción. Tamaño recomendado: 1200 × 675 px.

Si los proyectos son de un cliente, difumina o cambia los datos sensibles antes de publicar
la captura.

### Colores

En `css/styles.css`, las dos primeras variables controlan toda la paleta:

```css
--accent: #6366f1;
--accent-2: #22d3ee;
```

---

## Formulario de contacto

Por defecto abre el gestor de correo de quien te escribe. Funciona siempre, pero se pierden
mensajes: mucha gente no tiene configurado un cliente de correo en el navegador.

Para recibirlos en tu bandeja de entrada, crea un formulario gratuito en
[Formspree](https://formspree.io), copia la URL que te dan y pégala en `formEndpoint`
dentro de `PROFILE`. No hace falta backend ni configuración adicional.

## Publicarlo gratis en GitHub Pages

1. Crea un repositorio público llamado `FERLEY2004.github.io`.
2. Sube estos archivos a la rama `main`.
3. En **Settings → Pages**, elige la rama `main` y la carpeta `/ (root)`.
4. En dos minutos estará en `https://FERLEY2004.github.io`.

```powershell
git init
git add .
git commit -m "Portafolio personal"
git branch -M main
git remote add origin https://github.com/FERLEY2004/FERLEY2004.github.io.git
git push -u origin main
```

Esa URL es la que pones en tu perfil de LinkedIn y en la cabecera del CV.

## Antes de enviarlo a una empresa

- [ ] Añadir las fechas exactas de SENA y Burica S.A. si las tienes
- [ ] Subir el CV a `assets/` y activar `cvEs`
- [ ] Cambiar `tudominio.com` por la URL real
- [ ] Añadir capturas de pantalla de tus proyectos
- [ ] Revisar la versión en inglés
- [ ] Abrirlo en el celular
- [ ] Pasar [PageSpeed Insights](https://pagespeed.web.dev/) con la URL ya publicada

## Qué incluye

Tema claro y oscuro con preferencia guardada, idioma detectado del navegador, menú móvil,
resaltado de la sección activa al desplazarse, animaciones de entrada, filtrado de proyectos,
validación del formulario, datos estructurados Schema.org, enlace de salto al contenido,
foco visible para navegación por teclado, soporte de `prefers-reduced-motion` y estilos de
impresión.
