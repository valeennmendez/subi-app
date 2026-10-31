# Subi · Guía de diseño

Subi es una app web de carpooling para viajes de larga distancia en Argentina.
Stack: React + Tailwind CSS 4 (sin Shadcn).

Esta guía cubre la etapa 1 (**registro, login, inicio y mi cuenta**) y la fase 3.2, el módulo de conductor (**publicar viaje, mis viajes y toast**). Las próximas etapas (buscador de viajes, detalle, reservas y calificaciones) deben reutilizar estos mismos tokens y componentes.

## 1. Principios

1. **Simple, no cargado.** Una acción principal por pantalla, mucho aire y pocos elementos. Referencia de estilo: Uber.
2. **Oscuro y blanco primero, verde como detalle.** El botón principal es siempre el elemento más contrastado de la pantalla. El verde marca la identidad (logo, ruta, verificaciones) y los links.
3. **Formas redondeadas.** Botones y campos en píldora, tarjetas con esquinas amplias.
4. **Sin sombras.** La jerarquía se logra con bordes finos y cambios de fondo.
5. **Accesible por defecto.** Contraste AA, texto base de 16 px, objetivos táctiles de al menos 44 px, etiquetas siempre visibles y errores en línea.

## 2. Paleta de colores

Paleta base: "Pampa Route Minimal" (Primary `#0F172A`, Secondary `#10B981`, Tertiary `#059669`, Neutral `#64748B`), con ajustes de contraste para texto.

| Token | Hex | Uso |
|---|---|---|
| `ink` (Primary) | `#0F172A` | Texto principal, botón primario (fondo), destino en el dibujo de ruta, etiqueta del destino |
| `muted` | `#475569` | Texto secundario, ayudas, etiquetas de datos, subtítulos, texto de la casilla |
| `neutral` | `#64748B` | Íconos dentro de campos y bordes de énfasis. **No usar para texto**: no alcanza el contraste sobre `surface` |
| `canvas` | `#FFFFFF` | Fondo de página (inicio y mi cuenta), tarjetas, botón primario (texto) |
| `surface` | `#EEF2FB` | Fondo de campos, fondo de login y registro, tarjetas de rutas frecuentes, avatar |
| `line` | `#D5DDEE` | Bordes de tarjetas, campos y divisores de filas |
| `brand` (Secondary) | `#10B981` | Logo, puntos y halos de la ruta. **Solo como relleno**: no usar como color de texto sobre blanco |
| `brand-strong` | `#047857` | Links, casilla marcada y cualquier texto verde sobre fondo claro |
| `brand-tertiary` | `#059669` | Reservado para estados hover o de relleno intermedio. No se usa como texto |
| `brand-soft` | `#D1FAE5` | Fondo de insignias "Verificada" y del ítem activo del menú de cuenta |
| `brand-deep` | `#065F46` | Texto sobre `brand-soft` (insignias de verificación) |
| `road` | `#DCE4F5` | Camino del dibujo decorativo de fondo |
| `error` | `#B42318` | Mensajes de error, borde de campo con error, "Cerrar sesión", texto del aviso general y de la insignia "Cancelado", ícono del toast de error |
| `error-soft` | `#FEF3F2` | Fondo del aviso general de error, del toast de error y de la insignia "Cancelado" |
| `error-line` | `#FDA29B` | Borde de esos mismos elementos |
| `brand-line` | `#6EE7B7` | Borde del toast de éxito |

### Contrastes de referencia (aproximados)

