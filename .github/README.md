# GitHub CI/CD Deployment for Development

This project uses GitHub Actions for continuous integration and deployment to the dev.sanad.selimsalman.de development server.

## Required Secrets

For the development environment, we've minimized the required secrets to just:

1. `SSH_PRIVATE_KEY`: The SSH private key for deployment user with access to the server
2. `DEPLOY_USER`: The SSH username on the deployment server

## Setting Up GitHub Secrets

1. Go to your GitHub repository
2. Click on "Settings" tab
3. Click on "Secrets and variables" → "Actions" in the left sidebar
4. Click on "New repository secret" to add each secret

## SSH Key Generation (if needed)

If you need to generate a new SSH key for deployment:

```bash
# Generate a key
ssh-keygen -t ed25519 -C "github-deploy-key"

# Copy the public key to the server
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@selimsalman.de

# Copy the private key to add as a GitHub secret
cat ~/.ssh/id_ed25519
```

Make sure the user has appropriate permissions on the server.

## Server Setup

The development server needs to have:

1. Docker and Docker Compose installed
2. A directory at `/var/www/dev.sanad.selimsalman.de` (or change DEPLOY_PATH in the workflow)
3. Proper domain configuration for dev.sanad.selimsalman.de

## Development Workflow

The deployment is triggered when code is pushed to the `develop` branch. The workflow:

1. Builds the frontend and prepares the backend
2. Deploys to the development server
3. Uses simplified configuration with non-sensitive default values
4. Runs the application in development mode using `dev.sh --local` 