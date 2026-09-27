# GUÍA DE APRENDIZAJE N.° 2 — De actores y casos de uso a clases
## Análisis aplicado al proyecto: **Sistema de Turismo Quillacollo**

---

## Actividad 1. Completa tus actores y casos de uso

**Sistema:** Portal de Turismo Quillacollo (mapa interactivo, directorio de servicios, actividades culturales, panel de administración).

> Los casos de uso deben comenzar con verbo + objeto. Se han numerado (CU-01 … CU-N) para poder referenciarlos en las actividades 2 y 4.

| N.° | Actor | Necesidad u objetivo | Caso de uso |
|----|---------------------------|-----------------------------------------------------|--------------------------------------|
| 1 | Visitante | Ver los atractivos turísticos en un mapa | Visualizar mapa interactivo |
| 2 | Visitante | Encontrar lugares por nombre o descripción | Buscar lugares turísticos |
| 3 | Visitante | Filtrar los lugares por tipo (Religioso, Patrimonial, Naturaleza, Gastronomía) | Filtrar por categoría |
| 4 | Visitante | Conocer la información completa de un lugar | Ver detalle de lugar |
| 5 | Visitante | Encontrar hoteles, restaurantes, artesanos, guías y transporte | Consultar directorio de servicios |
| 6 | Visitante | Localizar servicios cercanos a un lugar | Visualizar servicios en mapa |
| 7 | Visitante | Conocer las festividades y fechas importantes | Consultar actividades culturales |
| 8 | Visitante | Acceder al sistema con credenciales | Iniciar sesión |
| 9 | Visitante | Salir del sistema de forma segura | Cerrar sesión |
| 10 | Visitante | Crear una cuenta en el portal | Registrarse |
| 11 | Visitante | Recuperar la contraseña cuando la olvida | Solicitar restablecimiento de contraseña |
| 12 | Visitante | Valorar la experiencia en un lugar | Calificar lugar |
| 13 | Visitante | Retirar la calificación publicada | Eliminar su reseña |
| 14 | Editor | Mantener actualizados los atractivos turísticos | Gestionar lugares (CRUD) |
| 15 | Editor | Publicar eventos (fiestas, ferias, festivales) | Gestionar eventos (CRUD) |
| 16 | Editor | Mantener el calendario de fechas importantes | Gestionar actividades culturales (CRUD) |
| 17 | Editor | Mantener el directorio de servicios turísticos | Gestionar servicios (CRUD) |
| 18 | Editor | Revisar las fotografías de los lugares | Ver galería de imágenes |
| 19 | Editor | Incorporar fotografías al sistema | Subir imágenes |
| 20 | Administrador | Gestionar las cuentas de usuarios, editores y administradores | Gestionar usuarios (CRUD) |
| 21 | Administrador | Editar la configuración del sistema (nombre, teléfono, redes) | Gestionar configuración del sistema |
| 22 | Administrador | Visualizar estadísticas de uso (gráficos, totales) | Ver reportes y estadísticas |
| 23 | Administrador | Cambiar la imagen oficial del municipio | Gestionar logo del sitio |

**Relaciones «include» y «extend» a considerar en el diagrama:**
- **CU-12 Calificar lugar** — *include* → **CU-8 Iniciar sesión** (es obligatorio estar autenticado para publicar).
- **CU-01 Visualizar mapa interactivo** — *extend* → **CU-02 Buscar lugares** y **CU-03 Filtrar por categoría** (comportamiento opcional sobre el mismo mapa).
- **CU-04 Ver detalle de lugar** — *extend* → **CU-12 Calificar lugar** (el visitante solo puede calificar si está autenticado, y es opcional).
- **CU-05 Consultar directorio de servicios** — *extend* → **CU-06 Visualizar servicios en mapa**.
- **CU-14 Gestionar lugares** — *include* → **CU-19 Subir imágenes** (opcional, y el editor la usa también en el resto de CRUDs).

---

## Actividad 2. Especifica tus casos de uso

Se especifican los casos de uso principales. Copia cada tabla o une todas en tu documento.

