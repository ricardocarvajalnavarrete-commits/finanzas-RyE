# 👛 Billetera Familiar — Ricardo & Elías

App de gestión financiera familiar (PWA). Funciona 100% local y opcionalmente sincroniza entre dispositivos con Firebase.

## 🚀 Publicar en GitHub Pages
1. Crea un repositorio (ej: `billetera`) y sube estos archivos: `index.html`, `styles.css`, `app.js`, `manifest.webmanifest`, `sw.js`, `icon.svg`.
2. En el repo: **Settings → Pages → Branch: main → Save**.
3. Abre `https://TU_USUARIO.github.io/billetera/` (HTTPS es necesario para PWA y notificaciones).

## 📱 Instalar como app
- **Android/Chrome**: al abrir, aparece el banner "Instalar", o Menú ⋮ → *Instalar aplicación*. Acepta el permiso de notificaciones.
- **iPhone/Safari**: Compartir → *Agregar a pantalla de inicio*.

## ☁️ Sincronización real (PC ↔ celular)
1. En https://console.firebase.google.com crea un proyecto.
2. **Authentication → Sign-in method → Correo/contraseña** (habilitar).
3. **Firestore Database → Crear base de datos** (modo producción).
4. Agrega una app Web y copia el objeto `firebaseConfig`.
5. En la app: **Ajustes → Sincronización Firebase** → pega la config → Guardar → *Crear cuenta* → activa el switch de sincronización.
6. Inicia sesión en cada dispositivo: los cambios se reflejan automáticamente.

## 🔐 Seguridad
- Activa la **contraseña** en Ajustes.
- Usa **Exportar respaldo cifrado** (AES-256) para llevar tus datos a otro equipo.
- ⚠️ Nunca subas a GitHub números completos de tarjetas/CVV. La semilla solo incluye los últimos 4 dígitos; los datos completos ingrésalos dentro de la app.

## ✅ Funciones incluidas
Deudas (vigente/morosa/pagada, días de mora con colores, pago mínimo opcional, botón Pago con abonos, "Cuenta al Día", sin vencimiento), página Pagos (ABONO / PAGO MÍNIMO / PAGO SUPERIOR… / PAGO FACTURADO), Acreedores (4 tipos), Cuentas y tarjetas con archivo/desarchivo, Presupuesto por categoría con alertas, Gastos variables + ingresos, Metas con aporte automático, Histórico ingresos vs gastos, Proyecciones y consejos, Notificaciones de vencimiento, PWA instalable con icono de billetera.
