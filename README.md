# Auto Deploy Git

A simple webhook-based CI/CD system for automatic deployment of GitHub repositories.

## Environment Variables

Create a `.env` file in the project root with the following variables:

### Required Variables
- `GITHUB_USERNAME` - Your GitHub username
- `GITHUB_TOKEN` - Your GitHub personal access token
- `PROJECT_DIR` - Path to the project directory where the repository will be cloned

### Optional Variables
- `BRANCH` - Git branch to deploy (default: `main`)
- `PM2_NAME` - PM2 process name for VPS deployment (default: `express_template_server`)
- `DEPLOY_VARIANT` - Deployment type (default: `vps`)
- `WEBHOOK_SECRET` - Secret for webhook verification
- `PORT` - Webhook server port (default: `9000`)

## Usage

1. Set up your environment variables in a `.env` file
2. Run `npm start` to start the webhook server
3. Configure your GitHub repository webhook to point to your server's `/webhook` endpoint

## Features

- Automatic repository cloning on first deployment
- Git pull for updates
- NPM install and build
- PM2 process management for VPS deployments
- Webhook-based triggering
