# ── CI/CD Configuration ───────────────────────────────────────────────────────
# Edit the values in this file. Then run ./infra/deploy.sh to bootstrap.
# AWS credentials are NOT stored here — they come from running: aws configure
# ─────────────────────────────────────────────────────────────────────────────

# GitHub
GITHUB_OWNER="AmirhesamGhahari"
GITHUB_REPO="Amir_Ghahari_Personal_Website_Frontend"
GITHUB_BRANCH="main"

# S3 bucket names — must be globally unique across all AWS accounts
WEBSITE_BUCKET_NAME="amir-ghahari-website-frontend-resources"
ARTIFACT_BUCKET_NAME="amir-ghahari-frontend-pipeline-artifacts"

# CloudFormation stack names — what the stacks will be called in AWS
CICD_STACK_NAME="amir-ghahari-frontend-cicd"
FRONTEND_STACK_NAME="amir-ghahari-website-frontend"

# AWS region to deploy everything into
AWS_REGION="ca-central-1"
