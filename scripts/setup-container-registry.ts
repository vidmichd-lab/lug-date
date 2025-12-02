/**
 * Setup Container Registry and add CR_REGISTRY_ID to GitHub Secrets
 * Usage: npm run setup:container-registry
 * 
 * This script:
 * 1. Creates Container Registry in Yandex Cloud (if not exists)
 * 2. Gets registry ID
 * 3. Adds CR_REGISTRY_ID to GitHub Secrets
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const REGISTRY_NAME = 'dating-app-registry';

function checkYandexCLI(): boolean {
  try {
    execSync('yc --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function checkGitHubCLI(): boolean {
  try {
    execSync('gh --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function getRegistryId(): string | null {
  try {
    console.log('🔍 Checking for existing Container Registry...\n');
    
    // Try to find existing registry
    const result = execSync(
      `yc container registry list --format json`,
      { encoding: 'utf-8', stdio: 'pipe' }
    );
    
    const registries = JSON.parse(result);
    const existing = registries.find((r: any) => r.name === REGISTRY_NAME);
    
    if (existing) {
      console.log(`✅ Found existing registry: ${REGISTRY_NAME}`);
      console.log(`   ID: ${existing.id}\n`);
      return existing.id;
    }
    
    return null;
  } catch (error: any) {
    // Registry might not exist, that's OK
    return null;
  }
}

function createRegistry(): string {
  try {
    console.log(`📦 Creating Container Registry: ${REGISTRY_NAME}...\n`);
    
    const result = execSync(
      `yc container registry create --name ${REGISTRY_NAME} --format json`,
      { encoding: 'utf-8', stdio: 'pipe' }
    );
    
    const registry = JSON.parse(result);
    console.log(`✅ Container Registry created successfully!`);
    console.log(`   ID: ${registry.id}\n`);
    
    return registry.id;
  } catch (error: any) {
    console.error('❌ Failed to create Container Registry');
    console.error(`   Error: ${error.message}`);
    
    // Try to parse error and get ID if registry already exists
    if (error.message.includes('already exists')) {
      console.log('   Registry might already exist, trying to get ID...');
      const id = getRegistryId();
      if (id) {
        return id;
      }
    }
    
    throw error;
  }
}

function addSecretToGitHub(registryId: string): void {
  try {
    console.log('🔐 Adding YC_REGISTRY_ID to GitHub Secrets...\n');
    
    // Check if secret already exists
    try {
      const existing = execSync(
        `gh secret list --json name --jq '.[] | select(.name == "YC_REGISTRY_ID") | .name'`,
        { encoding: 'utf-8', stdio: 'pipe' }
      ).trim();
      
      if (existing === 'YC_REGISTRY_ID') {
        console.log('⚠️  Secret YC_REGISTRY_ID already exists');
        console.log('   Updating with new value...\n');
      }
    } catch {
      // Secret doesn't exist, that's OK
    }
    
    // Set secret
    execSync(
      `echo "${registryId}" | gh secret set YC_REGISTRY_ID`,
      { stdio: 'inherit' }
    );
    
    console.log('✅ Secret YC_REGISTRY_ID added to GitHub!\n');
  } catch (error: any) {
    console.error('❌ Failed to add secret to GitHub');
    console.error(`   Error: ${error.message}`);
    console.error('\n💡 You can add it manually:');
    console.error(`   gh secret set YC_REGISTRY_ID --body "${registryId}"`);
    throw error;
  }
}

function verifySetup(registryId: string): void {
  console.log('🔍 Verifying setup...\n');
  
  try {
    // Verify registry exists
    const result = execSync(
      `yc container registry get --id ${registryId} --format json`,
      { encoding: 'utf-8', stdio: 'pipe' }
    );
    
    const registry = JSON.parse(result);
    console.log(`✅ Registry verified: ${registry.name} (${registry.id})`);
  } catch (error: any) {
    console.error('⚠️  Could not verify registry');
    console.error(`   Error: ${error.message}`);
  }
  
  try {
    // Verify GitHub secret
    const secret = execSync(
      `gh secret list --json name --jq '.[] | select(.name == "YC_REGISTRY_ID") | .name'`,
      { encoding: 'utf-8', stdio: 'pipe' }
    ).trim();
    
    if (secret === 'YC_REGISTRY_ID') {
      console.log('✅ GitHub secret verified');
    } else {
      console.log('⚠️  GitHub secret not found');
    }
  } catch (error: any) {
    console.error('⚠️  Could not verify GitHub secret');
    console.error(`   Error: ${error.message}`);
  }
}

function main() {
  console.log('🚀 Container Registry Setup\n');
  console.log('='.repeat(50) + '\n');
  
  // Check prerequisites
  if (!checkYandexCLI()) {
    console.error('❌ Yandex Cloud CLI (yc) is not installed!');
    console.error('\n📝 Install it:');
    console.error('   curl -sSL https://storage.yandexcloud.net/yandexcloud-yc/install.sh | bash');
    console.error('\n💡 After installation, initialize:');
    console.error('   yc init');
    process.exit(1);
  }
  
  if (!checkGitHubCLI()) {
    console.error('❌ GitHub CLI (gh) is not installed!');
    console.error('\n📝 Install it:');
    console.error('   macOS: brew install gh');
    console.error('   Linux: See https://cli.github.com/');
    console.error('\n💡 After installation, authenticate:');
    console.error('   gh auth login');
    process.exit(1);
  }
  
  // Check authentication
  try {
    execSync('yc config list', { stdio: 'ignore' });
  } catch {
    console.error('❌ Not authenticated with Yandex Cloud CLI!');
    console.error('\n💡 Run: yc init');
    process.exit(1);
  }
  
  try {
    execSync('gh auth status', { stdio: 'ignore' });
  } catch {
    console.error('❌ Not authenticated with GitHub CLI!');
    console.error('\n💡 Run: gh auth login');
    process.exit(1);
  }
  
  // Get or create registry
  let registryId = getRegistryId();
  
  if (!registryId) {
    registryId = createRegistry();
  }
  
  // Add to GitHub Secrets
  try {
    addSecretToGitHub(registryId);
  } catch (error) {
    console.error('\n⚠️  Setup completed, but GitHub secret was not added.');
    console.error(`\n📝 Please add manually:\n   gh secret set CR_REGISTRY_ID --body "${registryId}"`);
    process.exit(1);
  }
  
  // Verify
  verifySetup(registryId);
  
  console.log('\n' + '='.repeat(50));
  console.log('\n✅ Setup completed successfully!\n');
  console.log(`📦 Container Registry ID: ${registryId}`);
  console.log('🔐 GitHub Secret: YC_REGISTRY_ID\n');
  console.log('🚀 You can now deploy backend using Docker images!\n');
}

main();

