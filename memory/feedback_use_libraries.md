---
name: feedback_use_libraries
description: Siempre usar librerías establecidas de React/TypeScript en lugar de implementaciones manuales (regex, validaciones custom, etc.)
metadata:
  type: feedback
---

Usar siempre librerías establecidas del ecosistema React/TypeScript en lugar de implementaciones manuales.

**Why:** El usuario prefiere aprovechar librerías probadas en lugar de escribir lógica custom (ej: usar zod para validación de email en vez de regex manual).

**How to apply:** Ante cualquier validación, formateo, manejo de fechas, etc. — proponer e instalar la librería estándar del ecosistema (zod, date-fns, etc.) en lugar de escribir la lógica a mano.