### Caso de uso N.° 1

| Campo | Respuesta |
|---|---|
| **Nombre** | Ver detalle de lugar |
| **Actor principal** | Visitante |
| **Descripción** | El visitante accede a la información completa de un lugar turístico: nombre, descripción, dirección, horario, fotos, calificación promedio y reseñas de otros visitantes. |
| **Precondiciones** | El lugar debe existir en la base de datos. El visitante debe haber hecho clic en un marcador del mapa o en una tarjeta de resultados. |
| **Flujo básico** | 1. El visitante hace clic en un marcador del mapa o en una tarjeta de lugar.<br>2. El sistema redirige a la página `/place/:id`.<br>3. El frontend solicita los datos del lugar a la API (`GET /api/places/:id`).<br>4. El backend consulta la base de datos (tablas `places`, `place_images`, `reviews`).<br>5. El backend devuelve el objeto con todos los datos (incluyendo imágenes y reseñas).<br>6. El frontend renderiza la página con: nombre, descripción, dirección, horario, galería de imágenes, promedio de calificación, lista de reseñas y un mini mapa con la ubicación. |
| **Flujo alternativo** | A1 – Paso 4: si el lugar no existe (ID inválido), el backend devuelve 404 y el frontend muestra "Lugar no encontrado".<br>A2 – Paso 5: si no hay imágenes, se muestra una imagen placeholder genérica.<br>A3 – Paso 6: si hay más de 10 reseñas, solo se muestran las 10 más recientes. |
| **Postcondiciones** | El visitante visualiza correctamente toda la información del lugar. |
| **Reglas de negocio** | RN-01: solo se muestran lugares con `is_verified = 1` o los públicos activos.<br>RN-02: las reseñas se muestran de más reciente a más antigua.<br>RN-03: la calificación promedio se calcula como `AVG(rating)` de las reseñas publicadas. |

### Caso de uso N.° 2

| Campo | Respuesta |
|---|---|
| **Nombre** | Gestionar lugares (CRUD) |
| **Actor principal** | Editor / Administrador |
| **Descripción** | El usuario autenticado con permisos puede crear, leer, actualizar y eliminar lugares turísticos desde el panel de administración. |
| **Precondiciones** | El usuario debe haber iniciado sesión con rol editor o admin. Debe estar en la sección `/dashboard/sites`. |
| **Flujo básico** | 1. El usuario hace clic en "Nuevo Lugar".<br>2. El sistema muestra un formulario con campos: nombre, descripción, categoría, latitud, longitud, dirección, teléfono, horario, verificado.<br>3. El usuario completa los campos obligatorios y hace clic en "Guardar".<br>4. El frontend envía `POST /api/admin/places` con los datos y el token JWT.<br>5. El backend valida que los campos obligatorios no estén vacíos.<br>6. El backend inserta el registro en la tabla `places` y devuelve éxito.<br>7. El sistema actualiza la lista y muestra la notificación de éxito. |
| **Flujo alternativo** | A1 – Paso 5: si falta un campo obligatorio (nombre, categoría, lat, lng), el backend devuelve 400 y el sistema muestra el error en el formulario.<br>A2 – Paso 4: si el token es inválido o el rol no tiene permisos, el backend devuelve 401/403.<br>A3 – Paso 6: si el usuario elige "Editar", se envía `PUT /api/admin/places/:id`; si elige "Eliminar", `DELETE /api/admin/places/:id` con confirmación previa. |
| **Postcondiciones** | El lugar queda creado, actualizado o eliminado según la operación. La base de datos refleja el cambio y la lista se actualiza. |
| **Reglas de negocio** | RN-01: la latitud y longitud deben ser números decimales válidos.<br>RN-02: el nombre no puede estar vacío.<br>RN-03: la categoría debe existir en la tabla `categories`. |

### Caso de uso N.° 3

