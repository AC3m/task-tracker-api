# Docker Steps in GitHub Actions - Quick Reference

## Overview

Your GitHub Actions workflows include comprehensive Docker integration for building, testing, and publishing container images.

## Docker Steps Breakdown

### 1. **Docker Buildx Setup**

```yaml
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3
```

**Purpose:** Enables advanced Docker build features

- Multi-platform builds (AMD64 + ARM64)
- Build caching
- Efficient layer management

### 2. **Registry Authentication**

```yaml
- name: Log in to Container Registry
  uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}
```

**Purpose:** Authenticate with GitHub Container Registry

- Automatic using GITHUB_TOKEN
- No manual secrets needed
- Works for both public and private repos

### 3. **Metadata Extraction**

```yaml
- name: Extract metadata for Docker
  id: meta
  uses: docker/metadata-action@v5
  with:
    images: ghcr.io/${{ github.repository }}
    tags: |
      type=ref,event=branch
      type=ref,event=pr
      type=sha,prefix={{branch}}-
      type=raw,value=latest,enable={{is_default_branch}}
```

**Purpose:** Generate smart tags and labels

- Branch name tags (e.g., `main`, `develop`)
- Commit SHA tags (e.g., `main-abc1234`)
- PR tags (e.g., `pr-42`)
- `latest` tag for main branch only

### 4. **Docker Build**

```yaml
- name: Build Docker image
  uses: docker/build-push-action@v5
  with:
    context: .
    push: false
    load: true
    tags: ${{ steps.meta.outputs.tags }}
    labels: ${{ steps.meta.outputs.labels }}
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

**Purpose:** Build the container image

- Uses your existing Dockerfile
- Loads image for testing
- Leverages GitHub Actions cache
- Doesn't push yet (testing first)

### 5. **Container Testing**

```yaml
- name: Test Docker image
  run: |
    docker run -d --name test-container -p 8000:8000 $IMAGE_TAG
    sleep 5
    docker ps | grep test-container || exit 1
    docker stop test-container
```

**Purpose:** Verify the container works

- Starts the container
- Checks it's running
- Can test endpoints (optional)
- Cleans up after test

### 6. **Multi-Platform Push**

```yaml
- name: Push Docker image
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    platforms: linux/amd64,linux/arm64
    tags: ${{ steps.meta.outputs.tags }}
    cache-from: type=gha
```

**Purpose:** Build and push for multiple architectures

- Works on Intel/AMD servers
- Works on Apple Silicon (M1/M2/M3)
- Works on ARM servers
- Reuses cache from previous build

### 7. **Security Scanning**

```yaml
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: ghcr.io/${{ github.repository }}:${{ github.sha }}
    format: 'sarif'
    output: 'trivy-results.sarif'
```

**Purpose:** Scan for vulnerabilities

- Checks base image (node:23.11.0-alpine)
- Checks npm dependencies
- Uploads results to GitHub Security tab
- Scans OS packages

### 8. **SBOM Generation** (Release only)

```yaml
- name: Generate SBOM
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: ghcr.io/${{ github.repository }}:${{ steps.version.outputs.version }}
    format: 'cyclonedx'
    output: 'sbom.json'
```

**Purpose:** Create Software Bill of Materials

- Lists all components in your image
- Compliance and auditing
- Supply chain security
- Attached to GitHub releases

## Image Naming Convention

Your images follow this pattern:

```
ghcr.io/<username>/task-tracker-api:<tag>
```

**Available tags after CI runs:**

- `latest` (main branch only)
- `main` (main branch builds)
- `develop` (develop branch builds)
- `main-abc1234` (commit SHA)
- `pr-42` (pull request builds)

**Available tags after release:**

- `v1.0.0` (exact version)
- `v1.0` (minor version)
- `v1` (major version)
- `latest` (latest release)

## Cache Strategy

Your workflows use GitHub Actions cache:

```yaml
cache-from: type=gha
cache-to: type=gha,mode=max
```

**Benefits:**

- Faster builds (reuses layers)
- Free for public repos
- Automatic cleanup
- Per-branch caching

**First build:** ~2-3 minutes  
**Cached builds:** ~30-60 seconds

## Security Features

### 1. Non-Root User

Your Dockerfile already uses:

```dockerfile
USER node
```

### 2. Alpine Base

Smaller attack surface:

```dockerfile
FROM node:23.11.0-alpine
```

### 3. Production Dependencies Only

```dockerfile
npm ci --omit=dev
```

### 4. Multi-Stage Build

Final image only contains:

- Node.js runtime
- Production dependencies
- Compiled application
- No build tools or source TypeScript

## Using Your Docker Images

### Pull and run latest:

```bash
docker pull ghcr.io/<username>/task-tracker-api:latest
docker run -p 8000:8000 ghcr.io/<username>/task-tracker-api:latest
```

### Pull specific version:

```bash
docker pull ghcr.io/<username>/task-tracker-api:v1.0.0
docker run -p 8000:8000 ghcr.io/<username>/task-tracker-api:v1.0.0
```

### Use in docker-compose:

```yaml
services:
  api:
    image: ghcr.io/<username>/task-tracker-api:latest
    ports:
      - '8000:8000'
```

### Use in Kubernetes:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: task-tracker-api
spec:
  template:
    spec:
      containers:
        - name: api
          image: ghcr.io/<username>/task-tracker-api:v1.0.0
          ports:
            - containerPort: 8000
```

## Customization

### Enable Health Check Testing

1. Add to your app (src/app.ts):

```typescript
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
```

2. Uncomment in ci.yml:

```yaml
curl -f http://localhost:8000/health || exit 1
```

### Add Build Arguments

In your workflow:

```yaml
build-args: |
  NODE_ENV=production
  VERSION=${{ github.sha }}
```

In your Dockerfile:

```dockerfile
ARG VERSION=unknown
ENV APP_VERSION=${VERSION}
```

## Monitoring Your Builds

- **Actions Tab:** See workflow runs
- **Packages Tab:** See published images
- **Security Tab:** See vulnerability scans
- **Insights → Dependency graph:** See SBOM data

## Cost

GitHub Container Registry:

- **Public repos:** Free unlimited storage and bandwidth
- **Private repos:** Free for <500MB storage and 1GB bandwidth/month

GitHub Actions:

- **Public repos:** Unlimited minutes
- **Private repos:** 2,000 minutes/month free

Your workflows use ~3-5 minutes per run.
