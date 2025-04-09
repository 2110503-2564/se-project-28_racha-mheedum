const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Vercel Deployment Helper');
console.log('---------------------------');
console.log('This script will help you deploy your backend to Vercel.\n');

// Check if vercel CLI is installed
try {
  execSync('vercel --version', { stdio: 'ignore' });
} catch (error) {
  console.log('❌ Vercel CLI is not installed. Please install it using:');
  console.log('npm i -g vercel');
  process.exit(1);
}

// Check if vercel.json exists
if (!fs.existsSync('./vercel.json')) {
  console.log('❌ vercel.json not found. Please create it first.');
  process.exit(1);
}

// Deployment process
console.log('✅ Vercel CLI is installed');
console.log('✅ vercel.json found\n');

console.log('📝 Before deploying, make sure you have:');
console.log('1. Created a Vercel account');
console.log('2. Prepared environment variables for Vercel');
console.log('   (MONGODB_URI, JWT_SECRET, etc.)\n');

rl.question('Ready to deploy? (y/n): ', (answer) => {
  if (answer.toLowerCase() === 'y') {
    console.log('\n🔄 Logging in to Vercel...');
    try {
      execSync('vercel login', { stdio: 'inherit' });
      
      console.log('\n🔄 Deploying to Vercel...');
      execSync('vercel', { stdio: 'inherit' });
      
      console.log('\n💡 To deploy to production, run:');
      console.log('vercel --prod');
      
      console.log('\n✅ Deployment process completed!');
      console.log('⚠️ Remember to add your environment variables in the Vercel dashboard');
      console.log('⚠️ Update the CORS settings in server.js with your frontend domain');
    } catch (error) {
      console.error('❌ An error occurred during deployment:', error);
    }
  } else {
    console.log('Deployment cancelled.');
  }
  rl.close();
}); 