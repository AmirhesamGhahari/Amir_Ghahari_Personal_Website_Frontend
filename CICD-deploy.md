# CI/CD Deployment Guide — GitHub → AWS → S3 + CloudFront

This file explains how to set up automated deployment for this website.
Every time you push code to the `main` branch on GitHub, AWS automatically
builds the site and deploys it to S3, then clears the CloudFront cache.

---

## The Big Picture

```
You push code to GitHub (main branch)
           ↓
   AWS CodePipeline detects the change
           ↓
   AWS CodeBuild runs your build steps
     → npm install
     → npm run build   (creates out/)
     → aws s3 sync out/ → your S3 bucket
     → aws cloudfront create-invalidation
           ↓
   Your live website is updated
```

---

## The AWS Services Involved

### 1. CodePipeline — The Orchestrator
Think of it as the "project manager." It watches your GitHub repo and kicks
off the workflow whenever code changes on `main`. It doesn't do any work
itself — it just coordinates the other services.

### 2. CodeBuild — The Build Server
This is where the actual work happens. AWS spins up a temporary Linux
computer, runs your commands (install, build, deploy to S3), then shuts
down. You define what commands to run in a file called `buildspec.yml`
that lives in your repo root.

### 3. S3 — Static File Storage
Your `out/` folder gets uploaded here. S3 serves the HTML files to visitors
(or to CloudFront).

### 4. CloudFront — The CDN
Sits in front of S3 and caches your files at servers around the world so
the site loads fast everywhere. When you deploy new files to S3, CloudFront
still serves the old cached version until you **invalidate** the cache —
that is the last step in the pipeline.

### 5. IAM — Permissions
CodeBuild needs permission to write to S3 and invalidate CloudFront. IAM
is how you grant that. You create a "role" (like a job title with specific
permissions) and assign it to CodeBuild.

### 6. CodeStar Connections — GitHub Bridge
The connector that lets CodePipeline listen to your GitHub repo for changes
and trigger the pipeline automatically on every push.

---

## How It All Connects

```
GitHub main branch
      ↓  (webhook via CodeStar Connections)
CodePipeline
      ↓  (triggers)
CodeBuild (runs buildspec.yml)
      ├── npm install
      ├── npm run build
      ├── aws s3 sync out/ → S3 bucket
      └── aws cloudfront create-invalidation
```

---

## The buildspec.yml File

This is the task list for CodeBuild — it tells AWS exactly what commands
to run and in what order. Create this file in your project root (same
level as `package.json`).

```yaml
# buildspec.yml
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 18        # tells CodeBuild which Node.js version to use
    commands:
      - npm install     # downloads node_modules

  build:
    commands:
      - npm run build   # generates the out/ folder

  post_build:
    commands:
      # copy out/ to your S3 bucket (--delete removes old files no longer in out/)
      - aws s3 sync out/ s3://YOUR-BUCKET-NAME --delete

      # tell CloudFront to forget its cache so visitors get the new files
      - aws cloudfront create-invalidation --distribution-id YOUR-DIST-ID --paths "/*"
```

Replace `YOUR-BUCKET-NAME` with your S3 bucket name and `YOUR-DIST-ID`
with your CloudFront distribution ID.

Each phase runs in order. If any command fails, the whole pipeline stops
and you get notified.

---

## Step-by-Step Setup

### Step 1: Set Up S3 Bucket

1. Go to AWS Console → S3 → **Create bucket**
2. Name it (e.g. `amir-ghahari-website`)
3. Uncheck **"Block all public access"** (the site needs to be publicly readable)
4. Enable **Static website hosting** in the bucket Properties tab
   - Index document: `index.html`
   - Error document: `404.html`
5. Add this bucket policy under Permissions → Bucket policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

### Step 2: Set Up CloudFront

1. Go to **CloudFront → Create distribution**
2. Origin domain: select your S3 bucket's **website endpoint**
   (looks like `your-bucket.s3-website-us-east-1.amazonaws.com`, not the regular S3 URL)
3. Default root object: `index.html`
4. Viewer protocol policy: **Redirect HTTP to HTTPS**
5. Create the distribution and note down the **Distribution ID** — you need
   this in `buildspec.yml`