| Campo | Respuesta |
|---|---|
| **Nombre** | Gestionar eventos (CRUD) |
| **Actor principal** | Editor / Administrador |
| **Descripción** | Permite crear, editar, consultar y eliminar los eventos del municipio (fiestas, ferias, festivales) que se muestran en el portal. |
| **Precondiciones** | El usuario inició sesión con rol editor o admin y está en `/dashboard/events`. |
| **Flujo básico** | 1. El usuario hace clic en "Nuevo Evento".<br>2. El sistema muestra el formulario (título, descripción, ubicación, fecha inicio, fecha fin, imagen).<br>3. El usuario completa y hace clic en "Guardar".<br>4. El frontend envía `POST /api/admin/events` con el token JWT.<br>5. El backend valida que título y fecha de inicio no estén vacíos.<br>6. El backend inserta el evento en la tabla `events` y responde con el ID.<br>7. El sistema recarga la lista y muestra la notificación. |
| **Flujo alternativo** | A1 – Paso 5: si falta el título o la fecha, el backend devuelve 400.<br>A2 – Paso 4 (relación): al guardar se puede marcar el evento como destacado (`is_featured`) o próximo (`is_upcoming`).<br>A3: para editar se usa `PUT /api/admin/events/:id` y para eliminar `DELETE /api/admin/events/:id`, con confirmación. |
| **Postcondiciones** | El evento queda registrado y visible en la lista de eventos del panel. |
| **Reglas de negocio** | RN-01: el título es obligatorio.<br>RN-02: la fecha de inicio es obligatoria y debe ser una fecha válida.<br>RN-03: si `end_date` existe, debe ser posterior o igual a `start_date`. |

### Caso de uso N.° 4

| Campo | Respuesta |
|---|---|
| **Nombre** | Calificar lugar |
| **Actor principal** | Usuario registrado |
| **Descripción** | El visitante autenticado publica una calificación (1 a 5 estrellas) y un comentario sobre un lugar turístico. |
| **Precondiciones** | El usuario debe haber iniciado sesión. El lugar debe existir. El usuario no debe tener una reseña previa sobre el mismo lugar. |
| **Flujo básico** | 1. El usuario abre el detalle de un lugar (CU-04).<br>2. El usuario selecciona de 1 a 5 estrellas y escribe un comentario.<br>3. El usuario pulsa "Enviar reseña".<br>4. El frontend envía `POST /api/reviews` con `place_id`, `rating`, `comment` y el token JWT.<br>5. El backend valida: autenticación, calificación entre 1 y 5, comentario con al menos 10 caracteres, y que no exista otra reseña del mismo usuario para el mismo lugar.<br>6. El backend inserta la reseña en la tabla `reviews`.<br>7. El sistema actualiza el promedio mostrado y añade la reseña a la lista. |
| **Flujo alternativo** | A1 – Paso 5: si el usuario no está autenticado, el sistema muestra "Inicie sesión para calificar".<br>A2 – Paso 5: si el usuario ya calificó el lugar, el backend devuelve 400 "Ya calificaste este lugar".<br>A3 – Paso 5: si la calificación no está entre 1 y 5 o el comentario es corto, se muestra error de validación. |
| **Postcondiciones** | La reseña queda publicada y la calificación promedio del lugar se recalcula. |
| **Reglas de negocio** | RN-01: la calificación debe estar entre 1 y 5.<br>RN-02: el comentario debe tener al menos 10 caracteres.<br>RN-03: un usuario solo puede tener una reseña por lugar.<br>RN-04: solo el autor puede eliminar su reseña (`DELETE /api/reviews/:id`); los admin también pueden. |

### Caso de uso N.° 5

