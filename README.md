# 🎾 Calculadora de Costos Compartidos de Pádel

Una aplicación web progresiva (PWA) diseñada para calcular de forma justa y automática los costos compartidos del alquiler de canchas de pádel entre amigos.

## 🚀 Demo en Vivo

[Ver Demo](https://tu-usuario.github.io/calculadora-padel) *(Actualizar con tu URL)*

## 📱 Características Principales

### ✨ Gestión Completa de Sesiones
- **Configuración flexible**: Hora de inicio personalizable
- **Jugadores iniciales**: Selección rápida de los primeros 4 jugadores
- **Gestión dinámica**: Agregar jugadores que llegan durante la sesión
- **Salidas tempranas**: Registrar cuando alguien se retira antes del final
- **Cálculo automático**: Distribución proporcional al finalizar

### 🧮 Cálculo Proporcional Justo
- **Tiempo efectivo**: Cada jugador paga según su tiempo real de juego
- **Fórmula transparente**: `(Tiempo del Jugador / Tiempo Total Jugado) × Costo Total`
- **Redondeo inteligente**: Montos redondeados a $100 para facilitar pagos
- **Saldo automático**: Muestra diferencias por redondeos con signo +/-

### 💰 Control de Pagos
- **Estado simple**: Pagado/Pendiente por jugador
- **Resumen financiero**: Total recaudado vs. pendiente
- **Seguimiento visual**: Colores únicos por jugador para identificación rápida

### 📱 Experiencia Móvil Optimizada
- **PWA instalable**: Se instala como app nativa en Android
- **Responsive design**: Funciona en portrait y landscape
- **Botones grandes**: Optimizados para dedos grandes
- **Animaciones suaves**: Transiciones fluidas entre secciones
- **Indicador de progreso**: Muestra el paso actual (1 de 4)

### 🛡️ Validaciones Inteligentes
- **Horarios lógicos**: Previene errores de llegada/salida
- **Advertencia automática**: Detecta posibles olvidos al finalizar
- **Duplicados**: Evita seleccionar el mismo jugador múltiples veces
- **Formatos flexibles**: Acepta horas en formato 24h y 12h (AM/PM)

### 🔄 Funciones Avanzadas
- **Compartir por WhatsApp**: Envía resultados automáticamente
- **"Todos se quedan"**: Botón para sesiones donde nadie se va temprano
- **Confirmación visual**: Mensajes toast al agregar jugadores
- **Colores por jugador**: 8 colores únicos para identificación rápida
- **Historial de sesiones**: Guarda automáticamente las últimas 20 sesiones

## 🎯 Casos de Uso

### Escenario Típico
1. **18:00** - Inician Juan, María, Carlos, Ana
2. **19:30** - Llega Pedro
3. **20:15** - Se va María
4. **21:00** - Llega Luis
5. **22:00** - Termina la sesión, costo total $8,000
6. **Automático** - La sesión se guarda en el historial

**Resultado automático**:
- Juan: 4h → $2,000 (25%)
- Carlos: 4h → $2,000 (25%)  
- Ana: 4h → $2,000 (25%)
- Pedro: 2.5h → $1,300 (16.25%)
- Luis: 1h → $500 (6.25%)
- María: 1.25h → $200 (2.5%)

### Historial de Sesiones
- **Acceso**: Toca el ícono 📋 en la navegación inferior
- **Ver detalles**: Revisa cálculos de sesiones anteriores
- **Eliminar**: Borra sesiones individuales o todo el historial
- **Almacenamiento**: Guarda las últimas 20 sesiones automáticamente

## 🛠️ Instalación y Uso

### Opción 1: Usar Directamente
```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/calculadora-padel.git
cd calculadora-padel

# Abrir en navegador
open index.html
```

### Opción 2: Servidor Local (Recomendado para PWA)
```bash
# Con Python
python -m http.server 8000

# Con Node.js
npx serve .

# Abrir: http://localhost:8000
```

### Opción 3: Instalar como App en Android
1. Abre la URL en Chrome en tu Android
2. Menú (⋮) → "Agregar a pantalla de inicio"
3. ¡Listo! Se instala como app nativa

## 📖 Guía de Uso

### 1️⃣ Iniciar Sesión
- Ingresa la **hora de inicio** del alquiler
- Presiona **"▶️ Iniciar Sesión"**

### 2️⃣ Jugadores Iniciales
- Selecciona los **4 jugadores** que empiezan
- Presiona **"👥 Agregar Jugadores Iniciales"**

### 3️⃣ Durante la Sesión
- **Agregar jugadores** que llegan: Nombre + hora de llegada
- **Marcar salidas** tempranas: Botón "🚪 Marcar Salida"
- **Eliminar jugadores** agregados por error

### 4️⃣ Finalizar
- Botón **"👥 Todos se Quedan"** si nadie se fue temprano
- Ingresa **hora de fin** y **costo total**
- Presiona **"🏁 Finalizar y Calcular"**

### 5️⃣ Resultados
- Ve los **montos por jugador**
- Marca **pagos recibidos**
- **Comparte por WhatsApp** con el grupo

### 📋 Historial
- **Acceso rápido**: Botón en navegación inferior
- **Guardado automático**: Cada sesión finalizada se guarda
- **Ver detalles**: Revisa sesiones anteriores
- **Eliminar sesiones**: Limpia registros individuales o todo el historial

## 🧪 Testing

```bash
# Abrir tests en navegador
open test.html
```

Los tests cubren:
- ✅ Conversión de formatos de hora
- ✅ Cálculos proporcionales
- ✅ Validaciones de horarios
- ✅ Casos edge (sesiones cortas, etc.)

## 🎨 Personalización

### Agregar Nuevos Jugadores
Edita `index.html` en las secciones de `<select>`:
```html
<option value="NuevoJugador">Nuevo Jugador</option>
```

### Cambiar Colores
Modifica los colores en `index.html`:
```css
.player-color-0 { border-left-color: #TU_COLOR; }
```

## 🌐 Tecnologías

- **HTML5**: Estructura semántica y accesible
- **CSS3**: Diseño responsive con animaciones
- **JavaScript Vanilla**: Sin dependencias externas
- **PWA**: Service Worker para funcionalidad offline
- **Web App Manifest**: Instalación como app nativa

## 📱 Compatibilidad

- ✅ **Android**: Chrome, Firefox, Edge
- ✅ **iOS**: Safari, Chrome
- ✅ **Desktop**: Todos los navegadores modernos
- ✅ **Offline**: Funciona sin internet una vez cargada

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🎾 Créditos

Desarrollado con ❤️ para grupos de amigos que juegan pádel y quieren dividir los costos de forma justa y transparente.

---

**¡Disfruta tus partidos de pádel sin preocuparte por las cuentas! 🎾**