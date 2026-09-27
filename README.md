# Sistema de Turismo de Quillacollo

Plataforma web de turismo del Gobierno Autónomo Municipal de Quillacollo.
**Frontend:** React 19 + Vite + Tailwind · **Backend:** Express + MySQL (MariaDB XAMPP)

---

## 📋 Requisitos previos

| Componente  | Detalle                                    |
|-------------|--------------------------------------------|
| Node.js     | Con npm (necesario para backend y frontend)|
| XAMPP       | Con **MariaDB/MySQL** activo               |
| Navegador   | Chrome / Edge / Firefox                    |

> ⚠️ **Importante:** MySQL debes iniciarlo manualmente. En este equipo **no existe**
> un servicio de Windows para MySQL; se lanza desde XAMPP o manualmente.

---

## 🚀 Forma rápida (recomendada)

En la carpeta del proyecto hay **dos archivos** que puedes hacer doble clic:

- **`iniciar-sistema.bat`** → inicia todo automáticamente (BD, backend y frontend)
- **`detener-sistema.bat`** → detiene backend y frontend

Después de ejecutar `iniciar-sistema.bat`, abre en tu navegador:

```
http://localhost:5173
```

---

## 🧑‍💻 Forma manual (paso a paso)

Abre **4 terminales** y ejecuta:

### 1) Iniciar la base de datos (MariaDB)
```cmd
C:\xampp\mysql\bin\mysqld.exe --defaults-file=C:\xampp\mysql\bin\my.ini
```
> Alternativa: abre **XAMPP Control Panel** y pulsa **Start** en MySQL.

### 2) Iniciar el backend (puerto 5000)
```cmd
cd C:\Users\kevin\OneDrive\Desktop\turismo-quillacollo\backend
npm install   (solo la primera vez)
npm start
```

### 3) Iniciar el frontend (puerto 5173)
```cmd
cd C:\Users\kevin\OneDrive\Desktop\turismo-quillacollo\frontend
npm install   (solo la primera vez)
npm run dev
```

### 4) Abrir la aplicación
```
http://localhost:5173
```

---

## 🔗 URLs de la aplicación

| Servicio          | URL                            | Descripción                 |
|-------------------|--------------------------------|-----------------------------|
| **Frontend**      | http://localhost:5173          | Página principal / mapa     |
| **Backend API**   | http://localhost:5000          | API REST                    |
| **Health check**  | http://localhost:5000/api/health | Estado del servidor       |
| **Imágenes**      | http://localhost:5000/uploads/... | Archivos subidos/local   |

### Acceso administrador
- **URL:** http://localhost:5173/login  (o el botón de entrar)
- **Usuario:** `admin@quillacollo.gob`
- **Contraseña:** `Admin123!`

### Acceso editor (contenido)
- **URL:** http://localhost:5173/login
- **Usuario:** `editor@quillacollo.gob`
- **Contraseña:** `Editor123!`

### Funciones por rol
| Rol    | Gestión de contenido (sitios, eventos, activ. culturales, galería, servicios) | Usuarios | Reportes | Configuración |
|--------|:---:|:---:|:---:|:---:|
| **Admin** | ✅ | ✅ | ✅ | ✅ |
| **Editor** | ✅ | ❌ | ❌ | ❌ |

- **Admin**: control total (contenido + usuarios + reportes + configuración).
- **Editor**: solo crea/edita/elimina contenido turístico; no puede crear usuarios, ver reportes ni cambiar configuración.
- Para crear un nuevo editor: `admin` → Dashboard → **Usuarios** → Nuevo usuario → rol **Editor**.

---

## 📂 Estructura del proyecto

```
turismo-quillacollo/
├── backend/                 # API Express + MySQL
│   ├── src/
│   │   ├── index.js         # Punto de entrada (monta rutas públicas y admin)
│   │   ├── config/db.js     # Conexión a MySQL (usa variables .env)
│   │   ├── routes/          # auth, admin, importantDates, reviews, uploads
│   │   ├── controllers/     # auth, admin, uploads
│   │   └── middlewares/     # autenticación y autorización
│   ├── uploads/             # Imágenes locales (places, services, activities, logos)
│   ├── db-init.sql          # Esquema de base de datos
│   └── .env                 # Puerto 5000 + credenciales de BD
└── frontend/                # React + Vite + Tailwind
    ├── src/
    │   ├── pages/           # Home, PlaceDetail, Services, admin/*, etc.
    │   ├── components/      # Hero, Calendar (Actividades Culturales), Navbar, AdminLayout...
    │   └── api/axios.js     # Conexión axios + getImageUrl()
    └── package.json
```

---

## 🗄️ Base de datos (`turismo_quillacollo`)

Tablas principales: `users`, `categories`, `places`, `place_images`, `services`,
`events`, `important_dates`, `reviews`, `settings`.

- Motor/servidor: **MariaDB 10.4** de XAMPP en `localhost:3306`
- Usuario: `root` · Contraseña: (vacía, sin password)
- Configuración en `backend/.env`

Si necesitas reconstruir la BD desde cero usa `backend/db-init.sql`.

---

## 🖼️ Sobre las imágenes

Todas las imágenes (lugares, servicios, actividades culturales, logo y la imagen
de la **Virgen de Urkupiña**) se guardan **localmente** en `backend/uploads/` y se
sirven desde el propio backend (`http://localhost:5000/uploads/...`).

No dependen de servicios externos, así que cargan siempre.

> Nota técnica: se desactivaron las cabeceras `Cross-Origin-Resource-Policy` del
> helmet para que el navegador pueda cargar las imágenes cross-origin desde el
> frontend (puerto 5173) hacia el backend (puerto 5000).

---

## 🛠️ Comandos útiles

```bash
# Verificar que el backend responde
curl http://localhost:5000/api/health

# Verificar que el frontend responde
curl http://localhost:5173

# Compilar el frontend en producción
cd frontend && npm run build
```

---

## ❓ Solución de problemas

| Problema                          | Solución                                                   |
|-----------------------------------|------------------------------------------------------------|
| "ECONNREFUSED localhost:3306"     | Falta iniciar MariaDB (paso 1)                             |
| "EADDRINUSE :5000"                | Otro proceso usa el puerto; usa `detener-sistema.bat`      |
| Las imágenes no se ven            | Haz **Ctrl+Shift+R** (recarga fuerte) para limpiar caché   |
| No carga la página en 5173        | Verifica que `npm run dev` esté corriendo en `/frontend`   |
| El login falla                    | Usa `admin@quillacollo.gob` / `Admin123!`                  |

---
```
