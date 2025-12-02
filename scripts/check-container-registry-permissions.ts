/**
 * Check Container Registry permissions for service account
 * Usage: npm run check:registry-permissions
 */

import { execSync } from 'child_process';
import * as fs from 'fs';

function checkYandexCLI(): boolean {
  try {
    execSync('yc --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function getServiceAccountId(): string | null {
  try {
    const config = execSync('yc config get service-account-id', {
      encoding: 'utf-8',
      stdio: 'pipe'
    }).trim();
    return config || null;
  } catch {
    return null;
  }
}

function getFolderId(): string | null {
  try {
    const config = execSync('yc config get folder-id', {
      encoding: 'utf-8',
      stdio: 'pipe'
    }).trim();
    return config || null;
  } catch {
    return null;
  }
}

function checkServiceAccountRoles(serviceAccountId: string, folderId: string): void {
  console.log('🔍 Checking service account roles...\n');
  
  try {
    const result = execSync(
      `yc resource-manager folder list-access-bindings ${folderId} --format json`,
      { encoding: 'utf-8', stdio: 'pipe' }
    );
    
    const bindings = JSON.parse(result);
    const saBindings = bindings.bindings?.filter((b: any) => 
      b.subject?.id === serviceAccountId || b.subject?.id?.includes(serviceAccountId)
    );
    
    if (saBindings && saBindings.length > 0) {
      console.log('✅ Service account roles:');
      saBindings.forEach((binding: any) => {
        console.log(`   - ${binding.role}`);
      });
      
      const hasEditorRole = saBindings.some((b: any) => 
        b.role === 'container-registry.editor' || 
        b.role === 'container-registry.admin' ||
        b.role === 'editor' ||
        b.role === 'admin'
      );
      
      if (!hasEditorRole) {
        console.log('\n❌ Service account does NOT have container-registry.editor role!');
        console.log('\n💡 Add the role:');
        console.log(`   yc resource-manager folder add-access-binding ${folderId} \\`);
        console.log(`     --role container-registry.editor \\`);
        console.log(`     --subject serviceAccount:${serviceAccountId}`);
      } else {
        console.log('\n✅ Service account has required permissions!');
      }
    } else {
      console.log('❌ No roles found for service account');
      console.log('\n💡 Add the role:');
      console.log(`   yc resource-manager folder add-access-binding ${folderId} \\`);
      console.log(`     --role container-registry.editor \\`);
      console.log(`     --subject serviceAccount:${serviceAccountId}`);
    }
  } catch (error: any) {
    console.error('❌ Failed to check roles');
    console.error(`   Error: ${error.message}`);
  }
}

function checkRegistryAccess(registryId: string): void {
  console.log('\n🔍 Checking registry access...\n');
  
  try {
    const result = execSync(
      `yc container registry get --id ${registryId} --format json`,
      { encoding: 'utf-8', stdio: 'pipe' }
    );
    
    const registry = JSON.parse(result);
    console.log(`✅ Registry found: ${registry.name} (${registry.id})`);
    console.log(`   Folder ID: ${registry.folder_id}`);
    
    return registry.folder_id;
  } catch (error: any) {
    console.error('❌ Failed to access registry');
    console.error(`   Error: ${error.message}`);
    return null;
  }
}

function main() {
  console.log('🔐 Container Registry Permissions Checker\n');
  console.log('='.repeat(50) + '\n');
  
  if (!checkYandexCLI()) {
    console.error('❌ Yandex Cloud CLI (yc) is not installed!');
    process.exit(1);
  }
  
  const serviceAccountId = getServiceAccountId();
  const folderId = getFolderId();
  
  if (!serviceAccountId) {
    console.error('❌ Service account ID not found in yc config!');
    console.error('💡 Run: yc config set service-account-key /path/to/key.json');
    process.exit(1);
  }
  
  if (!folderId) {
    console.error('❌ Folder ID not found in yc config!');
    console.error('💡 Run: yc config set folder-id <folder-id>');
    process.exit(1);
  }
  
  console.log(`Service Account ID: ${serviceAccountId}`);
  console.log(`Folder ID: ${folderId}\n`);
  
  // Check registry
  const registryId = process.env.YC_REGISTRY_ID || process.env.CR_REGISTRY_ID;
  if (registryId) {
    const registryFolderId = checkRegistryAccess(registryId);
    if (registryFolderId && registryFolderId !== folderId) {
      console.log(`\n⚠️  Registry is in different folder (${registryFolderId})`);
      console.log('   Make sure service account has access to that folder too!');
    }
  } else {
    console.log('⚠️  YC_REGISTRY_ID not set, skipping registry check');
  }
  
  // Check roles
  checkServiceAccountRoles(serviceAccountId, folderId);
  
  console.log('\n' + '='.repeat(50));
  console.log('\n✅ Check completed!\n');
}

main();

