# Architecture Diagrams

This directory contains Mermaid diagram source files for the project's architecture documentation.

## ✅ Generated Diagrams

All 7 architecture diagrams have been generated as PNG images and are available in `docs/diagrams/`:

| Diagram | Source | Image | Size |
|---------|--------|-------|------|
| Overall Architecture | [01-overall-architecture.mmd](mermaid/01-overall-architecture.mmd) | [PNG](diagrams/01-overall-architecture.png) | 70 KB |
| Clean Architecture Layers | [02-clean-architecture-layers.mmd](mermaid/02-clean-architecture-layers.mmd) | [PNG](diagrams/02-clean-architecture-layers.png) | 19 KB |
| Caching System | [03-caching-system.mmd](mermaid/03-caching-system.mmd) | [PNG](diagrams/03-caching-system.png) | 59 KB |
| Data Flow | [04-data-flow.mmd](mermaid/04-data-flow.mmd) | [PNG](diagrams/04-data-flow.png) | 43 KB |
| Security Architecture | [05-security-architecture.mmd](mermaid/05-security-architecture.mmd) | [PNG](diagrams/05-security-architecture.png) | 17 KB |
| Input/Output/Effect Pattern | [06-input-output-effect-pattern.mmd](mermaid/06-input-output-effect-pattern.mmd) | [PNG](diagrams/06-input-output-effect-pattern.png) | 13 KB |
| Navigation Flow (NavGraph) | [07-navigation-flow.mmd](mermaid/07-navigation-flow.mmd) | [PNG](diagrams/07-navigation-flow.png) | 110 KB |

All diagrams are displayed in the main [README.md](../README.md) Architecture Overview section.

## Available Diagrams

### 01. Overall Architecture
**File**: `mermaid/01-overall-architecture.mmd`

Shows the high-level 3-layer Clean Architecture:
- **Presentation Layer**: Components + ViewModels
- **Domain Layer**: Services + Entities
- **Data Layer**: Repositories + API + DTOs

### 02. Clean Architecture Layers
**File**: `mermaid/02-clean-architecture-layers.mmd`

Detailed view of each layer with dependencies:
- External interactions (User, Backend API)
- Layer responsibilities and boundaries
- Data flow between layers

### 03. Caching System
**File**: `mermaid/03-caching-system.mmd`

4-layer offline-first caching strategy:
1. Memory Cache (~1ms)
2. LRU Cache (~2ms)
3. IndexedDB (~10ms)
4. API Request (~200ms)

Shows cache hit/miss flow and write-back strategy.

### 04. Data Flow
**File**: `mermaid/04-data-flow.mmd`

Sequence diagram showing complete data flow:
- User interaction → Component → ViewModel → Service → Repository
- Cache check → API fallback
- Response transformation (DTO → Domain)
- Signal updates → UI re-render

### 05. Security Architecture
**File**: `mermaid/05-security-architecture.mmd`

Security layers and data protection:
- HTTP interceptors (Auth + Error)
- Input sanitization flow
- CSP headers and security policies
- XSS detection and prevention

### 06. Input/Output/Effect Pattern
**File**: `mermaid/06-input-output-effect-pattern.mmd`

ViewModel architecture pattern:
- **INPUTS**: User actions and lifecycle events
- **OUTPUTS**: Signals and computed values
- **EFFECTS**: One-time side effects (navigation, toasts)

### 07. Navigation Flow (NavGraph Pattern)
**File**: `mermaid/07-navigation-flow.mmd`

Centralized navigation architecture using NavGraphService:
- **User Actions**: Single entry point for all navigation
- **Core Pages**: Home, Calendar, Messages, Documents, Profile, Settings, Notifications, Help
- **Users Module**: List, View Detail, Create, Edit workflows
- **Projects Module**: List, Create, Archived views
- **Tasks Module**: My Tasks, Recent, Important filters
- **Analytics Module**: Overview, Reports, Performance dashboards
- **Type-safe Navigation**: Compile-time route checking
- **Consistent Behavior**: Single source of truth for routing

---

## Generating PNG Images

You can generate PNG images from Mermaid diagrams using several methods:

### Method 1: Mermaid CLI (Recommended)

Install Mermaid CLI:
```bash
npm install -g @mermaid-js/mermaid-cli
```

Generate all diagrams:
```bash
# Create output directory
mkdir -p docs/images

# Generate PNG for each diagram
mmdc -i docs/mermaid/01-overall-architecture.mmd -o docs/images/01-overall-architecture.png -t dark -b transparent
mmdc -i docs/mermaid/02-clean-architecture-layers.mmd -o docs/images/02-clean-architecture-layers.png -t dark -b transparent
mmdc -i docs/mermaid/03-caching-system.mmd -o docs/images/03-caching-system.png -t dark -b transparent
mmdc -i docs/mermaid/04-data-flow.mmd -o docs/images/04-data-flow.png -t dark -b transparent
mmdc -i docs/mermaid/05-security-architecture.mmd -o docs/images/05-security-architecture.png -t dark -b transparent
mmdc -i docs/mermaid/06-input-output-effect-pattern.mmd -o docs/images/06-input-output-effect-pattern.png -t dark -b transparent
```