| Campo | Respuesta |
|---|---|
| **Nombre** | Visualizar mapa interactivo |
| **Actor principal** | Visitante |
| **Descripción** | El visitante ve en la página principal un mapa (OpenStreetMap/Leaflet) con marcadores de todos los lugares turísticos activos, y puede interactuar con él: centrar, hacer clic en un marcador y ver una tarjeta resumen. |
| **Precondiciones** | El servicio de mapas (Leaflet + OpenStreetMap) está disponible. Existe al menos un lugar con coordenadas. |
| **Flujo básico** | 1. El visitante entra a la página principal `/`.<br>2. El frontend solicita `GET /api/places`.<br>3. El backend devuelve los lugares con sus coordenadas, imagen de portada, categoría y promedio de reseñas.<br>4. El frontend dibuja un marcador por cada lugar en el mapa.<br>5. El visitante hace clic en un marcador y el mapa se centra (flyTo) mostrando una tarjeta con el resumen del lugar.<br>6. El visitante hace clic en la tarjeta y es dirigido al detalle (CU-04). |
| **Flujo alternativo** | A1 – Paso 3: si no hay lugares, el mapa se muestra vacío con un mensaje "No hay sitios disponibles".<br>A2 – Paso 4: desde la barra lateral el visitante puede usar CU-02 (buscar) y CU-03 (filtrar por categoría); el mapa se actualiza mostrando solo los resultados. |
| **Postcondiciones** | El visitante localiza visualmente los atractivos y accede al detalle de cualquiera. |
| **Reglas de negocio** | RN-01: solo se muestran lugares con `is_verified = 1` (activos).<br>RN-02: cada lugar debe tener latitud y longitud válidas para mostrar su marcador. |

### Caso de uso N.° 6

| Campo | Respuesta |
|---|---|
| **Nombre** | Gestionar servicios (CRUD) |
| **Actor principal** | Editor / Administrador |
| **Descripción** | El usuario autenticado mantiene el directorio de servicios turísticos: hoteles, restaurantes, artesanos, guías turísticos y transporte. |
| **Precondiciones** | El usuario inició sesión con rol editor o admin y está en `/dashboard/services`. |
| **Flujo básico** | 1. El usuario hace clic en "Nuevo Servicio".<br>2. El sistema muestra el formulario (nombre, categoría, dirección, teléfono, email, logo, descripción, lugar asociado).<br>3. El usuario completa y guarda.<br>4. El frontend envía `POST /api/admin/services` con el token JWT.<br>5. El backend valida nombre y categoría (hotel, restaurant, artisan, tour_guide, transportation).<br>6. El backend inserta el servicio y responde con éxito.<br>7. El sistema recarga la lista y muestra la notificación. |
| **Flujo alternativo** | A1 – Paso 5: si faltan nombre o categoría, el backend devuelve 400.<br>A2 – Paso 2: si el servicio se asocia a un lugar, el sistema obtiene la lista de lugares (`GET /api/admin/places-list`) y la ubicación del servicio se hereda del lugar para poder dibujarlo en el mapa.<br>A3 – Paso 6 (eliminar): el borrado es lógico — se hace `DELETE /api/admin/services/:id` que pone `is_active = 0` (soft delete). |
| **Postcondiciones** | El servicio queda registrado, actualizado o desactivado según la operación. |
| **Reglas de negocio** | RN-01: el nombre es obligatorio.<br>RN-02: la categoría debe ser una de las cinco definidas.<br>RN-03: el borrado es lógico (el registro no se elimina físicamente). |
| **Reglas de negocio** | RN-01: el nombre es obligatorio.<br>RN-02: la categoría debe ser una de las cinco definidas en el sistema.<br>RN-03: la eliminación es lógica (`is_active = 0`) y no física. |

### Caso de uso N.° 7

