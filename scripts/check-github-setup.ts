/**
 * Check GitHub setup for deployment
 * Usage: npm run check:github-setup
 * 
 * This script checks if all required GitHub secrets and environments are configured
 */

import { execSync } from 'child_process';

interface Secret {
  name: string;
  required: boolean;
  description: string;
}

interface Environment {
  name: string;
  required: boolean;
}

const REQUIRED_SECRETS: Secret[] = [
  { name: 'YC_SERVICE_ACCOUNT_KEY', required: true, description: 'Yandex Cloud service account JSON key' },
  { name: 'TELEGRAM_BOT_TOKEN_DEV', required: true, description: 'Telegram bot token for staging' },
  { name: 'TELEGRAM_BOT_TOKEN_PROD', required: true, description: 'Telegram bot token for production' },
  { name: 'YDB_ENDPOINT_DEV', required: true, description: 'YDB endpoint for staging' },
  { name: 'YDB_DATABASE_DEV', required: true, description: 'YDB database path for staging' },
  { name: 'YDB_TOKEN_DEV', required: false, description: 'YDB token for staging (optional if YC_SERVICE_ACCOUNT_KEY is set)' },
  { name: 'YDB_ENDPOINT_PROD', required: true, description: 'YDB endpoint for production' },
  { name: 'YDB_DATABASE_PROD', required: true, description: 'YDB database path for production' },
  { name: 'YDB_TOKEN_PROD', required: false, description: 'YDB token for production (optional if YC_SERVICE_ACCOUNT_KEY is set)' },
  { name: 'YANDEX_STORAGE_BUCKET_DEV', required: true, description: 'Object Storage bucket for staging' },
  { name: 'YANDEX_STORAGE_ACCESS_KEY_DEV', required: true, description: 'Object Storage access key for staging' },
  { name: 'YANDEX_STORAGE_SECRET_KEY_DEV', required: true, description: 'Object Storage secret key for staging' },
  { name: 'YANDEX_STORAGE_BUCKET_PROD', required: true, description: 'Object Storage bucket for production' },
  { name: 'YANDEX_STORAGE_ACCESS_KEY_PROD', required: true, description: 'Object Storage access key for production' },
  { name: 'YANDEX_STORAGE_SECRET_KEY_PROD', required: true, description: 'Object Storage secret key for production' },
  { name: 'TELEGRAM_ALERT_BOT_TOKEN', required: false, description: 'Telegram alert bot token' },
  { name: 'TELEGRAM_ALERT_CHAT_ID', required: false, description: 'Telegram alert chat ID' },
  { name: 'CR_REGISTRY_ID', required: true, description: 'Yandex Container Registry ID for Docker images' },
];

const REQUIRED_ENVIRONMENTS: Environment[] = [
  { name: 'staging', required: true },
  { name: 'production', required: true },
];

function checkGitHubCLI(): boolean {
  try {
    execSync('gh --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function checkSecrets(): { missing: Secret[]; found: Secret[] } {
  const missing: Secret[] = [];
  const found: Secret[] = [];

  console.log('🔍 Checking GitHub Secrets...\n');

  for (const secret of REQUIRED_SECRETS) {
    try {
      const result = execSync(
        `gh secret list --json name --jq '.[] | select(.name == "${secret.name}") | .name'`,
        { encoding: 'utf-8', stdio: 'pipe' }
      ).trim();

      if (result === secret.name) {
        found.push(secret);
        console.log(`  ✅ ${secret.name}`);
      } else {
        if (secret.required) {
          missing.push(secret);
          console.log(`  ❌ ${secret.name} (REQUIRED)`);
        } else {
          console.log(`  ⚠️  ${secret.name} (optional, not set)`);
        }
      }
    } catch (error) {
      if (secret.required) {
        missing.push(secret);
        console.log(`  ❌ ${secret.name} (REQUIRED)`);
      } else {
        console.log(`  ⚠️  ${secret.name} (optional, not set)`);
      }
    }
  }

  return { missing, found };
}

function checkEnvironments(): { missing: Environment[]; found: Environment[] } {
  const missing: Environment[] = [];
  const found: Environment[] = [];

  console.log('\n🌍 Checking GitHub Environments...\n');

  try {
    const result = execSync('gh api repos/:owner/:repo/environments', {
      encoding: 'utf-8',
      stdio: 'pipe',
    });

    const environments = JSON.parse(result);

    for (const env of REQUIRED_ENVIRONMENTS) {
      const exists = environments.environments?.some((e: any) => e.name === env.name);
      
      if (exists) {
        found.push(env);
        console.log(`  ✅ ${env.name}`);
      } else {
        missing.push(env);
        console.log(`  ❌ ${env.name} (REQUIRED)`);
      }
    }
  } catch (error) {
    console.log('  ⚠️  Could not check environments (may need authentication)');
    for (const env of REQUIRED_ENVIRONMENTS) {
      missing.push(env);
      console.log(`  ❌ ${env.name} (REQUIRED)`);
    }
  }

  return { missing, found };
}

function main() {
  console.log('🔧 GitHub Deployment Setup Checker\n');
  console.log('=' .repeat(50) + '\n');

  // Check if GitHub CLI is installed
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
    execSync('gh auth status', { stdio: 'ignore' });
  } catch {
    console.error('❌ Not authenticated with GitHub CLI!');
    console.error('\n💡 Run: gh auth login');
    process.exit(1);
  }

  // Check secrets
  const { missing: missingSecrets, found: foundSecrets } = checkSecrets();

  // Check environments
  const { missing: missingEnvs, found: foundEnvs } = checkEnvironments();

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Summary:\n');

  const requiredMissing = missingSecrets.filter((s) => s.required);
  const optionalMissing = missingSecrets.filter((s) => !s.required);

  console.log(`Secrets:`);
  console.log(`  ✅ Found: ${foundSecrets.length}/${REQUIRED_SECRETS.length}`);
  console.log(`  ❌ Missing (required): ${requiredMissing.length}`);
  console.log(`  ⚠️  Missing (optional): ${optionalMissing.length}`);

  console.log(`\nEnvironments:`);
  console.log(`  ✅ Found: ${foundEnvs.length}/${REQUIRED_ENVIRONMENTS.length}`);
  console.log(`  ❌ Missing: ${missingEnvs.length}`);

  if (requiredMissing.length > 0) {
    console.log('\n❌ Missing required secrets:');
    requiredMissing.forEach((secret) => {
      console.log(`   - ${secret.name}: ${secret.description}`);
    });
  }

  if (missingEnvs.length > 0) {
    console.log('\n❌ Missing environments:');
    missingEnvs.forEach((env) => {
      console.log(`   - ${env.name}`);
    });
  }

  if (requiredMissing.length === 0 && missingEnvs.length === 0) {
    console.log('\n✅ All required secrets and environments are configured!');
    console.log('\n🚀 You can now deploy:');
    console.log('   - Push to develop branch for staging');
    console.log('   - Push to main branch for production');
    process.exit(0);
  } else {
    console.log('\n⚠️  Please configure missing items before deploying.');
    console.log('\n📖 See: docs/GITHUB_DEPLOY_SETUP.md');
    process.exit(1);
  }
}

main();