### Step 3: Create an IAM Role for CodeBuild

CodeBuild needs permission to upload to S3 and clear the CloudFront cache.

1. Go to **IAM → Roles → Create role**
2. Trusted entity type: **AWS service**
3. Use case: **CodeBuild**
4. Attach these permission policies:
   - `AmazonS3FullAccess` (or create a scoped policy for just your bucket)
   - `CloudFrontFullAccess` (or at minimum `cloudfront:CreateInvalidation`)
5. Name the role (e.g. `CodeBuild-Website-Role`) and create it

### Step 4: Add buildspec.yml to Your Repo

Create `buildspec.yml` in your project root, fill in your real bucket name
and CloudFront distribution ID, then commit and push to GitHub.

### Step 5: Create a CodeBuild Project

1. Go to **CodeBuild → Create build project**
2. **Source:**
   - Source provider: GitHub
   - Connect via CodeStar Connections (follow the OAuth flow to authorize AWS)
   - Select your repository
   - Branch: `main`
3. **Environment:**
   - Environment image: Managed image
   - Operating system: Ubuntu
   - Runtime: Standard
   - Image: `aws/codebuild/standard:7.0` (latest)
4. **Buildspec:**
   - Select "Use a buildspec file" (it reads `buildspec.yml` from your repo)
5. **Service role:**
   - Select the IAM role you created in Step 3
6. Create the project

### Step 6: Create a CodePipeline

1. Go to **CodePipeline → Create pipeline**
2. Pipeline name: e.g. `website-deploy`
3. **Source stage:**
   - Source provider: GitHub (via CodeStar Connections)
   - Select your repo and `main` branch
   - Detection mode: Webhooks (triggers automatically on push)
4. **Build stage:**
   - Build provider: CodeBuild
   - Select the project you created in Step 5
5. **Deploy stage:** Skip it — CodeBuild handles the S3 upload directly
6. Create the pipeline

That's it. Every push to `main` now triggers the full pipeline automatically.

---

## Testing It

After setup, make a small change (e.g. edit `lib/config.ts`), commit, and
push to `main`. Then:

1. Go to **CodePipeline** and watch the pipeline run in real time
2. Click into the **Build** stage to see the CodeBuild logs
3. After it finishes, visit your CloudFront URL — the site should be updated

If the pipeline fails, the CodeBuild logs will show exactly which command
failed and why.

---

## Alternative: GitHub Actions (Simpler)

If you want to avoid setting up CodePipeline and CodeBuild, GitHub Actions
can do the same thing with less setup. The build commands are identical —
it's just a different place to run them.

Create `.github/workflows/deploy.yml` in your repo:

```yaml
name: Deploy to S3

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Install dependencies
        run: npm install

      - name: Build site
        run: npm run build

      - name: Deploy to S3
        run: aws s3 sync out/ s3://YOUR-BUCKET-NAME --delete
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_DEFAULT_REGION: us-east-1

      - name: Invalidate CloudFront cache
        run: aws cloudfront create-invalidation --distribution-id YOUR-DIST-ID --paths "/*"
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_DEFAULT_REGION: us-east-1
```

For GitHub Actions you need to create an IAM user (not a role) with S3
and CloudFront permissions, generate access keys for it, and store them
as secrets in your GitHub repo under Settings → Secrets → Actions.

### AWS CodePipeline vs GitHub Actions

| | AWS CodePipeline + CodeBuild | GitHub Actions |
|---|---|---|
| Setup complexity | More steps, all in AWS Console | Fewer steps, config lives in repo |
| Cost | CodeBuild charges per build minute | Free for public repos |
| IAM setup | Role (no access keys needed) | IAM user + access keys |
| Best for | Teams already deep in AWS | Simpler projects, GitHub-first teams |

Both approaches produce the exact same result. For a personal portfolio
site, GitHub Actions is usually the faster path to get running.

---

## Quick Reference

| Thing to find | Where |
|---|---|
| S3 bucket name | AWS Console → S3 |
| CloudFront Distribution ID | AWS Console → CloudFront → your distribution |
| CodeBuild logs | AWS Console → CodeBuild → Build history |
| Pipeline status | AWS Console → CodePipeline |
| GitHub Actions logs | GitHub → your repo → Actions tab |
