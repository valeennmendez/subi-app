# Reglas del proyecto Subi

Estas reglas se aplican en todas las sesiones. La especificación completa del proyecto está en `especificaciones-subi.md`.

## Forma de trabajo

- Antes de modificar archivos, mostrá un plan (archivos a crear o tocar y qué cambia en cada uno) y esperá mi confirmación.
- Trabajá de a una funcionalidad por vez. Si una tarea es grande, proponé partirla.
- Al terminar cada tarea, explicame el flujo paso a paso y dame pasos para probarla a mano, incluyendo casos de error.
- Si algo de la especificación es ambiguo, preguntame en lugar de suponer.

## Git

- Trabajá siempre en una rama por funcionalidad, creada desde `main` (por ejemplo `feature/auth-jwt`). Nunca commitees directo en `main`.
- Hacé **un commit por cada funcionalidad creada o modificada**. No mezcles cambios no relacionados en un mismo commit.
- Formato del mensaje: `tipo(ámbito): descripción en español, en imperativo`.
  - Tipos: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`.
  - Ámbitos: `backend`, `frontend`, `database`, `env`, entre otros que correspondan.
  - Ejemplo: `feat(backend): agrega endpoint para reservar asientos`.
- Commiteá a medida que termina cada funcionalidad, no al final de todo.
- **No hagas `push` ni abras pull requests sin que yo lo pida.** Cuando te lo pida, redactá una descripción con: qué hace, cambios principales, cómo probarlo, decisiones tomadas y pendientes.
- No reescribas el historial (`rebase`, `reset --hard`, `push --force`) sin mi autorización explícita.

## Seguridad y archivos sensibles

- **Nunca borres, sobrescribas ni recrees archivos `.env`.** Si hay que cambiar uno, editá únicamente las líneas indicadas. Si no existe, avisame en lugar de crearlo con valores inventados.
- Nunca subas al repositorio claves, tokens, contraseñas ni archivos `.env`. Verificá que `.env` esté en `.gitignore`.
- Los archivos `.env.example` llevan solo nombres de variables y placeholders, nunca valores reales.
- Las contraseñas se guardan siempre con hash (bcrypt). Nunca en texto plano ni en logs.
- No imprimas en consola ni en logs datos sensibles (contraseñas, tokens, claves de API).

## Comandos peligrosos

- Antes de ejecutar cualquier comando que elimine archivos o datos (`rm`, `Remove-Item`, `DROP TABLE`, `TRUNCATE`, `docker volume rm`, etc.), verificá que el objetivo existe y pedime confirmación.
- Los scripts SQL solo se ejecutan contra la base de datos local de Docker del proyecto, nunca contra otra base.
- No instales dependencias globales ni modifiques configuración fuera de la carpeta del proyecto.

## Estilo de código

- JavaScript puro (sin TypeScript). Código simple, legible y con nombres claros.
- Backend en capas: routes → controllers → services → acceso a datos. Los controllers no contienen lógica de negocio ni SQL.
- Validá la entrada de todos los endpoints.
- Usá mensajes de error claros para el usuario, sin filtrar detalles internos.
