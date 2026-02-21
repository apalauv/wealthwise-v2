# WealthWise v2 🏦

Plataforma moderna para monitorear tu patrimonio, rastrear inversiones y alcanzar tus metas financieras.

![WealthWise](https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop)

## ✨ Características

- 📊 **Dashboard** - Resumen completo de tu patrimonio con gráficos interactivos
- 💰 **Gestión de Activos** - Caja Fuerte, Criptomonedas, DeFi, ETFs, Fondos, Venture Capital, Inmuebles
- 📈 **Evolución** - Gráficos históricos del patrimonio
- ✅ **Tareas** - Sistema de gestión de tareas financieras
- 🎯 **Metas** - Define y rastrea tus objetivos financieros
- 🐋 **Whale Tracking** - Monitorea wallets de grandes inversores
- 🤖 **AI Insights** - Análisis inteligente de tu portfolio con IA
- 💱 **Precios en tiempo real** - Integración con CoinGecko para criptomonedas

## 🚀 Inicio Rápido

### Requisitos
- Node.js 18+
- Bun o npm

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/TU_USUARIO/wealthwise-v2.git
cd wealthwise-v2

# Instalar dependencias
bun install

# Configurar variables de entorno
cp .env.example .env

# Inicializar base de datos
bun run db:push

# Iniciar servidor de desarrollo
bun run dev
```

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 16 con App Router
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS 4 + shadcn/ui
- **Base de datos**: Prisma ORM (SQLite/PostgreSQL)
- **Estado**: Zustand
- **Gráficos**: Recharts
- **Iconos**: Lucide React
- **IA**: z-ai-web-dev-sdk

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── api/           # API Routes
│   │   ├── assets/    # CRUD de activos
│   │   ├── tasks/     # CRUD de tareas
│   │   ├── goals/     # CRUD de metas
│   │   ├── snapshots/ # Cierres mensuales
│   │   └── ...
│   ├── page.tsx       # Página principal
│   └── layout.tsx     # Layout global
├── components/
│   └── ui/            # Componentes shadcn/ui
├── store/             # Estado global (Zustand)
└── lib/               # Utilidades
```

## 🗄️ Base de Datos

### SQLite (Desarrollo local)
Por defecto usa SQLite para desarrollo local.

### Supabase/PostgreSQL (Producción)
1. Crea un proyecto en [Supabase](https://supabase.com)
2. Copia la connection string desde Settings → Database
3. Actualiza `DATABASE_URL` en tu `.env`
4. Ejecuta `bun run db:push`

## 📦 Despliegue

### Vercel (Recomendado)
1. Conecta tu repositorio de GitHub a Vercel
2. Configura las variables de entorno
3. Despliega automáticamente

## 📝 Scripts

```bash
bun run dev      # Servidor de desarrollo
bun run build    # Build de producción
bun run lint     # Linting
bun run db:push  # Sincronizar base de datos
```

## 📄 Licencia

MIT

---

Desarrollado con ❤️ usando Next.js y Prisma
