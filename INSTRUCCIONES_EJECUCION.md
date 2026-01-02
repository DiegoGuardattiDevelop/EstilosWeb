# 🚀 INSTRUCCIONES PARA EJECUTAR EL PROYECTO

## ⚠️ IMPORTANTE: Orden de inicio

**PRIMERO Backend, LUEGO Frontend**

---

## 1️⃣ INICIAR EL BACKEND (Laravel)

### Terminal 1: Backend

```bash
cd "/home/diego/Repositorios/Proyecto EstilosWeb/Backend"

# Opción A: Usar Sail (Docker recomendado)
./sail up -d

# Opción B: PHP nativo
php artisan serve --host=0.0.0.0 --port=8000
```

**Espera a que veas:**

```
✅ Laravel development server started: http://127.0.0.1:8000
```

### Verificar que Backend funciona:

```bash
# En otra terminal
curl http://localhost:8000/api/products
```

Deberías ver JSON con productos.

---

## 2️⃣ INICIAR EL FRONTEND (Angular)

### Terminal 2: Frontend

```bash
cd "/home/diego/Repositorios/Proyecto EstilosWeb/Frontend"

# Compilar e instalar dependencias (si no lo has hecho)
npm install

# Iniciar servidor Angular
ng serve --open
```

**Espera a que veas:**

```
✅ Application bundle generation complete. [X.XXX seconds]
✅ Localhost: http://localhost:4200/
```

Se abrirá automáticamente en el navegador.

---

## 🎯 CARACTERÍSTICAS NUEVAS IMPLEMENTADAS

### ✅ NavbarComponent

- Logo y menú de navegación
- Búsqueda de productos
- Carrito con contador
- Menú de usuario (autenticado/no autenticado)
- Responsivo para mobile

**Ubicación:** `/navbar` en todas las páginas (automático)

### ✅ CheckoutComponent (3 pasos)

1. **Paso 1:** Información de envío
2. **Paso 2:** Confirmación de orden
3. **Paso 3:** Pago

**Acceso:** Ir al carrito → "Procesar Compra" → `/checkout`

### ✅ Hero Section Mejorado

- Botón "Explorar Colecciones" descomentado ✅
- Background con gradient y patrón
- Responsive para todas las pantallas
- Animaciones suaves

### ✅ Rutas Actualizadas

- `/checkout` - Formulario de compra (requiere autenticación)
- `/order-confirmation` - Confirmación de orden

---

## 🧪 PRUEBAS RECOMENDADAS

### Test 1: Navbar visible

```
1. Abre http://localhost:4200
2. Verifica que aparezca navbar en la parte superior
3. Logo, menú, búsqueda y carrito deben estar visibles
```

### Test 2: Búsqueda funciona

```
1. Haz clic en la barra de búsqueda
2. Escribe "camisa" o similar
3. Deberías ver resultados de productos
```

### Test 3: Carrito + Checkout

```
1. Ve a cualquier categoría
2. Agrega productos al carrito
3. Haz clic en el icono del carrito (🛒)
4. Haz clic en "Procesar Compra"
5. Completa el formulario de envío
6. Avanza a través de los 3 pasos
7. Confirma la orden
```

### Test 4: Autenticación

```
1. Sin login:
   - Verás botones "Iniciar Sesión" y "Registrarse" en navbar

2. Con login:
   - Verás tu nombre de usuario
   - Menú dropdown con "Mi Perfil", "Mis Órdenes", "Cerrar Sesión"
```

### Test 5: Hero Section

```
1. Abre http://localhost:4200
2. Verifica que se vea el botón "Explorar Colecciones"
3. Haz clic en el botón → debe scrollear a categorías
4. Prueba en mobile para ver responsive
```

---

## 🔧 TROUBLESHOOTING

### Problema: Backend no responde

```
❌ Error: Cannot GET /api/products
```

**Solución:**

```bash
# Terminal Backend
cd "/home/diego/Repositorios/Proyecto EstilosWeb/Backend"

# Con Sail
./sail up -d

# O con PHP
php artisan serve
```

### Problema: Puerto 8000 en uso

```bash
# Encuentra el proceso
lsof -i :8000

# Mata el proceso
kill -9 <PID>

# Reinicia
php artisan serve --port=8001
```

### Problema: Puerto 4200 en uso

```bash
ng serve --port=4201
```

### Problema: Dependencias Angular no instaladas

```bash
cd Frontend
npm install
ng serve
```

### Problema: Cambios no se ven

```bash
# Frontend se recompila automático
# Si no ves cambios:
1. Presiona Ctrl+Shift+R (reload cache)
2. Abre DevTools (F12)
3. Vacía cache local
```

---

## 📊 ESTRUCTURA DE CARPETAS

```
Frontend/src/app/
├── components/
│   ├── navbar/                    ✅ NUEVO
│   │   ├── navbar.component.ts
│   │   ├── navbar.component.html
│   │   └── navbar.component.scss
│   ├── checkout/                  ✅ NUEVO
│   │   ├── checkout.component.ts
│   │   ├── checkout.component.html
│   │   └── checkout.component.scss
│   └── ... otros componentes
├── home/
│   ├── home.component.html        ✅ MEJORADO (botón visible)
│   ├── home.component.ts
│   └── home.component.scss        ✅ MEJORADO (responsive)
├── services/
│   ├── cart.service.ts
│   ├── auth.service.ts
│   └── product.service.ts
└── app.routes.ts                  ✅ ACTUALIZADO
```

---

## ✅ CHECKLIST ANTES DE USAR

- [ ] Backend iniciado: `./sail up -d` o `php artisan serve`
- [ ] Backend responde: `curl http://localhost:8000/api/products`
- [ ] Frontend instalado: `npm install` en Frontend/
- [ ] Frontend corriendo: `ng serve`
- [ ] Navegador abierto: http://localhost:4200
- [ ] Navbar visible en la parte superior
- [ ] Botón "Explorar Colecciones" visible en hero
- [ ] Carrito funciona (agregar producto → ver contador)

---

## 🚀 PASOS RÁPIDOS

### En Terminal 1 (Backend):

```bash
cd "/home/diego/Repositorios/Proyecto EstilosWeb/Backend"
php artisan serve
# O: ./sail up -d
```

### En Terminal 2 (Frontend):

```bash
cd "/home/diego/Repositorios/Proyecto EstilosWeb/Frontend"
ng serve --open
```

**¡Listo! El proyecto debería estar corriendo en http://localhost:4200**

---

## 💾 REVERTIR CAMBIOS SI ALGO FALLA

Si algo no funciona como esperas:

```bash
cd Frontend
bash .backups/restore.sh
# Selecciona opción: 1 (Restaurar TODO)
```

Esto vuelve todo al estado original en segundos.

---

## 📝 PRÓXIMOS PASOS

1. ✅ Verifica que todo funcione
2. ✅ Prueba las características nuevas
3. ✅ Toma notas de lo que te gusta/no gusta
4. ✅ Si algo falla, usa `restore.sh`
5. ✅ Avísame qué ajustes necesitas

---

**Ahora tienes todo listo. ¿Necesitas ayuda para iniciar el backend o frontend?**
