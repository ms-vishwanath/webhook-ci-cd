const { exec } = require('child_process');
const fs = require('fs');
require('dotenv').config();

const PROJECT_DIR = process.env.PROJECT_DIR;
const BRANCH = process.env.BRANCH || 'main';
const PM2_NAME = process.env.PM2_NAME || 'express_template_server';
const DEPLOY_VARIANT = process.env.DEPLOY_VARIANT || 'vps';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const GITHUB_REPO_NAME = process.env.GITHUB_REPO_NAME || 'express-template-server';

// Run shell command
function runCommand(cmd, cwd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd, shell: '/bin/bash' }, (err, stdout, stderr) => {
      if (err) return reject(new Error(stderr || err.message));
      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);
      resolve(stdout);
    });
  });
}

async function deploy() {
  try {
    console.log('Starting deployment...');

    // Validate required environment variables
    if (!GITHUB_USERNAME) throw new Error('GITHUB_USERNAME environment variable is required');
    if (!GITHUB_TOKEN) throw new Error('GITHUB_TOKEN environment variable is required');
    if (!PROJECT_DIR) throw new Error('PROJECT_DIR environment variable is required');

    // Clone repo if not exists
    if (!fs.existsSync(PROJECT_DIR) || !fs.existsSync(`${PROJECT_DIR}/.git`)) {
      console.log('Project not found or not a git repo. Cloning...');
      await runCommand(
        `git clone https://${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${GITHUB_REPO_NAME}.git ${PROJECT_DIR}`,
        process.cwd()
      );
    } else {
      console.log('Git repository exists. Fetching latest changes...');
      await runCommand('git fetch --all', PROJECT_DIR);
      await runCommand(`git reset --hard origin/${BRANCH}`, PROJECT_DIR);
    }

    console.log('Installing dependencies...');
    await runCommand('npm ci', PROJECT_DIR);

    console.log('Building project...');
    await runCommand('npm run build', PROJECT_DIR);

    if (DEPLOY_VARIANT === 'vps') {
      console.log('Restarting PM2 process...');
      try {
        await runCommand(`pm2 restart ${PM2_NAME}`, PROJECT_DIR);
      } catch {
        await runCommand(`pm2 start build/index.js --name ${PM2_NAME}`, PROJECT_DIR);
      }
    }

    console.log('Deployment completed successfully.');
  } catch (err) {
    console.error('Deployment failed:', err.message);
  }
}

module.exports = deploy;
