const { exec } = require('child_process');
require('dotenv').config();

const PROJECT_DIR = process.env.PROJECT_DIR;
const BRANCH = process.env.BRANCH || 'main';
const PM2_NAME = process.env.PM2_NAME || 'express_template_server';
const DEPLOY_VARIANT = process.env.DEPLOY_VARIANT || 'vps';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Run shell command
function runCommand(cmd, cwd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd }, (err, stdout, stderr) => {
      if (err) return reject(err);
      console.log(stdout);
      console.error(stderr);
      resolve(stdout);
    });
  });
}

async function deploy() {
  try {
    console.log('Starting deployment...');
    
    const fs = require('fs');
    if (!fs.existsSync(PROJECT_DIR)) {
      console.log('Project not found. Cloning...');
      await runCommand(
        `git clone https://${GITHUB_TOKEN}@github.com/ms-vishwanath/express-template-server.git ${PROJECT_DIR}`,
        process.cwd()
      );
    }

    await runCommand(`git pull https://${GITHUB_TOKEN}@github.com/ms-vishwanath/express-template-server.git ${BRANCH}`, PROJECT_DIR);

    await runCommand('npm ci', PROJECT_DIR);
    await runCommand('npm run build', PROJECT_DIR);

    if (DEPLOY_VARIANT === 'vps') {
      await runCommand(`pm2 restart ${PM2_NAME} || pm2 start build/index.js --name ${PM2_NAME}`, PROJECT_DIR);
    }

    console.log('Deployment completed successfully.');
  } catch (err) {
    console.error('Deployment failed:', err);
  }
}

module.exports = deploy;
