# 📚 Documentación Técnica - Winner Organa

## Índice
1. [Arquitectura del Sistema](#1-arquitectura-del-sistema)
2. [Documentación de la API](#2-documentación-de-la-api)
3. [Documentación del Código](#3-documentación-del-código)
4. [Diccionario de Datos](#4-diccionario-de-datos)

---

## 1. Arquitectura del Sistema

### 1.1 Visión General

Winner Organa es una plataforma de comercio electrónico con sistema de afiliados multinivel. La arquitectura sigue un patrón **JAMstack** con React en el frontend y Supabase como Backend-as-a-Service (BaaS).

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENTE (Browser)                        │
├─────────────────────────────────────────────────────────────┤
│  React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────┐   │
│  │ Zustand │ │TanStack │ │ React   │ │ React Hook Form │   │
│  │ (State) │ │ Query   │ │ Router  │ │ + Zod           │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   LOVABLE CLOUD (Backend)                    │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐    │
│  │   Auth       │ │   Database   │ │  Edge Functions  │    │
│  │   (JWT)      │ │  (PostgreSQL)│ │    (Deno)        │    │
│  └──────────────┘ └──────────────┘ └──────────────────┘    │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐    │
│  │   Storage    │ │   Realtime   │ │   Row Level      │    │
│  │   (S3)       │ │  (WebSocket) │ │   Security       │    │
│  └──────────────┘ └──────────────┘ └──────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Stack Tecnológico

| Capa | Tecnología | Versión | Propósito |
|------|------------|---------|-----------|
| **Frontend** | React | 18.3.1 | Biblioteca UI |
| **Bundler** | Vite | Latest | Build tool y dev server |
| **Lenguaje** | TypeScript | Latest | Tipado estático |
| **Estilos** | Tailwind CSS | Latest | Utility-first CSS |
| **Componentes** | shadcn/ui | Latest | Componentes accesibles |
| **Estado Global** | Zustand | 5.0.8 | Gestión de estado |
| **Data Fetching** | TanStack Query | 5.83.0 | Cache y sincronización |
| **Routing** | React Router | 6.30.1 | Navegación SPA |
| **Formularios** | React Hook Form | 7.61.1 | Gestión de formularios |
| **Validación** | Zod | 3.25.76 | Validación de esquemas |
| **Backend** | Lovable Cloud | Latest | BaaS (PostgreSQL) |
| **Autenticación** | Lovable Cloud Auth | Latest | JWT + Session |

### 1.3 Estructura de Directorios

```
winner-organa/
├── public/                    # Archivos estáticos
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
├── src/
│   ├── assets/               # Imágenes y recursos
│   │   ├── affiliate-hero-bg.jpg
│   │   ├── hero-bg.jpg
│   │   ├── quinoa-protein.jpg
│   │   └── ...
│   ├── components/           # Componentes React
│   │   ├── admin/           # Componentes del admin
│   │   │   ├── AffiliateDialog.tsx
│   │   │   ├── CreditsManagement.tsx
│   │   │   ├── DeleteConfirmDialog.tsx
│   │   │   ├── OrderStatusDialog.tsx
│   │   │   ├── ProductDialog.tsx
│   │   │   ├── ReportsSection.tsx
│   │   │   └── SettingsDialog.tsx
│   │   ├── ui/              # Componentes shadcn/ui
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ... (40+ componentes)
│   │   ├── BuyWinnerPointsBanner.tsx
│   │   ├── CartDrawer.tsx
│   │   ├── CTASection.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── OriginSection.tsx
│   │   ├── ProductsSection.tsx
│   │   └── WinnerPointsDisplay.tsx
│   ├── hooks/               # Custom hooks
│   │   ├── use-mobile.tsx
│   │   ├── use-toast.ts
│   │   ├── useCart.tsx
│   │   └── useUserCredits.tsx
│   ├── integrations/        # Integraciones externas
│   │   └── supabase/
│   │       ├── client.ts    # Cliente Supabase (auto-generado)
│   │       └── types.ts     # Tipos TypeScript (auto-generado)
│   ├── lib/                 # Utilidades
│   │   └── utils.ts         # Helpers (cn, etc.)
│   ├── pages/               # Páginas/Rutas
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminLogin.tsx
│   │   ├── AreaAfiliado.tsx
│   │   ├── Catalogo.tsx
│   │   ├── Checkout.tsx
│   │   ├── Contacto.tsx
│   │   ├── Index.tsx
│   │   ├── LoginAfiliado.tsx
│   │   ├── MiBilletera.tsx
│   │   ├── NotFound.tsx
│   │   ├── ProgramaAfiliados.tsx
│   │   └── RegistroAfiliado.tsx
│   ├── App.css              # Estilos globales
│   ├── App.tsx              # Componente raíz
│   ├── index.css            # Variables CSS / Design tokens
│   ├── main.tsx             # Entry point
│   └── vite-env.d.ts        # Tipos de Vite
├── supabase/
│   └── config.toml          # Configuración Supabase
├── .env                      # Variables de entorno
├── index.html               # HTML template
├── package.json             # Dependencias
├── tailwind.config.ts       # Configuración Tailwind
├── tsconfig.json            # Configuración TypeScript
└── vite.config.ts           # Configuración Vite
```

### 1.4 Flujo de Autenticación

```
┌──────────┐     ┌──────────────┐     ┌─────────────────┐
│  Usuario │────▶│ LoginAfiliado│────▶│  Supabase Auth  │
└──────────┘     │ /AdminLogin  │     │  signInWithPass │
                 └──────────────┘     └─────────────────┘
                                              │
                        ┌─────────────────────┼─────────────────────┐
                        ▼                     ▼                     ▼
                 ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
                 │   JWT Token │       │   Session   │       │  user_roles │
                 │   (Bearer)  │       │  (Cookie)   │       │   (check)   │
                 └─────────────┘       └─────────────┘       └─────────────┘
                        │                     │                     │
                        └─────────────────────┼─────────────────────┘
                                              ▼
                                    ┌─────────────────┐
                                    │  RLS Policies   │
                                    │  (PostgreSQL)   │
                                    └─────────────────┘
```

### 1.5 Sistema de Roles (RBAC)

```typescript
// Roles disponibles
type AppRole = 'admin';

// Verificación de rol
const hasRole = (userId: uuid, role: AppRole): boolean => {
  // Función SQL que verifica en user_roles
};
```

**Permisos por rol:**

| Recurso | Usuario Anónimo | Usuario Autenticado | Afiliado | Admin |
|---------|-----------------|---------------------|----------|-------|
| Ver productos | ✅ | ✅ | ✅ | ✅ |
| Crear pedidos | ✅ | ✅ | ✅ | ✅ |
| Ver propios créditos | ❌ | ✅ | ✅ | ✅ |
| Ver propias comisiones | ❌ | ❌ | ✅ | ✅ |
| Ver todos los usuarios | ❌ | ❌ | ❌ | ✅ |
| Gestionar productos | ❌ | ❌ | ❌ | ✅ |
| Gestionar afiliados | ❌ | ❌ | ❌ | ✅ |
| Ver reportes | ❌ | ❌ | ❌ | ✅ |

---

## 2. Documentación de la API

### 2.1 Endpoints REST (Auto-generados por Supabase)

Base URL: `https://szjxezvhhhayyywrjbjm.supabase.co/rest/v1`

#### Productos

```http
# Listar todos los productos
GET /products
Headers:
  apikey: <SUPABASE_ANON_KEY>
  Authorization: Bearer <JWT_TOKEN>

Response 200:
[
  {
    "id": "uuid",
    "name": "string",
    "description": "string | null",
    "price": "number",
    "stock": "number",
    "image_url": "string | null",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
]

# Crear producto (solo admin)
POST /products
Headers:
  apikey: <SUPABASE_ANON_KEY>
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json
  Prefer: return=representation

Body:
{
  "name": "Quinoa Protein",
  "description": "Proteína vegetal premium",
  "price": 450,
  "stock": 100,
  "image_url": "https://..."
}

Response 201:
{
  "id": "uuid-generado",
  "name": "Quinoa Protein",
  ...
}

# Actualizar producto (solo admin)
PATCH /products?id=eq.<uuid>
Headers:
  apikey: <SUPABASE_ANON_KEY>
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json

Body:
{
  "price": 500,
  "stock": 80
}

Response 200: OK

# Eliminar producto (solo admin)
DELETE /products?id=eq.<uuid>
Headers:
  apikey: <SUPABASE_ANON_KEY>
  Authorization: Bearer <JWT_TOKEN>

Response 204: No Content
```

#### Pedidos

```http
# Crear pedido
POST /orders
Headers:
  apikey: <SUPABASE_ANON_KEY>
  Content-Type: application/json
  Prefer: return=representation

Body:
{
  "order_number": "ORD-20241219-ABC123",
  "customer_name": "Juan Pérez",
  "customer_email": "juan@email.com",
  "product_name": "Quinoa Protein x2",
  "product_id": "uuid-producto",
  "amount": 900,
  "status": "Pendiente"
}

Response 201:
{
  "id": "uuid-pedido",
  "order_number": "ORD-20241219-ABC123",
  ...
}

# Listar pedidos (solo admin)
GET /orders?order=created_at.desc
Headers:
  apikey: <SUPABASE_ANON_KEY>
  Authorization: Bearer <JWT_TOKEN>

Response 200: Array<Order>

# Actualizar estado de pedido (solo admin)
PATCH /orders?id=eq.<uuid>
Body:
{
  "status": "Enviado"
}
```

#### Afiliados

```http
# Registrar afiliado
POST /affiliates
Headers:
  apikey: <SUPABASE_ANON_KEY>
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json

Body:
{
  "user_id": "uuid-auth-user",
  "name": "María García",
  "email": "maria@email.com",
  "affiliate_code": "MARIA2024",
  "yape_number": "999888777",
  "referred_by": "uuid-referidor | null"
}

# Obtener afiliado actual
GET /affiliates?user_id=eq.<auth.uid()>
Headers:
  apikey: <SUPABASE_ANON_KEY>
  Authorization: Bearer <JWT_TOKEN>

# Listar todos los afiliados (solo admin)
GET /affiliates?order=created_at.desc
Headers:
  apikey: <SUPABASE_ANON_KEY>
  Authorization: Bearer <JWT_TOKEN>
```

### 2.2 Funciones de Base de Datos (RPC)

#### `add_user_credits`
Añade WinnerPoints a un usuario (solo admin).

```typescript
const { data, error } = await supabase.rpc('add_user_credits', {
  p_email: 'usuario@email.com',
  p_amount: 1000,
  p_description: 'Bono de bienvenida'
});

// Response
{
  success: true,
  new_balance: 1000,
  email: 'usuario@email.com'
}
// o
{
  success: false,
  error: 'Usuario no encontrado con ese email'
}
```

#### `use_credits_for_purchase`
Usa WinnerPoints para una compra.

```typescript
const { data, error } = await supabase.rpc('use_credits_for_purchase', {
  p_amount: 500,
  p_order_id: 'uuid-del-pedido'
});

// Response
{
  success: true,
  new_balance: 500
}
// o
{
  success: false,
  error: 'Saldo insuficiente',
  balance: 300
}
```

#### `create_order_commissions`
Crea comisiones multinivel para un pedido con código de afiliado.

```typescript
const { error } = await supabase.rpc('create_order_commissions', {
  p_order_id: 'uuid-del-pedido',
  p_order_amount: 1000,
  p_affiliate_code: 'MARIA2024'
});

// Crea automáticamente:
// - Nivel 1: 10% para el afiliado directo
// - Nivel 2: 5% para quien refirió al afiliado
// - Nivel 3: 2% para el tercer nivel
```

#### `has_role`
Verifica si un usuario tiene un rol específico.

```typescript
const { data } = await supabase.rpc('has_role', {
  _user_id: 'uuid-usuario',
  _role: 'admin'
});

// Response: boolean
```

### 2.3 Autenticación (Supabase Auth)

```typescript
import { supabase } from '@/integrations/supabase/client';

// Registro
const { data, error } = await supabase.auth.signUp({
  email: 'user@email.com',
  password: 'securePassword123',
  options: {
    data: {
      name: 'Nombre Usuario'
    }
  }
});

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@email.com',
  password: 'securePassword123'
});

// Logout
await supabase.auth.signOut();

// Obtener sesión actual
const { data: { session } } = await supabase.auth.getSession();

// Escuchar cambios de auth
supabase.auth.onAuthStateChange((event, session) => {
  console.log(event, session);
});
```

---

## 3. Documentación del Código

### 3.1 Hooks Personalizados

#### `useCart` (Zustand Store)

```typescript
// src/hooks/useCart.tsx
interface CartItem {
  id: string;
  name: string;
  price: number;      // En WinnerPoints
  quantity: number;
  image_url?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;  // Retorna total en WinnerPoints
}

// Uso
const { items, addItem, removeItem, getTotalPrice } = useCart();

// Persistencia automática en localStorage con key 'cart-storage'
```

#### `useUserCredits`

```typescript
// src/hooks/useUserCredits.tsx
interface UseUserCreditsReturn {
  credits: UserCredits | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  balance: number;           // Balance en WinnerPoints
  balanceInSoles: number;    // Balance convertido a Soles (WP / 10)
  convertToSoles: (wp: number) => number;
  convertToWinnerPoints: (soles: number) => number;
  refetch: () => Promise<void>;
}

// Uso
const { balance, isAuthenticated, refetch } = useUserCredits();
```

#### `useToast`

```typescript
// src/hooks/use-toast.ts
const { toast } = useToast();

// Uso
toast({
  title: "Éxito",
  description: "Producto añadido al carrito",
  variant: "default" // | "destructive"
});
```

### 3.2 Páginas Principales

#### `Index.tsx` - Página de inicio
- **Componentes**: Hero, FeaturesSection, ProductsSection, OriginSection, CTASection
- **Funcionalidad**: Landing page con secciones animadas

#### `Catalogo.tsx` - Catálogo de productos
- **Query**: `useQuery` para obtener productos de Supabase
- **Filtros**: Búsqueda por nombre, ordenamiento por precio/nombre
- **Integración**: Añadir al carrito con `useCart`

#### `Checkout.tsx` - Proceso de compra
- **Validación**: React Hook Form + Zod
- **Pagos**: WinnerPoints o WhatsApp
- **Comisiones**: Aplica código de afiliado si existe

#### `MiBilletera.tsx` - Billetera del usuario
- **Autenticación requerida**: Redirecciona si no hay sesión
- **Muestra**: Balance de WinnerPoints, historial de transacciones
- **Acciones**: Comprar más WinnerPoints vía WhatsApp

#### `AdminDashboard.tsx` - Panel de administración
- **Autenticación**: Requiere rol 'admin'
- **Tabs**: Productos, Pedidos, Afiliados, Créditos, Reportes, Configuración
- **CRUD completo**: Para todas las entidades

### 3.3 Componentes Reutilizables

#### `WinnerPointsDisplay`
Muestra el balance de WinnerPoints del usuario autenticado.

```tsx
<WinnerPointsDisplay />
// Renderiza: icono + balance actual
```

#### `CartDrawer`
Drawer lateral con el carrito de compras.

```tsx
<CartDrawer />
// Muestra items, totales y botón de checkout
```

#### `BuyWinnerPointsBanner`
Banner para comprar WinnerPoints.

```tsx
<BuyWinnerPointsBanner variant="card" />   // Card completo
<BuyWinnerPointsBanner variant="inline" /> // Línea horizontal
<BuyWinnerPointsBanner variant="compact" /> // Versión mínima
```

### 3.4 Sistema de Diseño

#### Variables CSS (index.css)

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --primary: 142 76% 36%;      /* Verde Winner */
  --primary-foreground: 0 0% 100%;
  --secondary: 210 40% 96.1%;
  --accent: 142 76% 36%;
  --muted: 210 40% 96.1%;
  --destructive: 0 84.2% 60.2%;
  --border: 214.3 31.8% 91.4%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

#### Configuración Tailwind (tailwind.config.ts)

```typescript
// Colores semánticos mapeados a variables CSS
colors: {
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  primary: {
    DEFAULT: "hsl(var(--primary))",
    foreground: "hsl(var(--primary-foreground))",
  },
  // ...
}
```

---

## 4. Diccionario de Datos

### 4.1 Diagrama Entidad-Relación

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   auth.users    │       │   user_roles    │       │  user_credits   │
│─────────────────│       │─────────────────│       │─────────────────│
│ id (PK)         │◄──────│ user_id (FK)    │       │ id (PK)         │
│ email           │       │ role            │       │ user_id (FK)────│───┐
│ encrypted_pass  │       │ created_at      │       │ email           │   │
│ created_at      │       └─────────────────┘       │ balance         │   │
│ ...             │                                 │ created_at      │   │
└────────┬────────┘                                 └────────┬────────┘   │
         │                                                   │            │
         │                                                   │            │
         │         ┌─────────────────────────────────────────┘            │
         │         │                                                      │
         │         ▼                                                      │
         │  ┌─────────────────┐                                          │
         │  │credit_transactions                                         │
         │  │─────────────────│                                          │
         │  │ id (PK)         │                                          │
         │  │ user_credit_id  │◄─────────────────────────────────────────┘
         │  │ amount          │
         │  │ type            │
         │  │ description     │
         │  │ admin_id        │
         │  │ order_id        │──────────────────┐
         │  │ created_at      │                  │
         │  └─────────────────┘                  │
         │                                       │
         ▼                                       ▼
┌─────────────────┐       ┌─────────────────┐   ┌─────────────────┐
│   affiliates    │       │   commissions   │   │     orders      │
│─────────────────│       │─────────────────│   │─────────────────│
│ id (PK)         │◄──────│ affiliate_id    │   │ id (PK)         │
│ user_id (FK)    │       │ order_id ───────│──▶│ order_number    │
│ name            │       │ amount          │   │ customer_name   │
│ email           │       │ level           │   │ customer_email  │
│ affiliate_code  │       │ status          │   │ product_name    │
│ yape_number     │       │ created_at      │   │ product_id      │──┐
│ referred_by     │──┐    └─────────────────┘   │ amount          │  │
│ level           │  │                          │ status          │  │
│ status          │  │                          │ created_at      │  │
│ total_sales     │  │                          └─────────────────┘  │
│ total_commissions│  │                                              │
│ commission_rate │  │    ┌─────────────────┐                       │
│ referral_count  │  │    │    products     │                       │
│ created_at      │  │    │─────────────────│                       │
└────────┬────────┘  │    │ id (PK)         │◄──────────────────────┘
         │           │    │ name            │
         │           │    │ description     │
         ▼           │    │ price           │  (en WinnerPoints)
┌─────────────────┐  │    │ stock           │
│    referrals    │  │    │ image_url       │
│─────────────────│  │    │ created_at      │
│ id (PK)         │  │    └─────────────────┘
│ referrer_id     │◄─┘
│ referred_id     │       ┌─────────────────┐
│ level           │       │business_settings│
│ created_at      │       │─────────────────│
└─────────────────┘       │ id (PK)         │
                          │ business_name   │
┌─────────────────┐       │ commission_lvl_1│
│contact_messages │       │ commission_lvl_2│
│─────────────────│       │ commission_lvl_3│
│ id (PK)         │       │ whatsapp_number │
│ nombre          │       │ contact_email   │
│ email           │       │ notify_settings │
│ whatsapp        │       │ created_at      │
│ mensaje         │       └─────────────────┘
│ status          │
│ created_at      │
└─────────────────┘
```

### 4.2 Descripción de Tablas

#### `products` - Catálogo de productos

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| `id` | uuid | No | `gen_random_uuid()` | Identificador único |
| `name` | text | No | - | Nombre del producto |
| `description` | text | Sí | null | Descripción detallada |
| `price` | numeric | No | - | Precio en WinnerPoints |
| `stock` | integer | Sí | 0 | Cantidad disponible |
| `image_url` | text | Sí | null | URL de la imagen |
| `created_at` | timestamptz | Sí | `now()` | Fecha de creación |
| `updated_at` | timestamptz | Sí | `now()` | Última actualización |

**RLS Policies:**
- `Anyone can view products` - SELECT: `true`
- `Admins can manage products` - ALL: `has_role(auth.uid(), 'admin')`

---

#### `orders` - Pedidos

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| `id` | uuid | No | `gen_random_uuid()` | Identificador único |
| `order_number` | text | No | - | Número de orden (ORD-YYYYMMDD-XXXXX) |
| `customer_name` | text | No | - | Nombre del cliente |
| `customer_email` | text | No | - | Email del cliente |
| `product_name` | text | No | - | Descripción de productos |
| `product_id` | uuid | Sí | null | ID del producto principal |
| `amount` | numeric | No | - | Monto total en WinnerPoints |
| `status` | text | Sí | 'Pendiente' | Estado: Pendiente/Confirmado/Enviado/Entregado/Cancelado |
| `created_at` | timestamptz | Sí | `now()` | Fecha de creación |
| `updated_at` | timestamptz | Sí | `now()` | Última actualización |

**RLS Policies:**
- `Anyone can create orders` - INSERT: `true`
- `Admins can view all orders` - SELECT: `has_role(auth.uid(), 'admin')`
- `Admins can manage orders` - ALL: `has_role(auth.uid(), 'admin')`

---

#### `affiliates` - Afiliados

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| `id` | uuid | No | `gen_random_uuid()` | Identificador único |
| `user_id` | uuid | Sí | null | ID del usuario en auth.users |
| `name` | text | No | - | Nombre completo |
| `email` | text | No | - | Email del afiliado |
| `affiliate_code` | text | No | - | Código único de afiliado |
| `yape_number` | text | Sí | null | Número Yape para pagos |
| `referred_by` | uuid | Sí | null | ID del afiliado que lo refirió |
| `level` | text | Sí | 'Bronce' | Nivel: Bronce/Plata/Oro/Platino |
| `status` | text | Sí | 'Activo' | Estado: Activo/Inactivo |
| `total_sales` | numeric | Sí | 0 | Ventas totales generadas |
| `total_commissions` | numeric | Sí | 0 | Comisiones totales ganadas |
| `commission_rate` | numeric | Sí | 10 | Tasa de comisión (%) |
| `referral_count` | integer | Sí | 0 | Número de referidos directos |
| `created_at` | timestamptz | Sí | `now()` | Fecha de registro |
| `updated_at` | timestamptz | Sí | `now()` | Última actualización |

**RLS Policies:**
- `Users can create their own affiliate record` - INSERT: `auth.uid() = user_id`
- `Affiliates can view their own data` - SELECT: `auth.uid() = user_id`
- `Affiliates can update their own data` - UPDATE: `auth.uid() = user_id`
- `Admins can view/manage all affiliates` - ALL: `has_role(auth.uid(), 'admin')`

---

#### `user_credits` - Saldo de WinnerPoints

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| `id` | uuid | No | `gen_random_uuid()` | Identificador único |
| `user_id` | uuid | No | - | ID del usuario |
| `email` | text | No | - | Email del usuario |
| `balance` | numeric | No | 0 | Saldo actual en WinnerPoints |
| `created_at` | timestamptz | No | `now()` | Fecha de creación |
| `updated_at` | timestamptz | No | `now()` | Última actualización |

**RLS Policies:**
- `Users can view their own credits` - SELECT: `auth.uid() = user_id`
- `Admins can view/insert/update all credits` - SELECT/INSERT/UPDATE: `has_role(auth.uid(), 'admin')`

---

#### `credit_transactions` - Historial de transacciones

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| `id` | uuid | No | `gen_random_uuid()` | Identificador único |
| `user_credit_id` | uuid | No | - | FK a user_credits |
| `amount` | numeric | No | - | Monto (positivo = ingreso, negativo = gasto) |
| `type` | text | No | - | Tipo: 'add' / 'purchase' |
| `description` | text | Sí | null | Descripción de la transacción |
| `admin_id` | uuid | Sí | null | ID del admin que añadió créditos |
| `order_id` | uuid | Sí | null | ID del pedido asociado |
| `created_at` | timestamptz | No | `now()` | Fecha de la transacción |

**RLS Policies:**
- `Users can view their own transactions` - SELECT: subquery user_credits
- `Admins can view/insert all transactions` - SELECT/INSERT: `has_role(auth.uid(), 'admin')`

---

#### `commissions` - Comisiones de afiliados

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| `id` | uuid | No | `gen_random_uuid()` | Identificador único |
| `affiliate_id` | uuid | No | - | FK a affiliates |
| `order_id` | uuid | Sí | null | FK a orders |
| `amount` | numeric | No | 0 | Monto de la comisión |
| `level` | integer | No | 1 | Nivel de la comisión (1, 2, o 3) |
| `status` | text | Sí | 'pending' | Estado: pending/paid |
| `created_at` | timestamptz | No | `now()` | Fecha de creación |

**RLS Policies:**
- `Affiliates can view their commissions` - SELECT: subquery affiliates
- `Admins can manage commissions` - ALL: `has_role(auth.uid(), 'admin')`
- `Allow commission creation via function` - INSERT: `true` (para RPC)

---

#### `referrals` - Relaciones de referidos

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| `id` | uuid | No | `gen_random_uuid()` | Identificador único |
| `referrer_id` | uuid | No | - | ID del afiliado que refiere |
| `referred_id` | uuid | No | - | ID del afiliado referido |
| `level` | integer | No | 1 | Nivel de la relación (1, 2, 3) |
| `created_at` | timestamptz | No | `now()` | Fecha de creación |

**RLS Policies:**
- `Affiliates can view their referrals` - SELECT: subquery affiliates
- `Authenticated users can create referrals` - INSERT: `auth.uid() IS NOT NULL`
- `Admins can manage referrals` - ALL: `has_role(auth.uid(), 'admin')`

---

#### `user_roles` - Roles de usuario

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| `id` | uuid | No | `gen_random_uuid()` | Identificador único |
| `user_id` | uuid | No | - | ID del usuario |
| `role` | app_role | No | - | Rol: 'admin' |
| `created_at` | timestamptz | Sí | `now()` | Fecha de asignación |

**RLS Policies:**
- `Users can view their own roles` - SELECT: `auth.uid() = user_id`
- `Admins can view all roles` - SELECT: `has_role(auth.uid(), 'admin')`

---

#### `business_settings` - Configuración del negocio

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| `id` | uuid | No | `gen_random_uuid()` | Identificador único |
| `business_name` | text | No | 'Winner Organa' | Nombre del negocio |
| `logo_url` | text | Sí | null | URL del logo |
| `contact_email` | text | Sí | null | Email de contacto |
| `contact_phone` | text | Sí | null | Teléfono de contacto |
| `whatsapp_number` | text | Sí | null | Número de WhatsApp |
| `address` | text | Sí | null | Dirección física |
| `commission_level_1` | numeric | No | 10 | Comisión nivel 1 (%) |
| `commission_level_2` | numeric | No | 5 | Comisión nivel 2 (%) |
| `commission_level_3` | numeric | No | 2 | Comisión nivel 3 (%) |
| `notify_new_orders` | boolean | No | true | Notificar nuevos pedidos |
| `notify_new_affiliates` | boolean | No | true | Notificar nuevos afiliados |
| `created_at` | timestamptz | No | `now()` | Fecha de creación |
| `updated_at` | timestamptz | No | `now()` | Última actualización |

**RLS Policies:**
- `Admins can view/insert/update settings` - SELECT/INSERT/UPDATE: `has_role(auth.uid(), 'admin')`

---

#### `contact_messages` - Mensajes de contacto

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| `id` | uuid | No | `gen_random_uuid()` | Identificador único |
| `nombre` | text | No | - | Nombre del remitente |
| `email` | text | No | - | Email del remitente |
| `whatsapp` | text | Sí | null | WhatsApp del remitente |
| `mensaje` | text | No | - | Contenido del mensaje |
| `status` | text | Sí | 'pending' | Estado: pending/read/replied |
| `created_at` | timestamptz | No | `now()` | Fecha de envío |

**RLS Policies:**
- `Anyone can submit contact form` - INSERT: `true`
- `Admins can view all messages` - SELECT: `has_role(auth.uid(), 'admin')`
- `Admins can update messages` - UPDATE: `has_role(auth.uid(), 'admin')`

---

### 4.3 Enums

#### `app_role`
```sql
CREATE TYPE public.app_role AS ENUM ('admin');
```

---

### 4.4 Índices Recomendados

```sql
-- Búsqueda de afiliados por código
CREATE INDEX idx_affiliates_code ON affiliates(affiliate_code);

-- Búsqueda de pedidos por email
CREATE INDEX idx_orders_email ON orders(customer_email);

-- Búsqueda de transacciones por user_credit
CREATE INDEX idx_transactions_credit ON credit_transactions(user_credit_id);

-- Búsqueda de comisiones por afiliado
CREATE INDEX idx_commissions_affiliate ON commissions(affiliate_id);
```

---

## 5. Guía de Instalación Local

### 5.1 Requisitos Previos

- Node.js >= 18.0.0
- npm >= 9.0.0 o bun >= 1.0.0
- Git

### 5.2 Instalación

```bash
# Clonar repositorio
git clone <repository-url>
cd winner-organa

# Instalar dependencias
npm install
# o
bun install

# Iniciar servidor de desarrollo
npm run dev
# o
bun run dev
```

### 5.3 Variables de Entorno

El archivo `.env` se genera automáticamente y contiene:

```env
VITE_SUPABASE_URL=https://szjxezvhhhayyywrjbjm.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=szjxezvhhhayyywrjbjm
```

**IMPORTANTE:** No modificar manualmente estos valores.

---

## 6. Notas de Mantenimiento

### 6.1 Archivos Auto-generados (NO MODIFICAR)

- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/types.ts`
- `supabase/config.toml`
- `.env`

### 6.2 Convenciones de Código

- Usar TypeScript estricto
- Componentes funcionales con hooks
- Nombres en PascalCase para componentes
- Nombres en camelCase para funciones y variables
- Usar importaciones absolutas con `@/`

### 6.3 Flujo de Trabajo Git

```bash
# Crear rama feature
git checkout -b feature/nombre-feature

# Commits semánticos
git commit -m "feat: agregar nueva funcionalidad"
git commit -m "fix: corregir bug en checkout"
git commit -m "docs: actualizar README"

# Push y PR
git push origin feature/nombre-feature
```

---

*Documentación generada el 19 de diciembre de 2024*
*Versión: 1.0.0*