| Campo | Respuesta |
|---|---|
| **Nombre** | Iniciar sesión |
| **Actor principal** | Visitante (registrado como editor o administrador) |
| **Descripción** | El usuario ingresa sus credenciales (email y contraseña). El sistema valida las credenciales y emite un token JWT que permite acceder a las funciones según el rol. |
| **Precondiciones** | El usuario tiene una cuenta creada con rol user, editor o admin. |
| **Flujo básico** | 1. El usuario abre la página `/login`.<br>2. Ingresa su email y contraseña y pulsa "Entrar".<br>3. El frontend envía `POST /api/auth/login`.<br>4. El backend busca el usuario por email en la tabla `users`.<br>5. El backend compara la contraseña usando bcrypt.<br>6. El backend firma un token JWT con `{ id, username, role }` y caducidad de 7 días.<br>7. El sistema guarda token y usuario en el navegador (localStorage) y redirige según el rol (usuario a `/`, editor/admin a `/dashboard`). |
| **Flujo alternativo** | A1 – Paso 4: si el email no existe, se muestra "Credenciales inválidas".<br>A2 – Paso 5: si la contraseña es incorrecta, se muestra el mismo mensaje genérico.<br>A3 – Paso 6: si el middleware de autenticación detecta un token expirado o inválido, responde 401 y el frontend limpia la sesión. |
| **Postcondiciones** | El usuario queda autenticado con un token válido durante 7 días. |
| **Reglas de negocio** | RN-01: el email es único.<br>RN-02: las contraseñas se almacenan hasheadas con bcrypt (no en texto plano).<br>RN-03: solo los roles `admin` y `editor` pueden usar el panel `/dashboard`. |

### Caso de uso N.° 8

| Campo | Respuesta |
|---|---|
| **Nombre** | Gestionar usuarios (CRUD) |
| **Actor principal** | Administrador |
| **Descripción** | El administrador crea cuentas (asignando rol admin, editor o user), consulta todos los usuarios, edita nombre/rol/estado activo y elimina cuentas. |
| **Precondiciones** | El usuario debe estar autenticado con rol `admin`. Debe estar en `/dashboard/users`. |
| **Flujo básico** | 1. El administrador abre la sección Usuarios.<br>2. El sistema lista los usuarios (`GET /api/admin/users`) con buscador y paginación.<br>3. El administrador hace clic en "Nuevo Usuario".<br>4. Completa nombre de usuario, email, contraseña, nombre completo y rol (`admin`, `editor` o `user`).<br>5. El frontend envía `POST /api/auth/admin/register`.<br>6. El backend valida email y nombre de usuario únicos y hashea la contraseña.<br>7. El sistema crea el usuario y muestra la notificación.<br>8. Para modificar se usa `PUT /api/admin/users/:id`; para eliminar, `DELETE /api/admin/users/:id`. |
| **Flujo alternativo** | A1 – Paso 6: si el email o el nombre de usuario ya existen, el backend devuelve 400.<br>A2 – Paso 8: un administrador no puede eliminar su propia cuenta ni cambiar su propio rol de admin.<br>A3 – Paso 8: al eliminar un usuario, el sistema no permite borrar el usuario en sesión. |
| **Postcondiciones** | La cuenta queda creada, actualizada o eliminada; el rol determina los permisos del usuario. |
| **Reglas de negocio** | RN-01: el email y el nombre de usuario son únicos.<br>RN-02: los roles válidos son `admin`, `editor` y `user`.<br>RN-03: un administrador no puede eliminarse ni degradarse a sí mismo. |

### Caso de uso N.° 9

| Campo | Respuesta |
|---|---|
| **Nombre** | Consultar actividades culturales |
| **Actor principal** | Visitante |
| **Descripción** | El visitante consulta el calendario de fechas importantes de Quillacollo y puede filtrarlas por categoría (Festividad, Feriado, Evento, Conmemorativo) y ver si son anuales. |
| **Precondiciones** | Existen fechas activas cargadas en la tabla `important_dates`. |
| **Flujo básico** | 1. El visitante abre la página `/calendar`.<br>2. El frontend solicita `GET /api/important-dates`.<br>3. El backend devuelve las fechas activas ordenadas por fecha.<br>4. El frontend renderiza las tarjetas con título, fecha, categoría (con color), descripción y distintivo "Anual" si corresponde.<br>5. El visitante usa los filtros (Todas, Festividad, Feriado, Evento, Conmemorativo) y la lista se actualiza. |
| **Flujo alternativo** | A1 – Paso 5: el filtro por categoría se solicita con `GET /api/important-dates/category/:category`.<br>A2 – Paso 3: si no hay fechas, se muestra un mensaje de vacío.<br>A3: las fechas pueden consultarse también por año (`GET /api/important-dates/year/:year`), incluyendo las recurrentes. |
| **Postcondiciones** | El visitante conoce las fechas y festividades del municipio. |
| **Reglas de negocio** | RN-01: solo se muestran fechas con `is_active = 1`.<br>RN-02: si `is_recurring = 1`, la fecha se considera anual. |

