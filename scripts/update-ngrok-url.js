#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function getNgrokUrl() {
  try {
    const response = await fetch('http://127.0.0.1:4040/api/tunnels');
    const data = await response.json();
    
    const httpsTunnel = data.tunnels.find(tunnel => 
      tunnel.proto === 'https' && tunnel.config.addr === 'localhost:8070'
    );
    
    if (httpsTunnel) {
      return httpsTunnel.public_url;
    }
    
    throw new Error('No HTTPS tunnel found for localhost:8070');
  } catch (error) {
    console.error('Error fetching ngrok URL:', error.message);
    console.log('Make sure ngrok is running on port 4040');
    return null;
  }
}

async function updateBotEnv(newUrl) {
  const botEnvPath = path.join(__dirname, 'apps', 'bot', '.env');
  
  try {
    let envContent = fs.readFileSync(botEnvPath, 'utf8');
    
    // Update the PUBLIC_WEBAPP_URL
    const urlRegex = /PUBLIC_WEBAPP_URL=.*/;
    if (urlRegex.test(envContent)) {
      envContent = envContent.replace(urlRegex, `PUBLIC_WEBAPP_URL=${newUrl}`);
    } else {
      envContent += `\nPUBLIC_WEBAPP_URL=${newUrl}`;
    }
    
    fs.writeFileSync(botEnvPath, envContent);
    console.log(`✅ Updated bot .env with new URL: ${newUrl}`);
    
    return true;
  } catch (error) {
    console.error('Error updating bot .env:', error.message);
    return false;
  }
}

async function restartBot() {
  console.log('🔄 Restarting bot...');
  
  // Kill existing bot process if running
  spawn('pkill', ['-f', 'bot.*dev'], { stdio: 'inherit' });
  
  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Start bot again
  const botProcess = spawn('pnpm', ['--filter', '@analyzer/bot', 'dev'], {
    stdio: 'inherit',
    cwd: __dirname
  });
  
  console.log('✅ Bot restarted!');
}

async function main() {
  console.log('🔍 Checking for ngrok URL...');
  
  const ngrokUrl = await getNgrokUrl();
  
  if (!ngrokUrl) {
    console.log('❌ Could not fetch ngrok URL. Please make sure ngrok is running.');
    process.exit(1);
  }
  
  console.log(`🌐 Found ngrok URL: ${ngrokUrl}`);
  
  const updated = await updateBotEnv(ngrokUrl);
  
  if (updated) {
    await restartBot();
    console.log('🎉 Bot updated and restarted with new ngrok URL!');
  } else {
    console.log('❌ Failed to update bot configuration.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { getNgrokUrl, updateBotEnv };