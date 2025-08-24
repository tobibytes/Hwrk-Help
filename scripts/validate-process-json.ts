#!/usr/bin/env tsx

import { readFile } from 'fs/promises';
import { join } from 'path';

// Simple validation function for process.json
function validateProcessHandbook(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check root structure
  if (!data.process_handbook) {
    errors.push('Missing process_handbook root object');
    return { valid: false, errors };
  }
  
  const ph = data.process_handbook;
  
  // Check required top-level fields
  const requiredFields = [
    'version', 'pr', 'commits', 'ownership', 'ci_gates', 'error_catalog',
    'rate_limits', 'security_data', 'runbooks', 'releases', 'adrs',
    'frontend_guardrails', 'backend_guardrails', 'codegen_sync', 'checklists'
  ];
  
  for (const field of requiredFields) {
    if (!ph[field]) {
      errors.push(`Missing required field: process_handbook.${field}`);
    }
  }
  
  // Basic type checks
  if (ph.version && typeof ph.version !== 'string') {
    errors.push('process_handbook.version must be a string');
  }
  
  if (ph.runbooks && typeof ph.runbooks !== 'object') {
    errors.push('process_handbook.runbooks must be an object');
  } else if (ph.runbooks) {
    // Check runbooks structure
    for (const [key, value] of Object.entries(ph.runbooks)) {
      if (!Array.isArray(value)) {
        errors.push(`process_handbook.runbooks.${key} must be an array`);
      } else if (!value.every(item => typeof item === 'string')) {
        errors.push(`process_handbook.runbooks.${key} must be an array of strings`);
      }
    }
  }
  
  if (ph.checklists && typeof ph.checklists !== 'object') {
    errors.push('process_handbook.checklists must be an object');
  } else if (ph.checklists) {
    // Check checklists structure
    for (const [key, value] of Object.entries(ph.checklists)) {
      if (!Array.isArray(value)) {
        errors.push(`process_handbook.checklists.${key} must be an array`);
      } else if (!value.every(item => typeof item === 'string')) {
        errors.push(`process_handbook.checklists.${key} must be an array of strings`);
      }
    }
  }
  
  return { valid: errors.length === 0, errors };
}

async function validateProcessJson(): Promise<void> {
  try {
    // Read the process.json file
    const processJsonPath = join(process.cwd(), 'docs', 'process.json');
    const processJsonContent = await readFile(processJsonPath, 'utf-8');
    
    // Parse JSON
    let processData: unknown;
    try {
      processData = JSON.parse(processJsonContent);
    } catch (parseError) {
      console.error('❌ Invalid JSON in docs/process.json');
      console.error(parseError);
      process.exit(1);
    }

    // Validate structure
    const result = validateProcessHandbook(processData);
    
    if (!result.valid) {
      console.error('❌ process.json validation failed:');
      console.error('Validation errors:');
      result.errors.forEach((error, index) => {
        console.error(`  ${index + 1}. ${error}`);
      });
      process.exit(1);
    }

    // Success
    const data = processData as any;
    console.log('✅ process.json valid');
    console.log(`   Version: ${data.process_handbook.version}`);
    console.log(`   Sections: ${Object.keys(data.process_handbook).length - 1} (excluding version)`);
    
  } catch (error) {
    console.error('❌ Error reading process.json:', error);
    process.exit(1);
  }
}

// Run validation
validateProcessJson().catch((error) => {
  console.error('❌ Validation script failed:', error);
  process.exit(1);
});