| Combinación | Ratio | Resultado |
|---|---|---|
| `ink` sobre `canvas` | ≈ 17:1 | AAA |
| `muted` sobre `canvas` | ≈ 7,5:1 | AAA |
| `muted` sobre `surface` | ≈ 6,8:1 | AA |
| `brand-strong` sobre `canvas` | ≈ 5,5:1 | AA |
| `brand-deep` sobre `brand-soft` | ≈ 6:1 | AA |
| `error` sobre `canvas` | ≈ 6,5:1 | AA |
| `error` sobre `error-soft` | ≈ 6:1 | AA |
| `ink` sobre `brand-soft` y sobre `error-soft` | ≈ 15:1 | AAA (texto del toast) |
| `ink` sobre `brand` | ≈ 7:1 | AA (texto oscuro sobre verde) |
| `neutral` sobre `canvas` | ≈ 4,8:1 | AA, pero solo para íconos y bordes |

Reglas:
- El texto blanco va solo sobre `ink`.
- El verde `brand` nunca se usa como color de texto sobre blanco.
- No comunicar estados solo con color: los errores llevan siempre texto.

### Tokens para Tailwind 4

```css
@import "tailwindcss";

@theme {
  --color-ink: #0F172A;
  --color-muted: #475569;
  --color-neutral: #64748B;
  --color-canvas: #FFFFFF;
  --color-surface: #EEF2FB;
  --color-line: #D5DDEE;
  --color-brand: #10B981;
  --color-brand-strong: #047857;
  --color-brand-tertiary: #059669;
  --color-brand-soft: #D1FAE5;
  --color-brand-deep: #065F46;
  --color-road: #DCE4F5;
  --color-error: #B42318;
  --color-error-soft: #FEF3F2;
  --color-error-line: #FDA29B;
  --color-brand-line: #6EE7B7;

  --font-sans: "Plus Jakarta Sans", system-ui, sans-serif;

  --radius-field: 14px;
  --radius-card: 20px;
  --radius-panel: 28px;
  --radius-alert: 14px;
  --radius-toast: 16px;
}
```

## 3. Tipografía

**Familia:** Plus Jakarta Sans (Google Fonts), pesos 400, 500, 600, 700 y 800. Alternativa del sistema: `system-ui, sans-serif`.

| Rol | Tamaño / interlineado | Peso | Dónde se usa |
|---|---|---|---|
| Título de página (inicio y módulo de conductor) | 36 px / 1,2 | 700 | "Hola, Martín", "Publicar viaje", "Mis viajes" |
| Título de pantalla (cuenta) | 32 px / 1,2 | 700 | Nombre en mi cuenta |
| Título de tarjeta de acceso | 28 px / 1,2 | 800 | "Creá tu cuenta", "Iniciá sesión" |
| Logo (acceso) | 26 px | 800 | Wordmark "Subi" en login y registro |
| Logo (barra superior) | 22 px | 700 | Wordmark en la barra |
| Título de sección | 20 px / 1,3 | 700 | "Tus próximos viajes", "Rutas frecuentes", títulos de tarjeta |
| Destacado | 18 px | 600 | Nombre de ruta en tarjetas de rutas frecuentes |
| **Texto base** | **16 px / 1,45** | 400 | Párrafos, subtítulos, valores de campos, links del menú (500) |
| Etiqueta de campo | 14 px | 600 | Label arriba de cada campo |
| Ayuda / error / secundario | 14 px | 400 | Textos de apoyo, errores en línea, casilla, pie de formularios |

Reglas:
- Ningún texto por debajo de 14 px.
- Las etiquetas están siempre visibles arriba del campo (no usar solo el placeholder).
- Títulos en una sola línea siempre que sea posible, con frases cortas en voseo ("Creá", "Iniciá", "Ingresá").

## 4. Espaciado

Base de 4 px. Escala usada: 4, 6, 8, 12, 16, 18, 20, 24, 32, 40, 48, 64.

