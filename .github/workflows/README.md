# GitHub Actions Workflows Documentation

This directory contains CI/CD workflows for the task-tracker-api project with comprehensive Docker integration.

## Workflows Overview

### 1. CI/CD Pipeline (`ci.yml`)

**Triggers:**

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**

#### Build and Test

- Sets up Node.js environment
- Installs dependencies with npm ci
- Runs Prettier code formatting checks
- Builds TypeScript code
- Uploads build artifacts

#### Docker

- Builds Docker image using multi-stage Dockerfile
- Tests the Docker container (starts and verifies it runs)
- Pushes image to GitHub Container Registry (ghcr.io)
- Creates multiple tags: branch name, SHA, and latest (for main branch)
- Builds for multiple platforms (linux/amd64, linux/arm64)
- Uses GitHub Actions cache for faster builds

### 2. Release Workflow (`release.yml`)

**Triggers:**

- GitHub Release publication
- Manual workflow dispatch with version input

**Features:**

- Creates semantic version tags (v1.0.0, v1.0, v1, latest)
- Builds multi-platform Docker images
- Generates Software Bill of Materials (SBOM)
- Attaches SBOM to GitHub release

## Docker Steps Included

### Build Optimization

- **Docker Buildx**: Multi-platform builds (AMD64 + ARM64)
- **Layer Caching**: GitHub Actions cache for faster rebuilds
- **Multi-stage Build**: Your Dockerfile already uses this for smaller images

### Testing

- Container startup verification
- Health check capability (commented out, ready to enable)
- Log inspection on failure

### Registry

- **GitHub Container Registry**: Free for public repos, included with GitHub
- **Automatic Authentication**: Uses GITHUB_TOKEN
- **Smart Tagging**: Branch names, SHAs, semantic versions

## Setup Instructions

### 1. Enable GitHub Container Registry

The workflows are configured to use GitHub Container Registry (ghcr.io). No additional setup needed - it uses the built-in `GITHUB_TOKEN`.

### 2. Make Your First Push

```bash
git add .github/
git commit -m "Add GitHub Actions workflows with Docker support"
git push origin main
```

### 3. View Your Workflow

1. Go to your repository on GitHub
2. Click the "Actions" tab
3. Watch your workflow run

### 4. Access Your Docker Images

After successful builds, your images will be available at:

```
ghcr.io/<your-username>/task-tracker-api:latest
ghcr.io/<your-username>/task-tracker-api:main-<sha>
```

To pull and run:

```bash
docker pull ghcr.io/<your-username>/task-tracker-api:latest
docker run -p 8000:8000 ghcr.io/<your-username>/task-tracker-api:latest
```

### 5. Create a Release (Optional)

To trigger the release workflow:

**Option A: GitHub UI**

1. Go to Releases → Draft a new release
2. Create a new tag (e.g., v1.0.0)
3. Publish release

**Option B: Command Line**

```bash
git tag v1.0.0
git push origin v1.0.0
gh release create v1.0.0 --title "Version 1.0.0" --notes "Initial release"
```

## Configuration Options

### Add Health Check Endpoint

Uncomment this section in `ci.yml` to test your API endpoint:

```yaml
# Test the endpoint
curl -f http://localhost:8000/health || exit 1
```

First, add a health endpoint to your Express app:

```typescript
// In src/app.ts or src/routes/
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

### Use Different Registry

To use Docker Hub instead of ghcr.io:

1. Add Docker Hub credentials as GitHub secrets:
   - `DOCKERHUB_USERNAME`
   - `DOCKERHUB_TOKEN`

2. Update the workflows:

```yaml
env:
  REGISTRY: docker.io
  IMAGE_NAME: <your-dockerhub-username>/task-tracker-api
```

3. Update login action:

```yaml
- name: Log in to Docker Hub
  uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKERHUB_USERNAME }}
    password: ${{ secrets.DOCKERHUB_TOKEN }}
```

### Add Tests

If you add tests to your project, add this step before "Build TypeScript":

```yaml
- name: Run tests
  run: npm test
```

### Environment Variables

To pass build-time variables to Docker:

```yaml
- name: Build and push Docker image
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    build-args: |
      NODE_ENV=production
      API_VERSION=${{ steps.version.outputs.version }}
```

## Workflow Badges

Add these badges to your README.md:

```markdown
![CI/CD](https://github.com/<username>/task-tracker-api/actions/workflows/ci.yml/badge.svg)
![Release](https://github.com/<username>/task-tracker-api/actions/workflows/release.yml/badge.svg)
```

## Troubleshooting

### Build Fails: "Permission denied"

Enable GitHub Actions in repository settings:
Settings → Actions → General → Allow all actions

### Cannot Push to Registry

Check that `packages: write` permission is granted in the workflow (already configured).

### Cache Not Working

GitHub Actions cache is automatic. If builds are slow, verify:

- Cache keys are consistent
- Layer order in Dockerfile is optimized

## Best Practices Implemented

✅ **Multi-stage builds** - Smaller final images  
✅ **Layer caching** - Faster rebuilds  
✅ **Multi-platform builds** - Works on Apple Silicon and x86  
✅ **Semantic versioning** - Proper release tagging  
✅ **SBOM generation** - Software supply chain transparency  
✅ **Least privilege** - Non-root user in container  
✅ **Dependency caching** - npm cache for faster installs

## Next Steps

1. **Add automated tests** - Integrate unit/integration tests
2. **Set up staging environment** - Deploy to staging on develop branch
3. **Add deployment workflow** - Auto-deploy to production on release
4. **Implement rollback** - Quick rollback capability
5. **Add monitoring** - Integrate with monitoring services
6. **Secrets management** - Use GitHub Environments for production secrets

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
