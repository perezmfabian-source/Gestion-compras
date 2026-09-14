# Checklist de Implementación y Tareas Pendientes

Este documento es un registro vivo de las tareas, requerimientos y ajustes que surgen durante la implementación. Lo mantendré actualizado automáticamente a medida que avancemos, agregando nuevas cosas por hacer y marcando las que vayamos terminando.

## 🔴 Alta Prioridad (Fase 3 - Críticas y Seguridad)
- [x] **Conexión 100% Real a Producción (Supabase):** Configurar y asegurar la conexión con la base de datos real, quitando el modo "mock" y el timeout de 3 segundos de prueba.
- [x] **Migración a Storage en la Nube (PDFs y Fotos):** Reemplazar el guardado en Base64 por Buckets de Storage para evitar sobrecargar la base de datos (vital para la escalabilidad).
- [x] **Correos Electrónicos Automatizados:** Configurar envíos de órdenes de compra desde el servidor (con el dominio propio y el PDF adjunto) sin depender del Outlook de escritorio del empleado.
- [x] **Protección Anti-Caídas (Error Boundaries):** Evitar pantallas en blanco globales; si falla un cálculo o módulo, el resto de la aplicación debe mantenerse viva.
- [x] **Inventario en Tiempo Real:** Sincronización instantánea para manejar situaciones en las que varias personas están conectadas a la vez.

## 🟡 Prioridad Media / Módulos Específicos
- [x] **Perfil de Usuario:** Implementar la funcionalidad de subir/actualizar Foto de Perfil.
- [ ] **Perfil de Usuario:** Implementar Autenticación de Dos Factores (2FA) para mayor seguridad.

## 🔵 Futuro / Integraciones (Fase Posterior)
- [ ] **Integración ERP PresuPro:** Asegurar que la estructura de datos y código actual esté lista para su futura integración con el módulo de Presupuestos (migración amigable).
- [ ] **Revisión Profunda del Código:** Leer el código a fondo y proponer opciones de mejora / optimización para el funcionamiento general.

## 🟢 Completadas
- [x] Crear este documento de checklist para llevar el control.

---
💡 **Nota para la implementación:** A medida que vayamos probando y descubriendo nuevos cambios necesarios, solo tienes que decírmelo y yo me encargaré de registrarlos aquí para que no se nos olvide nada.