| Uso | Valor |
|---|---|
| Etiqueta → campo → ayuda/error | 6 px |
| Separación entre campos de un formulario | 18 px |
| Separación entre grupos en una grilla (campos de búsqueda, tarjetas de rutas) | 16 px |
| Padding interno de tarjetas | 24 px |
| Padding de la tarjeta de acceso | 40 px |
| Separación entre secciones de inicio | 40 px (título de sección con 16 px debajo) |
| Margen horizontal de página (escritorio) | 40 px |
| Margen vertical de página | 48 px arriba, 64 px abajo |
| Separación entre columnas (menú y contenido de cuenta) | 48 px |
| Grilla del formulario de publicar viaje (6 columnas) | 18 px. Origen y Destino ocupan 3 columnas cada uno; Fecha, Asientos y Precio, 2 cada uno |
| Filas de viaje en "Mis viajes" | 16 px entre filas, 24 px de padding y 32 px entre columnas internas |
| Toast | 16 px bajo la barra superior y 40 px del borde derecho de la página |

Tamaños fijos:

| Elemento | Medida |
|---|---|
| Altura mínima de cualquier objetivo táctil | **44 px** |
| Altura de campos y botones | 52 px |
| Altura de la barra superior | 72 px |
| Altura mínima de filas y de ítems de menú | 48 a 64 px |
| Ancho máximo del contenido (inicio y cuenta) | 1120 px |
| Ancho máximo de la tarjeta de acceso | 480 px |
| Ancho del menú lateral de cuenta | 240 px |
| Avatar | 44 px (barra), 80 px (perfil) |
| Ancho del toast | 400 px (100 % del ancho en pantallas angostas) |
| Ícono de campo | 20 px, a 16 px del borde izquierdo |
| Ícono del toast | círculo de 28 px |

Punto de quiebre actual: **800 px**. Por debajo, las grillas pasan a una columna y los links de la barra superior se ocultan. El diseño móvil completo (barra inferior con Inicio, Buscar, Viajes y Cuenta) está pendiente de diseñar.

## 5. Radios

| Elemento | Radio |
|---|---|
| Botones y campos de login y registro | 999 px (píldora) |
| Tarjeta de acceso | 28 px |
| Tarjetas (inicio y cuenta) y tarjetas de rutas | 20 px |
| Campos de búsqueda en inicio | 14 px |
| Ítems del menú de cuenta | 10 px |
| Logo (cuadrado con "S") | 10 px en barra, 12 px en acceso |
| Insignias (verificación y estado) | 999 px |
| Aviso general de error | 14 px |
| Toast | 16 px |
| Avatar | 50 % |

## 6. Sombras y elevación

**No se usan sombras.** La separación se logra con:
- borde de 1 px en `line` sobre fondo blanco,
- fondo `surface` para campos y tarjetas secundarias,
- fondo `surface` en toda la página de login y registro, con la tarjeta blanca encima.

Si en etapas futuras hace falta elevación (menús desplegables, modales), usar una sola sombra suave: `0 8px 24px rgba(15, 23, 42, 0.10)`. Esta sombra es una propuesta y todavía no está en ninguna pantalla.

## 7. Componentes

**Botón primario.** Píldora de 52 px, fondo `ink`, texto blanco en peso 700, ancho completo en formularios. Es el único botón relleno de cada pantalla. Mientras se envía un formulario, el botón conserva su tamaño, cambia el texto a la acción en gerundio ("Publicando...") y queda deshabilitado.

**Campo de texto.** Etiqueta de 14 px arriba, campo de 52 px con fondo `surface`, borde `line`, ícono a la izquierda en `neutral` (usuario, correo, candado), y botón de ojo de 44 px a la derecha en contraseñas. Foco: contorno de 2 px en `ink` y fondo blanco. Error: borde y texto `error`, con el mensaje debajo.

**Íconos de campo.** Trazo de 2 px, 20 px, color `neutral`, a la izquierda del campo. Registro y login: usuario, correo y candado. Publicar viaje: origen (círculo con punto), destino (pin), fecha (calendario), asientos (personas) y precio (signo $ dentro de un círculo). Origen y destino usan íconos distintos para diferenciarlos de un vistazo.

**Campo con ayuda y error.** Debajo del campo va primero el error (14 px, `error`) y después la ayuda (14 px, `muted`), si hay. La ayuda no se reemplaza por el error.

