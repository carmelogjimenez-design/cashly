# Cashly — Fase 0 (Fundación)

App de salud financiera. **Entiende tu dinero. Mejora tu futuro.**

Esta primera versión (esqueleto) incluye:

- Splash de bienvenida con la marca Cashly.
- Registro e inicio de sesión con **Supabase Auth** (correo + contraseña).
- Protección de rutas por middleware (si no hay sesión, te manda a login).
- Shell de la app con navegación inferior: Inicio · Movimientos · Presupuesto · Objetivos · Perfil.
- Dashboard con saludo personalizado y adelanto de las secciones que llegan.

Stack: **Next.js 15 + TypeScript + Supabase + Tailwind**, desplegado en **Vercel**.

---

## Puesta en marcha (todo por web, sin instalar nada en tu ordenador)

### 1. Crear el proyecto en Supabase

1. Entra en https://supabase.com → **New project**.
2. Ponle nombre (p. ej. `cashly`) y guarda la contraseña de la base de datos.
3. Cuando esté listo, ve a **Project Settings → API** y copia:
   - **Project URL** → será `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → será `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Subir el código a GitHub

1. Crea un repositorio nuevo en https://github.com/new llamado **`cashly`**.
2. Descomprime el ZIP en tu ordenador.
3. En la página del repo, pulsa **Add file → Upload files**.
4. **Arrastra el CONTENIDO de la carpeta `cashly`** (es decir: `package.json`, la carpeta `src`, `tailwind.config.ts`, etc.), **NO la carpeta `cashly` entera**. Los archivos deben quedar en la raíz del repo, no dentro de otra carpeta.
5. Commit (botón verde **Commit changes**).

> ⚠️ Recordatorio de siempre: en GitHub por web, arrastrar carpetas **reemplaza** el contenido en vez de fusionarlo. En esta primera subida no importa (el repo está vacío), pero tenlo presente para las próximas fases.

### 3. Desplegar en Vercel

1. Entra en https://vercel.com → **Add New → Project** → importa el repo `cashly`.
2. Antes de pulsar Deploy, abre **Environment Variables** y añade las dos:
   - `NEXT_PUBLIC_SUPABASE_URL` = tu Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = tu anon public key
3. Pulsa **Deploy**. En 1–2 minutos tendrás tu URL (algo como `cashly.vercel.app`).

### 4. Configurar las URLs de autenticación en Supabase

Para que el registro y la confirmación por correo funcionen:

1. En Supabase, ve a **Authentication → URL Configuration**.
2. **Site URL**: pon tu dominio de Vercel, p. ej. `https://cashly.vercel.app`.
3. **Redirect URLs**: añade `https://cashly.vercel.app/auth/callback`.

> Para probar rápido sin esperar correos: en **Authentication → Providers → Email**, puedes desactivar temporalmente **"Confirm email"**. Así el registro entra directo al dashboard. Vuelve a activarlo antes de tener usuarios reales.

---

## Variables de entorno

Ver `.env.example`. Las mismas dos variables van en Vercel (paso 3).

---

## Estructura del proyecto

```
src/
  middleware.ts            Refresca sesión y protege rutas
  app/
    layout.tsx             Layout raíz (fuentes + marca)
    globals.css            Estilos y componentes de marca
    page.tsx               Splash / bienvenida
    login/                 Iniciar sesión
    registro/              Crear cuenta
    auth/callback/         Confirmación de correo
    dashboard/             Inicio (privado)
    movimientos/           (placeholder, Fase 2)
    presupuesto/           (placeholder, Fase 2)
    objetivos/             (placeholder, Fase 3)
    perfil/                Datos de cuenta + cerrar sesión
  components/
    AppShell.tsx           Contenedor + navegación inferior
    Logo.tsx  BottomNav.tsx  Placeholder.tsx
  lib/supabase/
    client.ts  server.ts  middleware.ts
```

> Las pestañas privadas (dashboard, movimientos, etc.) se envuelven en
> `<AppShell>` para compartir la navegación inferior. La sesión se protege
> en el middleware. Estructura plana a propósito: sin carpetas con paréntesis
> ni anidamientos raros que se pierdan al subir por web.

---

## Siguiente fase

**Fase 1 — Datos + Dashboard:** esquema de tablas en Supabase, datos demo del
perfil ficticio del brief y el dashboard real con la puntuación de salud
financiera (0–100) y el resumen del mes.

---

_Cashly ofrece información, educación y simulaciones basadas en los datos
proporcionados. No garantiza resultados ni sustituye el asesoramiento
financiero, fiscal o legal profesional._