### Caso de uso N.° 10

| Campo | Respuesta |
|---|---|
| **Nombre** | Ver reportes y estadísticas |
| **Actor principal** | Administrador |
| **Descripción** | El administrador visualiza, en `/dashboard/reports`, el resumen de uso del sistema: total de sitios, usuarios, eventos y reseñas, además de gráficos de visitas mensuales y distribución de categorías. |
| **Precondiciones** | El usuario debe estar autenticado con rol `admin`. |
| **Flujo básico** | 1. El administrador abre la sección Reportes.<br>2. El sistema solicita `GET /api/admin/reports/overview`.<br>3. El backend calcula totales en tiempo real: sitios, usuarios, eventos, reseñas.<br>4. El backend calcula las visitas mensuales de los últimos 12 meses contando lugares creados por mes.<br>5. El frontend renderiza tarjetas con totales, gráfico de barras mensual y gráfico de distribución. |
| **Flujo alternativo** | A1 – Paso 3: si la base de datos no responde, el backend devuelve 500 y el panel muestra un error.<br>A2: los datos son de solo lectura; no hay operaciones de escritura. |
| **Postcondiciones** | El administrador obtiene una visión general del contenido y la actividad del portal. |
| **Reglas de negocio** | RN-01: soporte solo lectura — no modifica datos.<br>RN-02: los totales se calculan con consultas agregadas (`COUNT`) sobre las tablas `places`, `users`, `events` y `reviews`. |

---

## Actividad 3. Dibuja tu diagrama de casos de uso