Batch generation script:
```bash
#!/bin/bash
mkdir -p docs/images

for file in docs/mermaid/*.mmd; do
  filename=$(basename "$file" .mmd)
  mmdc -i "$file" -o "docs/images/$filename.png" -t dark -b transparent
  echo "Generated: docs/images/$filename.png"
done
```

### Method 2: Online Mermaid Editor

1. Visit [Mermaid Live Editor](https://mermaid.live/)
2. Copy the contents of each `.mmd` file
3. Paste into the editor
4. Click "Actions" → "Download PNG"
5. Save to `docs/images/`

### Method 3: VS Code Extension

1. Install extension: "Markdown Preview Mermaid Support"
2. Open any `.mmd` file in VS Code
3. Right-click diagram → "Export Diagram as PNG"
4. Save to `docs/images/`

### Method 4: GitHub Integration

GitHub automatically renders Mermaid diagrams in Markdown files. You can:
- Embed `.mmd` code directly in Markdown:

````markdown
```mermaid
graph TD
    A[Start] --> B[End]
```
````

- Or link to the live editor:
```markdown
![Architecture](https://mermaid.ink/img/BASE64_ENCODED_DIAGRAM)
```

---

## Using Diagrams in Documentation

### In README.md

Reference the diagrams using relative paths:

```markdown
## Architecture Overview

![Overall Architecture](docs/images/01-overall-architecture.png)

### Clean Architecture Layers

![Clean Architecture](docs/images/02-clean-architecture-layers.png)
```

### In ARCHITECTURE.md

For detailed technical documentation:

```markdown
## Caching Strategy

The application uses a 4-layer caching system:

![Caching System](docs/images/03-caching-system.png)

### Cache Levels
1. **Memory Cache**: Instant access (~1ms)
2. **LRU Cache**: Fast in-memory (~2ms)
3. **IndexedDB**: Persistent storage (~10ms)
4. **API**: Network request (~200ms)
```

---

## Diagram Customization

### Themes

Mermaid CLI supports multiple themes:
- `default` - Light theme
- `dark` - Dark theme (recommended)
- `forest` - Green theme
- `neutral` - Grayscale

```bash
mmdc -i input.mmd -o output.png -t dark
```

### Background

```bash
# Transparent background (recommended for docs)
mmdc -i input.mmd -o output.png -b transparent

# White background
mmdc -i input.mmd -o output.png -b white

# Custom color
mmdc -i input.mmd -o output.png -b "#f5f5f5"
```

### Resolution

```bash
# Higher resolution (default: 800x600)
mmdc -i input.mmd -o output.png -w 1920 -h 1080

# Scale factor
mmdc -i input.mmd -o output.png -s 2
```

---

## Maintenance

### Updating Diagrams

1. Edit the `.mmd` source file in `docs/mermaid/`
2. Regenerate PNG using one of the methods above
3. Commit both the `.mmd` source and PNG output

### Versioning

Keep diagram sources in version control:
- ✅ Commit `.mmd` files (source of truth)
- ✅ Commit `.png` files (for easy viewing)
- ❌ Don't ignore generated images (they're part of docs)

---

## Resources

- [Mermaid Documentation](https://mermaid.js.org/)
- [Mermaid Live Editor](https://mermaid.live/)
- [Mermaid CLI](https://github.com/mermaid-js/mermaid-cli)
- [Mermaid Syntax Guide](https://mermaid.js.org/intro/)
- [Graph Types](https://mermaid.js.org/syntax/flowchart.html)

---

## Troubleshooting

### Mermaid CLI Issues

**Error: Puppeteer Chromium not found**
```bash
# Install Chromium
npm install -g puppeteer
```

**Error: Permission denied**
```bash
# Fix permissions
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

### Rendering Issues

**Diagram too large**
- Adjust `--width` and `--height` parameters
- Simplify complex diagrams
- Split into multiple diagrams

**Text overlap**
- Increase node padding in Mermaid config
- Use shorter labels
- Adjust graph direction (`TB`, `LR`, `RL`, `BT`)

---

## Contributing

When adding new diagrams:

1. Create `.mmd` file in `docs/mermaid/`
2. Use consistent naming: `##-diagram-name.mmd`
3. Follow existing style and color schemes
4. Generate PNG and add to `docs/images/`
5. Update this document with diagram description
6. Reference diagram in appropriate documentation files
