# Informe: Table no se renderiza en el chat nativo

## Síntoma

El agente responde con una `Card` que contiene `CardHeader` + `Table` + `FollowUpBlock`.
En la UI de mostro-app solo se ven el header y los follow-ups. **La tabla desaparece.**

El stream (SSE / OpenUI Lang) llega correcto — el DevTools del navegador muestra la
estructura completa (Card, Table con datos, FollowUp). El problema está 100% en el
**render nativo**, no en el backend ni en el stream.

## Causa raíz

`Table` y `Col` **no están registrados** en `nativeChatLibrary`
(`src/components/openui/native-library.tsx`, `createLibrary({ components: [...] })`).

Componentes registrados hoy:

Card, CardHeader, TextContent, MarkDownRenderer, Callout, TextCallout, CodeBlock,
Separator, Image, SectionBlock, SectionItem, ListBlock, ListItem, FollowUpBlock,
FollowUpItem, Button, Buttons, TagBlock, Tag.

No hay `Table` ni `Col`.

## Por qué falla en silencio

En `@openuidev/react-lang`, `RenderNode` resuelve el componente con
`library.components[node.typeName]?.component`. Si el `typeName` no está registrado,
**retorna `null`** — el renderer omite el nodo desconocido y nunca crashea.

Por eso se ven `CardHeader` y `FollowUpBlock` (registrados) pero no la tabla (no registrada).

## Firma esperada por el backend

De `mostro/src/mastra/generated/openui-system-prompt.ts` (sección Tables):

- `Table(columns: Col[])` — tabla de datos **column-oriented**.
- `Col(label: string, data: any, type?: "string" | "number" | "action")` — cada `Col`
  tiene su propio array de datos.

Cada `Col` llega parseado dentro de `Table.props.columns` como un nodo
`{ type: "element", typeName: "Col", props: { label, data, type } }`, con las props
ya evaluadas.

## Fix (pendiente)

Registrar `Table` y `Col` en `nativeChatLibrary`, respetando nombre y **orden de props**
(`label`, `data`, `type` — el parser mapea args posicionales por orden de declaración).

- `Col`: data-holder, render `null` (los datos los lee el `Table`).
- `Table`: transpone las columnas a filas (cada `Col.props.data` es una columna) y
  renderiza header + filas.
