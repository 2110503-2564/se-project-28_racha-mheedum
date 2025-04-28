const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Frontend Deployment Helper');
console.log('-----------------------------');
console.log('This script will help you deploy your frontend to Vercel.\n');

// Check if vercel CLI is installed
try {
  execSync('vercel --version', { stdio: 'ignore' });
} catch (error) {
  console.log('❌ Vercel CLI is not installed. Please install it using:');
  console.log('npm i -g vercel');
  process.exit(1);
}

// Check if .env.production exists and has the correct backend URL
const envProduction = fs.readFileSync('./.env.production', 'utf8');
if (!envProduction.includes('NEXT_PUBLIC_API_URL=https://2-fe-backend.vercel.app/api/v1')) {
  console.log('⚠️ Warning: Your .env.production file does not have the correct backend URL.');
  console.log('It should contain: NEXT_PUBLIC_API_URL=https://2-fe-backend.vercel.app/api/v1');
  
  rl.question('Do you want to update it now? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      fs.writeFileSync(
        './.env.production',
        'NEXT_PUBLIC_API_URL=https://2-fe-backend.vercel.app/api/v1\n' +
        'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}'
      );
      console.log('✅ .env.production updated successfully');
      continueDeployment();
    } else {
      console.log('⚠️ Continuing with existing .env.production configuration');
      continueDeployment();
    }
  });
} else {
  continueDeployment();
}

function continueDeployment() {
  console.log('\n📝 Before deploying, make sure you have:');
  console.log('1. Created a Vercel account');
  console.log('2. Prepared your Google Maps API key for production');
  
  rl.question('\nReady to deploy? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      console.log('\n🔄 Logging in to Vercel...');
      try {
        execSync('vercel login', { stdio: 'inherit' });
        
        console.log('\n🔄 Building project...');
        execSync('npm run build', { stdio: 'inherit' });
        
        console.log('\n🔄 Deploying to Vercel...');
        execSync('vercel', { stdio: 'inherit' });
        
        console.log('\n💡 To deploy to production, run:');
        console.log('vercel --prod');
        
        console.log('\n✅ Deployment process completed!');
        console.log('⚠️ Remember to add your environment variables in the Vercel dashboard:');
        console.log('  - NEXT_PUBLIC_API_URL: https://2-fe-backend.vercel.app/api/v1');
        console.log('  - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: Your Google Maps API key');
      } catch (error) {
        console.error('❌ An error occurred during deployment:', error);
      }
    } else {
      console.log('Deployment cancelled.');
    }
    rl.close();
  });
} 