**Casilla.** Control de 24 px con `brand-strong` al marcarse, dentro de una fila de al menos 44 px. Los links dentro del texto usan `brand-strong`.

**Link.** `brand-strong`, peso 600. En filas sueltas ("Editar", "Buscar un viaje") tiene 44 px de alto.

**Tarjeta.** Fondo blanco, borde `line` de 1 px, radio 20 px, padding 24 px.

**Fila de datos.** Altura mínima de 64 px, etiqueta secundaria de 14 px arriba, valor debajo, link "Editar" a la derecha y divisor `line` entre filas.

**Insignia de estado.** Píldora de 14 px en peso 600 con borde de 1 px. Se usa para verificaciones y para el estado de un viaje:

| Estado | Etiqueta | Fondo | Texto | Borde |
|---|---|---|---|---|
| `scheduled` | Programado | `surface` | `ink` | `line` |
| `completed` (y "Verificada") | Completado | `brand-soft` | `brand-deep` | `brand-soft` |
| `cancelled` | Cancelado | `error-soft` | `error` | `error-line` |

El estado siempre se comunica con texto, no solo con color.

**Aviso general de error.** Va arriba del formulario cuando el error no corresponde a un campo (por ejemplo, el servidor rechazó el envío por otro motivo). Fondo `error-soft`, borde `error-line`, radio 14 px, padding 14 × 16 px, ícono de advertencia y texto de 14 px en peso 600 color `error`. Lleva `role="alert"` y 24 px de margen inferior.

**Toast.** Notificación temporal para cualquier parte de la app, con dos variantes. Mide 400 px y tiene radio de 16 px, fondo tintado y borde fino, sin sombra. Lleva un ícono circular de 28 px, una etiqueta en 14 px y peso 700, el mensaje en 14 px y un botón de cerrar de 44 px a la derecha.

| Variante | Etiqueta | Fondo y borde | Ícono | Rol |
|---|---|---|---|---|
| Éxito | Listo | `brand-soft` y `brand-line` | Tilde oscuro sobre `brand` | `status` |
| Error | Error | `error-soft` y `error-line` | Signo de exclamación blanco sobre `error` | `alert` |

Aparece en la esquina superior derecha, bajo la barra superior (en pantallas angostas, a todo el ancho). Se cierra solo a los 5 segundos y se pausa mientras el usuario lo tiene con el cursor o el foco. Si hay más de uno, se apilan con 12 px de separación.

**Fila de viaje.** Tarjeta de 20 px de radio con cuatro bloques: ruta y fecha (flexible), asientos, precio por asiento e insignia de estado. Los bloques se separan 32 px. En pantallas angostas pasa a dos columnas. Todavía no lleva "Editar" ni "Cancelar"; esos controles irán a la derecha en una fase futura.

**Barra superior.** 72 px, borde inferior `line`. Logo, links "Buscar viajes", "Publicar viaje" y "Mis viajes" (el activo en peso 700) y, a la derecha, el nombre y el avatar con iniciales.

**Menú lateral de cuenta.** Ítems de 48 px. El activo tiene fondo `brand-soft` y peso 700. "Cerrar sesión" va al final, separado por un borde superior, en texto `error` y sin botón.

**Dibujo de ruta (fondo de login y registro).** SVG decorativo con `aria-hidden`: un camino de `road` con línea blanca punteada, tres puntos de `brand` con halo y un destino en `ink`. Cada punto lleva una etiqueta en píldora blanca (Buenos Aires, Rosario, Córdoba) y la del destino es oscura (Mendoza). El dibujo es esquemático y no sigue la geografía real. Debe ser un componente reutilizable.

## 8. Pantallas

### 8.1 Registro

Pantalla de acceso: fondo `surface` con el dibujo de ruta, y una tarjeta blanca centrada (480 px máximo, radio 28 px, padding 40 px).

