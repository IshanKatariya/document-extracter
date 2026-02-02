# 🛠️ Development Guide

## Project Structure

```
docuextract/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   └── extract/          # Gemini extraction endpoint
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main application page
├── components/               # React components
│   ├── UploadTab.tsx         # Upload interface
│   ├── DataTab.tsx           # Data table view
│   └── MetricsTab.tsx        # Metrics dashboard
├── lib/                      # Utilities and types
│   ├── types.ts              # TypeScript interfaces
│   └── pdfUtils.ts           # PDF processing utilities
├── public/                   # Static assets
├── .env.example              # Environment template
├── .gitignore               
├── next.config.js            # Next.js configuration
├── package.json              
├── postcss.config.js         
├── tailwind.config.js        # Tailwind CSS config
└── tsconfig.json             # TypeScript config
```

---

## Development Workflow

### 1. Setup Development Environment

```bash
# Clone repository
git clone <repo-url>
cd docuextract

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Add your API key
echo "GEMINI_API_KEY=your_key" >> .env.local

# Start dev server
npm run dev
```

### 2. Code Style

We use TypeScript with strict mode. Follow these conventions:

**Components**:
```typescript
'use client'; // Only for client components

import { useState } from 'react';

interface ComponentProps {
  data: string[];
  onUpdate: (data: string[]) => void;
}

export default function Component({ data, onUpdate }: ComponentProps) {
  // Component logic
}
```

**API Routes**:
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Handle request
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Message' }, { status: 500 });
  }
}
```

### 3. Adding Features

**New Component**:
```bash
# Create component file
touch components/NewFeature.tsx

# Import in parent component
import NewFeature from '@/components/NewFeature';
```

**New API Route**:
```bash
# Create route directory
mkdir -p app/api/new-endpoint

# Create route handler
touch app/api/new-endpoint/route.ts
```

### 4. Testing

```bash
# Type checking
npm run type-check

# Build test
npm run build

# Production test
npm run start
```

---

## Key Technologies

### Frontend Stack

**Next.js 14**
- App Router for file-based routing
- Server Components by default
- API routes for backend

**TypeScript**
- Strict type checking
- Interface-driven development
- Type-safe API calls

**Tailwind CSS**
- Utility-first styling
- Custom color scheme
- Responsive design

**TanStack Table**
- Advanced data tables
- Sorting, filtering, pagination
- Type-safe column definitions

### Backend Stack

**Next.js API Routes**
- Serverless functions
- Built-in with Next.js
- Easy deployment

**Gemini API**
- Multimodal AI
- Vision + text understanding
- Structured output

**PDF Processing**
- pdf.js for rendering
- Sharp for image processing
- Canvas API for preprocessing

---

## Architecture Decisions

### Why Next.js?
- Full-stack framework
- Great developer experience
- Easy deployment (Vercel)
- Built-in API routes

### Why TypeScript?
- Catch errors at compile time
- Better IDE support
- Self-documenting code
- Safer refactoring

### Why Tailwind?
- Rapid prototyping
- Consistent design system
- Small bundle size
- Great for dark mode

### Why TanStack Table?
- Most powerful React table library
- Headless (full styling control)
- Great TypeScript support
- Performance optimized

---

## Performance Optimization

### Current Optimizations

1. **Image Loading**
   - Lazy loading for images
   - Optimized DPI conversion
   - Canvas-based preprocessing

2. **Data Table**
   - Virtual scrolling (planned)
   - Pagination
   - Client-side filtering

3. **API Calls**
   - Batching for 100+ docs
   - Smart model routing
   - Rate limit handling

### Future Optimizations

- [ ] Server-side rendering for data table
- [ ] Redis caching for results
- [ ] Worker threads for preprocessing
- [ ] Streaming responses
- [ ] Progressive image loading

---

## Common Tasks

### Add a New Field to Extract

1. Update `lib/types.ts`:
```typescript
export interface ExtractedData {
  // ... existing fields
  newField: string;
}
```

2. Update extraction prompt in `app/api/extract/route.ts`:
```typescript
const prompt = `
  ...
  "newField": "Description of new field"
  ...
`;
```

3. Update table columns in `components/DataTab.tsx`:
```typescript
{
  accessorKey: 'newField',
  header: 'New Field',
}
```

### Add a New Model

1. Add to types:
```typescript
type Model = 'gemini-2.5-pro' | 'gemini-2.5-flash' | 'new-model';
```

2. Update routing logic in API:
```typescript
const modelName = classification === 'special-case'
  ? 'new-model'
  : existingLogic;
```

### Change Cost Calculation

Update in `app/api/extract/route.ts`:
```typescript
const costPerToken = modelName.includes('pro') 
  ? 0.000002  // Adjust rate
  : 0.0000005;
```

---

## Debugging Tips

### API Issues
```typescript
// Add logging
console.log('Request:', formData);
console.log('Response:', result);

// Check environment
console.log('API Key:', process.env.GEMINI_API_KEY ? 'Set' : 'Missing');
```

### UI Issues
```typescript
// Component debugging
console.log('Props:', { data, onUpdate });
console.log('State:', { documents, metrics });

// Browser DevTools
// 1. Network tab for API calls
// 2. Console for errors
// 3. React DevTools for component tree
```

### Build Issues
```bash
# Clear Next.js cache
rm -rf .next

# Clean install
rm -rf node_modules package-lock.json
npm install

# Type check
npm run type-check
```

---

## Contributing

We welcome contributions! Here's how:

### 1. Fork & Clone

```bash
git clone https://github.com/yourusername/docuextract.git
cd docuextract
npm install
```

### 2. Create Branch

```bash
git checkout -b feature/your-feature-name
```

### 3. Make Changes

- Follow code style
- Add TypeScript types
- Test thoroughly
- Update documentation

### 4. Commit

```bash
git add .
git commit -m "feat: add new feature"
```

**Commit message format**:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructure
- `test:` Tests
- `chore:` Maintenance

### 5. Push & PR

```bash
git push origin feature/your-feature-name
```

Then open a Pull Request on GitHub.

---

## Code Review Checklist

Before submitting PR:

- [ ] TypeScript types are correct
- [ ] No console errors/warnings
- [ ] Responsive design works
- [ ] Error handling implemented
- [ ] Comments for complex logic
- [ ] Updated documentation
- [ ] Tested locally

---

## Resources

### Learning Materials
- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TanStack Table](https://tanstack.com/table/latest)
- [Gemini API Docs](https://ai.google.dev/docs)

### Tools
- [VS Code](https://code.visualstudio.com/) - Recommended IDE
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Postman](https://www.postman.com/) - API testing
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Performance

---

## Questions?

- Open an issue on GitHub
- Check existing issues first
- Be descriptive and include:
  - What you tried
  - What happened
  - What you expected
  - Screenshots if relevant

---

**Happy coding! 🚀**
