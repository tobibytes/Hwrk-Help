# UI Library

Package: `@ui` (talvra-ui)

Rules
- Pages do not use raw HTML tags. Only custom primitives from `@ui`.
- UI components are dumb. Business logic and data live in hooks.
- All components follow consistent design patterns.

Component Structure
- Import from `@ui` alias
- Components are typed with TypeScript
- No business logic in UI components
- Props interface clearly defined

Examples
```tsx
import { Button, Card, Input, Text } from '@ui';

// Good: Using UI primitives
<Card>
  <Text variant="heading">Title</Text>
  <Input placeholder="Enter text" />
  <Button onClick={handleClick}>Submit</Button>
</Card>

// Bad: Using raw HTML
<div>
  <h1>Title</h1>
  <input placeholder="Enter text" />
  <button onClick={handleClick}>Submit</button>
</div>
```

Available Components
- Layout: Card, Container, Stack, Grid
- Typography: Text, Heading
- Forms: Input, Button, Select, Checkbox
- Navigation: Link, Menu
- Feedback: Alert, Loading, Modal