Contenido, de arriba a abajo:
1. Logo centrado.
2. Título "Creá tu cuenta" y subtítulo "Sumate a la comunidad que comparte viajes en toda la Argentina."
3. Campos: **Nombre completo**, **Correo electrónico**, **Contraseña** (con ojo, placeholder "Mínimo 8 caracteres") y **Confirmar contraseña** (con ojo).
4. Una sola casilla: "Soy mayor de 18 años y acepto los Términos y la Política de privacidad."
5. Botón "Crear cuenta".
6. Pie separado por línea: "¿Ya tenés cuenta? Iniciá sesión."

Comportamiento:
- Los errores aparecen en línea debajo del campo, al salir del campo o al enviar. El mockup muestra "Ingresá un correo válido" como ejemplo.
- El teléfono no se pide en el alta: se solicita antes de la primera reserva.
- No hay barra de fuerza de contraseña ni bloques de confianza.

### 8.2 Login

Misma tarjeta y fondo que el registro.

Contenido:
1. Logo centrado.
2. Título "Iniciá sesión" y subtítulo "Ingresá para viajar o publicar tus salidas."
3. Campos: **Correo electrónico** y **Contraseña** (con ojo). A la derecha de la etiqueta de contraseña va el link "¿Olvidaste tu contraseña?".
4. Botón "Ingresar".
5. Pie: "¿Aún no tenés cuenta? Registrate gratis."

Sin botones de ingreso social por ahora. Si se agregan, debe ser un único botón secundario de Google debajo de "Ingresar".

### 8.3 Inicio

Pantalla de página completa con la barra superior (activo: "Buscar viajes") y un contenedor de 1120 px.

Contenido:
1. Título "Hola, Martín" y subtítulo "¿A dónde viajás esta vez?"
2. **Tarjeta de búsqueda** con cuatro campos en una fila (Origen, Destino, Fecha, Pasajeros) y el botón "Buscar viajes" a la derecha. Es la acción principal de la pantalla.
3. **Tus próximos viajes**: tarjeta con estado vacío ("Todavía no tenés viajes. Cuando reserves uno, va a aparecer acá.") y link "Buscar un viaje".
4. **Rutas frecuentes**: tres tarjetas `surface` (Buenos Aires → Rosario, Buenos Aires → Córdoba, Rosario → Córdoba), cada una con el link "Ver viajes".

Sin banners ni carruseles. En pantallas angostas, todo pasa a una sola columna.

### 8.4 Mi cuenta

Barra superior (sin ítem activo) y un contenedor de 1120 px con dos columnas: menú de 240 px y contenido.

**Menú lateral:** Datos personales (activo), Vehículos, Pagos, Preferencias de viaje, Seguridad, Ayuda y legales, y al final **Cerrar sesión**.

**Contenido:**
1. Encabezado de perfil: avatar de 80 px con iniciales, nombre "Martín Gómez" y línea "4,8 de calificación · 42 viajes · Miembro desde enero de 2024".
2. Tarjeta **Datos personales**: filas de Nombre, Email, Teléfono y Ciudad, cada una con su link "Editar".
3. Tarjeta **Verificación**: filas de Identidad (DNI) y Teléfono, con insignia "Verificada" o "Verificado".

El detalle de cada ítem del menú (vehículos, pagos, preferencias, etc.) vive en su propia pantalla y no se muestra todo junto. Las métricas de ahorro y CO₂ se postergan para una etapa posterior.

### 8.5 Publicar viaje

Página interna con la barra superior ("Publicar viaje" activo, en peso 700) y el contenedor de 1120 px. No lleva el dibujo de ruta ni la tarjeta centrada de login y registro.

1. Título "Publicar viaje" y subtítulo "Contanos de dónde salís y a dónde vas."
2. Tarjeta con el aviso general de error (solo cuando corresponde) y una grilla de cinco campos:

