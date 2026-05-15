#!/bin/bash
# Bootstrap script — run this once to create the CI/CD stack.
# After that, every git push to main triggers the pipeline automatically.
# Usage: ./infra/deploy.sh
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"

echo ""
echo "Deploying CI/CD stack: $CICD_STACK_NAME"
echo "Region: $AWS_REGION"
echo "GitHub: $GITHUB_OWNER/$GITHUB_REPO ($GITHUB_BRANCH)"
echo ""

aws cloudformation deploy \
  --template-file "$SCRIPT_DIR/cicd.yaml" \
  --stack-name "$CICD_STACK_NAME" \
  --parameter-overrides \
      GitHubOwner="$GITHUB_OWNER" \
      GitHubRepo="$GITHUB_REPO" \
      GitHubBranch="$GITHUB_BRANCH" \
      WebsiteBucketName="$WEBSITE_BUCKET_NAME" \
      ArtifactBucketName="$ARTIFACT_BUCKET_NAME" \
      FrontendStackName="$FRONTEND_STACK_NAME" \
  --capabilities CAPABILITY_NAMED_IAM \
  --region "$AWS_REGION"

echo ""
echo "Done. Next step: activate the GitHub connection."
echo "Go to: AWS Console → CodePipeline → Settings → Connections"
echo "Find '$CICD_STACK_NAME' connection → click 'Update pending connection'"
echo ""
echo "After that, push any commit to '$GITHUB_BRANCH' to trigger the first pipeline run."
