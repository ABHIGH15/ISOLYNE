const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', '_layout.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Insert RevenueCatService import if not present
if (!content.includes('RevenueCatService')) {
  content = content.replace(
    "import { KernelProvider } from '../src/presentation/components/KernelContext';",
    "import { KernelProvider } from '../src/presentation/components/KernelContext';\nimport { RevenueCatService } from '../src/kernel/services/RevenueCatService';\nimport { useEffect } from 'react';"
  );
}

// Ensure useEffect for initialization exists
if (!content.includes('RevenueCatService.initialize')) {
  content = content.replace(
    'export default function RootLayout() {',
    'export default function RootLayout() {\n  useEffect(() => {\n    RevenueCatService.initialize();\n  }, []);\n'
  );
}

fs.writeFileSync(filePath, content, 'utf8');