| Campo | Control | Ícono | Reglas y mensajes |
|---|---|---|---|
| Origen | Texto, 120 caracteres máximo | Círculo con punto | Obligatorio |
| Destino | Texto, 120 caracteres máximo | Pin | Obligatorio y distinto del origen: "El destino debe ser distinto del origen" |
| Fecha y hora de salida | `datetime-local` nativo | Calendario | Obligatorio y futuro: "Elegí una fecha y hora futuras" |
| Asientos disponibles | Numérico, de 1 a 8 | Personas | Entero de 1 a 8. Ayuda: "De 1 a 8 asientos" |
| Precio por asiento | Numérico, en pesos | Signo $ | Entero positivo con tope: "El precio supera el máximo permitido". Ayuda: "Al reservar se cobra una seña del 15%." |

3. Botón primario "Publicar viaje" de ancho completo.

Comportamiento:
- Errores en línea debajo de cada campo, con el mismo estilo del registro.
- Sin pantalla de resumen: el formulario directo alcanza.
- Si el envío tiene éxito, se redirige a "Mis viajes" y se muestra el toast de éxito "Tu viaje se publicó correctamente."
- En pantallas angostas, los campos pasan a una sola columna.

### 8.6 Mis viajes

Página interna con la barra superior ("Mis viajes" activo) y el contenedor de 1120 px.

1. Título "Mis viajes", subtítulo "Tus viajes publicados, del más próximo al más lejano." y, a la derecha, el botón primario "Publicar viaje".
2. Lista de filas de viaje, ordenadas por fecha de salida de menor a mayor. Cada una muestra:
   - ruta "Origen → Destino" (18 px, peso 600),
   - fecha y hora en formato argentino, por ejemplo "domingo 8 de noviembre · 07:30 h" (armar con `Intl.DateTimeFormat("es-AR")`),
   - asientos como "3 de 4 asientos",
   - precio por asiento con separador de miles, por ejemplo "$12.000" (`Intl.NumberFormat("es-AR")`),
   - insignia de estado.
3. **Estado vacío:** tarjeta con "Todavía no publicaste viajes", "Cuando publiques uno, va a aparecer acá." y el link "Publicar un viaje".

El toast de éxito aparece aquí después de publicar. En esta fase no hay edición ni cancelación.

## 9. Accesibilidad

- Usar elementos nativos: `button`, `a`, `input` con `label`. No usar `div` con `onClick`.
- Todo ícono sin texto lleva `aria-label` (por ejemplo el ojo de la contraseña). Los íconos decorativos y el dibujo de ruta llevan `aria-hidden="true"`.
- Foco siempre visible: contorno de 2 px en `ink`.
- Errores en texto, asociados al campo (`aria-describedby`) y con `aria-invalid` cuando corresponda.
- Toast: `role="status"` para éxito y `role="alert"` para error. Se descarta con un botón de cerrar de 44 px que lleva `aria-label`, y no desaparece mientras tiene el foco. No depende del color: lleva ícono distinto y etiqueta ("Listo" o "Error").
- Aviso general de error con `role="alert"`. Los errores de campo se asocian con `aria-describedby`, junto con su ayuda si la hay.
- Respetar `prefers-reduced-motion` si se agregan animaciones.

## 10. Pendientes

- Diseño móvil de publicar viaje, mis viajes y el toast.
- Edición y cancelación de viajes (fase futura), con sus estados `completed` y `cancelled`.
- Tope de precio: $5.000.000, definido en el backend y replicado en el frontend.
- Diseño móvil con barra inferior de navegación (Inicio, Buscar, Viajes, Cuenta).
- Pantalla de carga: logo centrado con indicador discreto o esqueletos, sin texto técnico.
- Logo definitivo (el actual, un cuadrado verde con una "S", es provisional).
- Datos de ejemplo (nombre, calificación, rutas, ciudades del dibujo) a reemplazar por datos reales.
- Estados de error del servidor (credenciales inválidas, correo ya registrado).
