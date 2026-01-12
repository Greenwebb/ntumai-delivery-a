#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script to automatically wrap all screen files with ScreenContainer
 * This ensures proper SafeArea handling across all screens
 */

const BACKUP_DIR = path.join(__dirname, '../_backup_screens');
const APP_DIR = path.join(__dirname, '../app');

function findAllScreenFiles(dir) {
  const files = [];
  
  function traverse(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const itemPath = path.join(currentPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        traverse(itemPath);
      } else if (item.endsWith('.tsx') && !item.includes('_layout')) {
        files.push(itemPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

function wrapScreenWithContainer(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Skip if already wrapped
    if (content.includes('ScreenContainer')) {
      console.log(`✓ Already wrapped: ${path.relative(process.cwd(), filePath)}`);
      return true;
    }
    
    // Skip if it's a layout file or component
    if (filePath.includes('_layout') || filePath.includes('components')) {
      return true;
    }
    
    // Add ScreenContainer import if not present
    if (!content.includes("import { ScreenContainer }")) {
      const importMatch = content.match(/import\s+{[^}]+}\s+from\s+['"]@\/components\//);
      if (importMatch) {
        // Add ScreenContainer import after other component imports
        content = content.replace(
          /import\s+{([^}]+)}\s+from\s+['"]@\/components\/ui\/text['"]/,
          `import { ScreenContainer } from '@/components/screen-container';\nimport {$1} from '@/components/ui/text'`
        );
      } else {
        // Add import at the top after other imports
        const lastImportMatch = content.match(/^(import\s+.*;\n)+/m);
        if (lastImportMatch) {
          const lastImport = lastImportMatch[0];
          content = content.replace(
            lastImport,
            lastImport + `import { ScreenContainer } from '@/components/screen-container';\n`
          );
        }
      }
    }
    
    // Find the main return statement and wrap with ScreenContainer
    // Pattern 1: return (<View className="flex-1 bg-white">
    content = content.replace(
      /return\s*\(\s*<View\s+className="flex-1\s+bg-([^"]+)"\s*>/g,
      'return (\n    <ScreenContainer className="bg-$1">'
    );
    
    // Pattern 2: return (<View className="flex-1">
    content = content.replace(
      /return\s*\(\s*<View\s+className="flex-1"\s*>/g,
      'return (\n    <ScreenContainer>'
    );
    
    // Pattern 3: return (<TouchableWithoutFeedback ... > <View className="flex-1 bg-white">
    content = content.replace(
      /(<TouchableWithoutFeedback[^>]*>)\s*<View\s+className="flex-1\s+bg-([^"]+)"\s*>/g,
      '$1\n      <ScreenContainer className="bg-$2">'
    );
    
    // Close ScreenContainer before closing return
    content = content.replace(
      /\s*<\/View>\s*\);\s*\}/g,
      '\n    </ScreenContainer>\n  );\n}'
    );
    
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ Wrapped: ${path.relative(process.cwd(), filePath)}`);
    return true;
  } catch (error) {
    console.error(`✗ Error wrapping ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🔄 Finding all screen files...\n');
  
  const backupFiles = findAllScreenFiles(BACKUP_DIR);
  const appFiles = findAllScreenFiles(APP_DIR);
  
  const allFiles = [...backupFiles, ...appFiles];
  
  console.log(`Found ${allFiles.length} screen files\n`);
  console.log('📦 Wrapping screens with ScreenContainer...\n');
  
  let wrapped = 0;
  let failed = 0;
  
  for (const file of allFiles) {
    if (wrapScreenWithContainer(file)) {
      wrapped++;
    } else {
      failed++;
    }
  }
  
  console.log(`\n✅ Complete!\n`);
  console.log(`Wrapped: ${wrapped}`);
  console.log(`Failed: ${failed}`);
}

main();