**Indicaciones para Draw.io** (https://app.diagrams.net):

1. Abre Draw.io y crea un diagrama en blanco.
2. En el panel de formas, en *Software*, arrastra: **Actor** (muñeco), **Usecase** (óvalo), **Rectángulo** (sistema) y las líneas de relación.
3. Dibuja un **rectángulo grande** y etiquétalo **«Sistema de Turismo Quillacollo»**.
4. Coloca **fuera** del rectángulo a los 3 actores:
   - **Visitante** (izquierda)
   - **Editor** (izquierda, debajo)
   - **Administrador** (derecha)
5. Dentro del rectángulo dibuja un **óvalo por cada caso de uso** con su nombre (verbo + objeto):

   | Actor | Casos de uso conectados |
   |---|---|
   | Visitante | Visualizar mapa interactivo, Buscar lugares turísticos, Filtrar por categoría, Ver detalle de lugar, Consultar directorio de servicios, Visualizar servicios en mapa, Consultar actividades culturales, Registrarse, Iniciar sesión, Cerrar sesión, Solicitar restablecimiento de contraseña, Calificar lugar, Eliminar su reseña |
   | Editor | Gestionar lugares, Gestionar eventos, Gestionar actividades culturales, Gestionar servicios, Ver galería de imágenes, Subir imágenes |
   | Administrador | Gestionar lugares, Gestionar eventos, Gestionar actividades culturales, Gestionar servicios, Ver galería, Subir imágenes, Gestionar usuarios, Gestionar configuración del sistema, Ver reportes y estadísticas, Gestionar logo del sitio |

6. Une **cada actor con sus casos de uso** usando línea sólida simple (asociación).
7. Añade las relaciones entre casos de uso:
   - **Calificar lugar** --«include»--> **Iniciar sesión** (flecha punteada desde Calificar lugar hacia Iniciar sesión).
   - **Visualizar mapa interactivo** --«extend»--> **Buscar lugares** y **Filtrar por categoría** (flecha punteada apuntando hacia Visualizar mapa interactivo).
8. Comprueba que todos los actores de la Actividad 1 aparecen y que cada caso de uso tiene al menos un actor conectado.
9. Exporta como imagen (File → Export as → PNG) y adjúntala en tu documento.

---

## Actividad 4. Convierte tus casos de uso en clases

### 4.1. Análisis de sustantivos, datos, acciones y reglas

| Caso de uso | Sustantivos | Datos | Acciones | Reglas |
|---|---|---|---|---|
| Iniciar sesión / Cerrar sesión | usuario, editor, administrador | email, contraseña, token JWT, rol | autenticar, comparar contraseña, generar/validar token, cerrar sesión | Email único; contraseña hasheada con bcrypt; rol debe ser editor o admin para el panel |
| Gestionar lugares (CRUD) | lugar, categoría, editor | nombre, descripción, latitud, longitud, dirección, teléfono, horario, verificado, categoríaId | crear, leer, actualizar, eliminar, validar, ubicar | Lat/lng decimales válidos; nombre obligatorio; categoría existente |
| Ver detalle de lugar | lugar, categoría, imagen, reseña, visitante | nombre, descripción, dirección, horario, latitud, longitud, calificación promedio, imágenes | mostrar, consultar, calcular promedio, ordenar | Solo lugares activos; reseñas ordenadas por fecha; promedio = AVG(rating) |
| Calificar lugar | visitante, lugar, reseña | calificación (1-5), comentario, fecha | publicar, almacenar, recalcular promedio, eliminar propia | Calificación entre 1 y 5; comentario ≥ 10 caracteres; una reseña por usuario/lugar |
| Gestionar eventos (CRUD) | evento, editor | título, descripción, ubicación, fecha inicio, fecha fin, destacado | crear, listar, actualizar, eliminar | Título y fecha obligatorios; fin ≥ inicio |
| Gestionar actividades culturales (CRUD) | actividad cultural, editor, categoría | título, descripción, fecha, categoría (festividad/feriado/evento/conmemorativo), recurrente, activo | crear, listar, actualizar, eliminar | Solo activas visibles; si es recurrente, es anual |
| Gestionar servicios (CRUD) | servicio, categoría, lugar, editor | nombre, dirección, teléfono, email, logo, categoría (hotel/restaurant/artisan/tour_guide/transportation) | crear, listar, actualizar, eliminar (lógico) | Nombre y categoría obligatorios; borrado lógico (is_active=0) |
| Gestionar usuarios (CRUD) | usuario, rol | username, email, passwordHash, nombre completo, rol, activo | crear, listar, actualizar, eliminar, asignar rol | Email y username únicos; no eliminarse a sí mismo; roles válidos |
| Ver reportes y estadísticas | reporte, lugar, usuario, evento, reseña | totales, visitas mensuales, distribución | contar, agregar, graficar | Solo lectura; totales con COUNT |
| Gestionar configuración del sistema | configuración | nombre del sitio, descripción, email contacto, teléfono, redes sociales, logo_url | leer, actualizar | Cada clave es única |

### 4.2. Clases candidatas

| Clase candidata | Atributos | Métodos / responsabilidades | Justificación |
|---|---|---|---|
| **Lugar** | id, nombre, descripción, latitud, longitud, dirección, teléfono, website, horario, verificado, creadoPor, createdAt | obtenerDetalle(), estaVerificado(), calcularPromedioRating() | Surge de CU-01, CU-02 y CU-04. Entidad central del sistema. |
| **Categoría** | id, nombre, icono, descripción | listarLugares() | Surge de CU-03 y CU-14. Clasifica los lugares. |
| **Imagen** | id, url, caption, orden, lugarId | obtenerUrl(), obtenerGaleria() | Surge de CU-04, CU-18 y CU-19. Almacena las fotos de los lugares. |
| **Reseña** | id, calificacion, comentario, fecha, usuarioId, lugarId | publicar(), esValida(), eliminar() | Surge de CU-12 y CU-13. Permite calificar y comentar. |
| **Usuario** | id, nombreUsuario, email, passwordHash, nombreCompleto, rol, activo | autenticar(), generarToken(), cambiarRol(), eliminarCuenta() | Surge de CU-08, CU-09, CU-10, CU-11 y CU-20. Gestiona usuarios, editores y administradores. |
| **Servicio** | id, nombre, dirección, teléfono, email, logo, categoría, lugarAsociado, activo | obtenerServiciosPorCategoria(), asociarLugar(), calcularPromedioRating() | Surge de CU-05, CU-06 y CU-17. Directorio de hoteles, restaurantes, artesanos, guías y transporte. |
| **Evento** | id, título, descripción, ubicación, fechaInicio, fechaFin, destacado, próximo, creadoPor | listarPróximos(), estáDestacado() | Surge de CU-15. Publica las fiestas y ferias del municipio. |
| **ActividadCultural** | id, título, descripción, fecha, categoría, recurrente, activo, creadoPor | listarActivas(), esAnual(), filtrarPorCategoría() | Surge de CU-07 y CU-16. Alimenta el calendario de fechas importantes. |
| **Configuración** | id, clave, valor | obtenerValor(), actualizarValor() | Surge de CU-21 y CU-23. Guarda nombre del sitio, contactos, redes y logo. |
| **Reporte** | período, totalSitios, totalUsuarios, totalEventos, totalReseñas, visitasMensuales | generarResumen(), calcularTotales() | Surge de CU-22. Agrega las estadísticas del sistema. |

---

## Actividad 5. Dibuja tu diagrama de clases

**Indicaciones para Draw.io:**

1. Usa el elemento **Class** del panel *Software*, o dibuja una caja con tres compartimentos: **nombre**, **atributos** y **métodos**.
2. Dibuja las clases y completa atributos y métodos según la Actividad 4.2 (colección de clases del sistema).
3. Une las clases con las relaciones y multiplicidades indicadas a continuación:

| Relación | Clase A | Clase B | Multiplicidad | Tipo |
|---|---|---|---|---|
| 1 categoría clasifica muchos lugares | Categoría | Lugar | 1 ─── 0..* | Asociación |
| 1 lugar tiene muchas imágenes | Lugar | Imagen | 1 ─── 0..* | Composición (si Place se elimina, se eliminan sus imágenes) |
| 1 lugar recibe muchas reseñas | Lugar | Reseña | 1 ─── 0..* | Agregación |
| 1 usuario publica muchas reseñas | Usuario | Reseña | 1 ─── 0..* | Asociación |
| 1 usuario crea muchos lugares | Usuario | Lugar | 1 ─── 0..* | Asociación |
| 1 usuario (editor/admin) crea muchos eventos | Usuario | Evento | 1 ─── 0..* | Asociación |
| 1 usuario crea muchas actividades | Usuario | ActividadCultural | 1 ─── 0..* | Asociación |
| 1 servicio se asocia a 0 o 1 lugar | Servicio | Lugar | 0..1 ─── 1..* | Asociación |
| 1 lugar se asocia a varios servicios | Lugar | Servicio | 1 ─── 0..* | Asociación |
| El sistema guarda muchas configuraciones | Sistema | Configuración | 1 ─── 0..* | Asociación |
| 1 admin genera reportes del sistema | Administrador (Usuario) | Reporte | 1 ─── 0..* | Dependencia («usa») |

4. Nota sobre roles y reportes:
   - **Usuario** —1..*→ con herencia tipográfica de rol (admin/editor/user) puede representarse con una jerarquía de herencia **«editor» y «administrador»** que extienden de Usuario (opcional para el diagrama).
   - **Reporte** depende de las clases Lugar, Usuario, Evento y Reseña (las consulta para calcular totales).
5. Exporta (File → Export as → PNG) y adjunta la captura en tu documento.

**Verificación del diagrama de clases:**
- Todas las clases provienen de al menos un caso de uso (ver columna *Justificación* de la Actividad 4.2).
- Las multiplicidades cubren las cardinalidades reales entre tablas (1 categoría → muchos lugares, 1 lugar → muchas imágenes, 1 usuario → muchas reseñas, etc.).
- Las clases se corresponden con las tablas de la base de datos: `users`, `categories`, `places`, `place_images`, `reviews`, `events`, `important_dates`, `services`, `settings`.

---