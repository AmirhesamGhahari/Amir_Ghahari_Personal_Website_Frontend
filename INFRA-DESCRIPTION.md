# infra/pipeline.yaml — Every Line Explained

This document walks through the entire CloudFormation template piece by piece.
No AWS experience assumed.

---

## What is CloudFormation, in plain English?

CloudFormation is AWS's way of letting you describe your infrastructure in a text file (YAML)
instead of clicking through the AWS Console. You hand AWS the file, it reads it, and creates
everything for you — in the right order, handling dependencies automatically.

The file has four top-level sections:

```
AWSTemplateFormatVersion  ← required header, always this exact value
Description               ← a human note, ignored by AWS
Parameters                ← inputs you provide at deploy time (like function arguments)
Resources                 ← the actual AWS things to create (the meat of the file)
Outputs                   ← values CloudFormation prints after it finishes
```

---

## CloudFormation Syntax You'll See Repeatedly

Before diving into resources, these three special keywords appear everywhere:

| Keyword | What it does | Example |
|---|---|---|
| `!Ref SomeName` | Inserts the value of a parameter or the ID of a resource | `!Ref WebsiteBucketName` → `"amir-ghahari-website"` |
| `!Sub 'text ${SomeName}'` | String substitution — like a template literal in JS | `!Sub 'arn:aws:s3:::${WebsiteBucketName}/*'` |
| `!GetAtt Resource.Attribute` | Gets a specific attribute of a created resource | `!GetAtt BuildProject.Arn` → the ARN of the CodeBuild project |

**ARN** (Amazon Resource Name) = the unique ID for any AWS resource.
Format: `arn:aws:SERVICE::ACCOUNT-ID:RESOURCE-ID`
Think of it like a URL but for AWS resources.

**Stack** = the group of all resources created from one CloudFormation template.
When you run `aws cloudformation deploy --stack-name portfolio-cicd`, everything in the
template becomes one "stack" called `portfolio-cicd`. You can delete all of it in one command.

---

## Parameters Section

```yaml
Parameters:
  GitHubOwner:
  GitHubRepo:
  GitHubBranch:
  WebsiteBucketName:
```

Parameters are like function arguments — values you supply at deploy time so the template
is reusable. Without them, you'd have to edit the YAML file itself every time.

### `GitHubOwner`
Your GitHub username (e.g. `amirhesamghahari`).
Used to build the repository path `GitHubOwner/GitHubRepo` that tells CodePipeline
which GitHub repo to watch.

### `GitHubRepo`
The repository name (e.g. `amir-ghahari-dev-frontend-repo`).
Combined with `GitHubOwner`, this pinpoints the exact repo.

### `GitHubBranch`
Defaults to `main`. This is which branch triggers deployments.
If you ever create a `staging` branch and want a separate pipeline for it, you'd deploy
a second stack with `GitHubBranch=staging`.

### `WebsiteBucketName`
S3 bucket names are globally unique across ALL AWS accounts in the world.
You pick the name here so you can choose something that isn't already taken.
This name flows into the bucket, the bucket policy, the CloudFront origin, and CodeBuild's
environment variable — all in one place.

---

## Resources — The 9 AWS Things Created

---

### Resource 1: `GithubConnection` (AWS::CodeStarConnections::Connection)

```yaml
GithubConnection:
  Type: AWS::CodeStarConnections::Connection
  Properties:
    ConnectionName: amir-portfolio-github
    ProviderType: GitHub
```

**What it is:** A secure bridge between AWS and GitHub.
CodePipeline needs to know when you push to GitHub — this connection is the wire that
connects the two. Without it, CodePipeline has no way to "see" your GitHub repo.

**Why it's needed:** AWS can't just reach out to GitHub on its own. You have to authorize
it — that's why this resource ends up in "Pending" state and requires the one manual OAuth
click after deployment. The OAuth step proves to GitHub that you (the repo owner) are the
one authorizing AWS to read your code.

**Why it can't be fully automated:** The OAuth authorization is a security requirement from
GitHub. A human must click "Authorize" — a script cannot impersonate you doing that.

**`ProviderType: GitHub`** — tells AWS this is a GitHub connection, not Bitbucket or GitLab.

---

### Resource 2: `WebsiteBucket` (AWS::S3::Bucket)

```yaml
WebsiteBucket:
  Type: AWS::S3::Bucket
  Properties:
    BucketName: !Ref WebsiteBucketName
    PublicAccessBlockConfiguration:
      BlockPublicAcls: false
      BlockPublicPolicy: false
      IgnorePublicAcls: false
      RestrictPublicBuckets: false
    WebsiteConfiguration:
      IndexDocument: index.html
      ErrorDocument: 404.html
```

**What it is:** Cloud storage for your website files. When `npm run build` runs,
it creates an `out/` folder full of HTML, CSS, and JS files. Those files get uploaded here.

**`BucketName: !Ref WebsiteBucketName`** — uses the parameter you passed in so you don't
hardcode the name.

**`PublicAccessBlockConfiguration` (all false)** — by default AWS locks down S3 buckets so
nobody outside your account can read them. That's great for storing private files, but a
website needs to be publicly readable. Setting all four values to `false` lifts the lock so
the bucket policy in Resource 3 can open it up.

**`WebsiteConfiguration`** — this is what turns a plain storage bucket into a web server:
- `IndexDocument: index.html` — when someone visits `/about-me/`, S3 serves `about-me/index.html`
- `ErrorDocument: 404.html` — if a file isn't found, serve this file instead of a raw AWS error

---

### Resource 3: `WebsiteBucketPolicy` (AWS::S3::BucketPolicy)

```yaml
WebsiteBucketPolicy:
  Type: AWS::S3::BucketPolicy
  Properties:
    Bucket: !Ref WebsiteBucket
    PolicyDocument:
      Version: '2012-10-17'
      Statement:
        - Effect: Allow
          Principal: '*'
          Action: s3:GetObject
          Resource: !Sub 'arn:aws:s3:::${WebsiteBucketName}/*'
```

**What it is:** The permission slip attached to the bucket.
Resource 2 removed the default block. This resource adds the explicit permission that says
"anyone in the world may read files from this bucket."

**Why it's a separate resource (not part of Resource 2):** AWS made bucket settings and
bucket permissions two separate concepts. The bucket controls its own existence and
configuration; the bucket policy controls who can access it. You need both.

**`Principal: '*'`** — `*` means "everyone" — any browser, any user, anywhere.
This is what makes your website publicly accessible on the internet.

**`Action: s3:GetObject`** — `GetObject` = read/download a file. That's all anyone needs
to do with a website — read the HTML files. Writing or deleting is NOT granted here.

**`Resource: !Sub 'arn:aws:s3:::${WebsiteBucketName}/*'`** — the `/*` at the end means
"all files inside the bucket." Without it, the permission would apply to the bucket itself
but not its contents.

**`Version: '2012-10-17'`** — this is the IAM policy language version. It's always this
exact date string. It doesn't mean the policy expires — it's just how AWS identifies which
version of the policy syntax you're using. Always use this value.

---

### Resource 4: `ArtifactBucket` (AWS::S3::Bucket)

```yaml
ArtifactBucket:
  Type: AWS::S3::Bucket
  Properties:
    VersioningConfiguration:
      Status: Enabled
```

**What it is:** A second, private S3 bucket — CodePipeline's scratchpad.
CodePipeline needs somewhere to temporarily store your source code as it passes it between
stages. When the Source stage finishes (downloads your code from GitHub), it zips it up and
drops it here. Then the Build stage picks it up from here.

**Why can't CodeBuild just pull from GitHub directly?** In our setup, CodeBuild's source
type is `CODEPIPELINE` — meaning it receives code from the pipeline, not directly from
GitHub. This is intentional: CodePipeline is the single entry point that controls the flow.
CodeBuild doesn't need its own GitHub access.

**`VersioningConfiguration: Status: Enabled`** — CodePipeline requires versioning to be
on so it can track which version of the artifact corresponds to which pipeline run.
Without this, CodePipeline will refuse to use the bucket.

**No `BucketName`** — we don't set a name, so AWS generates a random unique one.
This bucket is internal plumbing that you never interact with directly, so the name doesn't
matter.

---

### Resource 5: `CloudFrontDistribution` (AWS::CloudFront::Distribution)

```yaml
CloudFrontDistribution:
  Type: AWS::CloudFront::Distribution
  Properties:
    DistributionConfig:
      Enabled: true
      DefaultRootObject: index.html
      PriceClass: PriceClass_100
      Origins:
        - Id: S3WebsiteOrigin
          DomainName: !Sub '${WebsiteBucketName}.s3-website-${AWS::Region}.amazonaws.com'
          CustomOriginConfig:
            HTTPPort: 80
            HTTPSPort: 443
            OriginProtocolPolicy: http-only
      DefaultCacheBehavior:
        TargetOriginId: S3WebsiteOrigin
        ViewerProtocolPolicy: redirect-to-https
        CachePolicyId: 658327ea-f89d-4fab-a63d-7e88639e58f6
        AllowedMethods:
          - GET
          - HEAD
```

**What it is:** A CDN (Content Delivery Network). CloudFront copies your website to
servers all around the world, so a visitor in Tokyo gets it from a nearby server instead
of your S3 bucket in us-east-1. This makes the site fast globally.

It also gives you HTTPS for free.

**`Enabled: true`** — the distribution is active immediately after creation.

**`DefaultRootObject: index.html`** — when someone visits your root URL
(`https://xxxxx.cloudfront.net`), serve `index.html` automatically.

**`PriceClass: PriceClass_100`** — CloudFront has data centers everywhere.
`PriceClass_100` limits to US + Europe only, which is the cheapest option.
For a personal portfolio this is fine; upgrading to `PriceClass_All` adds Asia, South America, etc.

**`Origins`** — an "origin" is where CloudFront fetches the real files from when its
cache is empty. We have one origin: the S3 static website endpoint.

**`DomainName: !Sub '${WebsiteBucketName}.s3-website-${AWS::Region}.amazonaws.com'`**
This is a key detail: there are two different URLs for an S3 bucket:
- `bucket.s3.amazonaws.com` — the S3 API endpoint (treats the bucket like raw storage)
- `bucket.s3-website-us-east-1.amazonaws.com` — the S3 website endpoint (serves HTML properly, handles index.html at subdirectories)

We use the website endpoint because it handles directory routing correctly for Next.js pages.

**`OriginProtocolPolicy: http-only`** — S3 website endpoints only speak HTTP (not HTTPS).
So CloudFront connects to S3 over HTTP internally. The connection from visitors to
CloudFront is still HTTPS — that's controlled below.

**`ViewerProtocolPolicy: redirect-to-https`** — if anyone types `http://` in their browser,
CloudFront automatically redirects them to `https://`. Visitors always get a secure connection.

**`CachePolicyId: 658327ea-f89d-4fab-a63d-7e88639e58f6`** — this ID is AWS's built-in
"CachingOptimized" policy. It's a fixed ID that works in every AWS region.
It tells CloudFront to cache files aggressively, which is what you want for a static site
where files only change when you deploy.

**`AllowedMethods: GET, HEAD`** — websites only need two HTTP methods:
`GET` = fetch a file, `HEAD` = check if a file exists. We don't allow POST, PUT, DELETE, etc.
because S3 static websites don't support those.

---

### Resource 6: `CodeBuildRole` (AWS::IAM::Role)

```yaml
CodeBuildRole:
  Type: AWS::IAM::Role
  Properties:
    RoleName: !Sub '${AWS::StackName}-codebuild-role'
    AssumeRolePolicyDocument:
      Statement:
        - Effect: Allow
          Principal:
            Service: codebuild.amazonaws.com
          Action: sts:AssumeRole
    Policies:
      - PolicyName: CodeBuildPermissions
        PolicyDocument:
          Statement:
            - logs:CreateLogGroup / CreateLogStream / PutLogEvents  → '*'
            - s3:GetObject / GetObjectVersion / ListBucket          → ArtifactBucket
            - s3:PutObject / DeleteObject / ListBucket              → WebsiteBucket
            - cloudfront:CreateInvalidation                         → CloudFrontDistribution
```

**What it is:** A permission identity (like a job title) that CodeBuild wears when it runs.

**Why AWS uses roles instead of passwords:** When CodeBuild runs your build, it needs to
write files to S3 and clear the CloudFront cache. But CodeBuild is an AWS service running
inside AWS — it can't log in with a username and password. Instead, AWS uses **roles**:
you say "CodeBuild is allowed to pretend to be this role," and the role has a list of
what it can do.

**`AssumeRolePolicyDocument`** — the "who is allowed to wear this role" rule.
`Principal: Service: codebuild.amazonaws.com` means only the CodeBuild service can use it.
`Action: sts:AssumeRole` — STS is the AWS security token service; AssumeRole is the act of
putting on the role. Think of it as swiping an ID card.

**`!Sub '${AWS::StackName}-codebuild-role'`** — `AWS::StackName` is a built-in variable
CloudFormation provides. It equals whatever you named the stack (e.g. `portfolio-cicd`).
So the role gets named `portfolio-cicd-codebuild-role`. This keeps names tied to the stack.

**The four permission statements, each scoped tightly:**

1. **CloudWatch Logs** (`logs:*`) — CodeBuild writes its console output (what you see when
   you click "View logs" in the Console) to CloudWatch Logs. Without this, builds have no
   logs and you can't debug failures. `Resource: '*'` because log groups are auto-named.

2. **Read from ArtifactBucket** — CodeBuild needs to download the source code zip that
   CodePipeline placed in the artifact bucket. Read-only here.

3. **Write to WebsiteBucket** — `aws s3 sync out/ s3://$BUCKET_NAME` in buildspec.yml
   uploads the built files. `PutObject` = upload, `DeleteObject` = remove old files
   (the `--delete` flag in the sync command removes files that no longer exist in `out/`).

4. **`cloudfront:CreateInvalidation`** — this is the specific action for telling CloudFront
   "forget your cached version of everything." Scoped to exactly one distribution (the one
   we created), not all CloudFront distributions in the account.

---

### Resource 7: `CodePipelineRole` (AWS::IAM::Role)

```yaml
CodePipelineRole:
  Type: AWS::IAM::Role
  Properties:
    RoleName: !Sub '${AWS::StackName}-codepipeline-role'
    AssumeRolePolicyDocument:
      Principal:
        Service: codepipeline.amazonaws.com
    Policies:
      - codestar-connections:UseConnection  → GithubConnection
      - s3:GetObject / PutObject / ...      → ArtifactBucket
      - codebuild:BatchGetBuilds / StartBuild → BuildProject
      - iam:PassRole                         → CodeBuildRole
```

**What it is:** Same concept as Resource 6, but for CodePipeline instead of CodeBuild.
CodePipeline is the orchestrator — it needs a different set of permissions than the builder.

**`codestar-connections:UseConnection`** — CodePipeline uses the GitHub connection to
download your source code when it detects a push. Without this permission, the pipeline
can't talk to GitHub.

**S3 artifact bucket permissions** — CodePipeline reads and writes to the artifact bucket
to hand off code between stages. The Source stage writes the zip; the Build stage reads it.
`GetBucketVersioning` is needed because CodePipeline checks versioning status on the bucket.

**`codebuild:StartBuild` and `BatchGetBuilds`** — when the Build stage runs, CodePipeline
tells CodeBuild to start a build (`StartBuild`) and then polls it to check if it finished
(`BatchGetBuilds`). Without these, CodePipeline can't trigger or monitor CodeBuild.

**`iam:PassRole` → `CodeBuildRole`** — this one is subtle. When CodePipeline starts a
CodeBuild job, it passes the `CodeBuildRole` to CodeBuild so CodeBuild knows what
permissions it has. AWS requires the pipeline role to explicitly be allowed to "pass" that
role. Otherwise, a compromised pipeline could hand arbitrary permissions to CodeBuild.
Scoped to exactly the CodeBuildRole ARN — not all IAM roles.

---

### Resource 8: `BuildProject` (AWS::CodeBuild::Project)

```yaml
BuildProject:
  Type: AWS::CodeBuild::Project
  Properties:
    Name: !Sub '${AWS::StackName}-build'
    Source:
      Type: CODEPIPELINE
      BuildSpec: buildspec.yml
    Artifacts:
      Type: CODEPIPELINE
    Environment:
      Type: LINUX_CONTAINER
      ComputeType: BUILD_GENERAL1_SMALL
      Image: aws/codebuild/standard:7.0
      EnvironmentVariables:
        - Name: BUCKET_NAME
          Value: !Ref WebsiteBucketName
        - Name: DISTRIBUTION_ID
          Value: !Ref CloudFrontDistribution
    ServiceRole: !GetAtt CodeBuildRole.Arn
```

**What it is:** The build server configuration. CodeBuild spins up a temporary Linux
machine, runs your commands, then shuts it down. This resource defines what kind of machine
and what to run.

**`Source: Type: CODEPIPELINE`** — tells CodeBuild to expect its source code from the
pipeline (not directly from GitHub). It receives the zip that CodePipeline put in
ArtifactBucket.

**`BuildSpec: buildspec.yml`** — the task list file. CodeBuild looks for this file in
the root of your repo. This is what runs `npm install`, `npm run build`, and the S3/CloudFront
commands.

**`Artifacts: Type: CODEPIPELINE`** — CodeBuild puts its output back into the pipeline
(stored in ArtifactBucket) so the pipeline knows the build finished.

**`Type: LINUX_CONTAINER`** — the machine is a Linux Docker container.
A container is a lightweight isolated environment — faster to start than a full virtual machine.

**`ComputeType: BUILD_GENERAL1_SMALL`** — machine size. Small = 3 GB RAM, 2 vCPUs.
Plenty for `npm install` + `npm run build`. Larger sizes cost more per build minute.

**`Image: aws/codebuild/standard:7.0`** — the pre-built Docker image AWS provides.
This image has Node.js, Python, Go, and many other runtimes pre-installed.
In `buildspec.yml`, `runtime-versions: nodejs: 18` activates the right one.

**`EnvironmentVariables`** — these become shell variables inside the build.
`buildspec.yml` uses `$BUCKET_NAME` and `$DISTRIBUTION_ID` — those values come from here.
- `BUCKET_NAME: !Ref WebsiteBucketName` → the bucket name parameter you passed in
- `DISTRIBUTION_ID: !Ref CloudFrontDistribution` → the ID of the distribution created in Resource 5

This is why you don't hardcode those values in `buildspec.yml` — CloudFormation injects them.

**`ServiceRole: !GetAtt CodeBuildRole.Arn`** — attaches the IAM role from Resource 6.
`!GetAtt CodeBuildRole.Arn` reads the ARN of the role that was just created.

---

### Resource 9: `DeployPipeline` (AWS::CodePipeline::Pipeline)

```yaml
DeployPipeline:
  Type: AWS::CodePipeline::Pipeline
  Properties:
    Name: !Sub '${AWS::StackName}-pipeline'
    RoleArn: !GetAtt CodePipelineRole.Arn
    ArtifactStore:
      Type: S3
      Location: !Ref ArtifactBucket
    Stages:
      - Name: Source   (GitHub → ArtifactBucket)
      - Name: Build    (ArtifactBucket → CodeBuild → S3 + CloudFront)
```

**What it is:** The conductor. CodePipeline doesn't do any work itself — it tells other
services when to start and passes data between them.

**`ArtifactStore`** — points to ArtifactBucket. Every artifact (zip files of source code,
build outputs) passes through this bucket between stages.

**Stage 1: Source**

```yaml
ActionTypeId:
  Category: Source
  Owner: AWS
  Provider: CodeStarSourceConnection
  Version: '1'
Configuration:
  ConnectionArn: !Ref GithubConnection
  FullRepositoryId: !Sub '${GitHubOwner}/${GitHubRepo}'
  BranchName: !Ref GitHubBranch
  OutputArtifactFormat: CODE_ZIP
OutputArtifacts:
  - Name: SourceArtifact
```

This stage watches GitHub. When you push to `main`, it:
1. Downloads the repo at that commit
2. Zips it up
3. Puts the zip in ArtifactBucket as `SourceArtifact`

`FullRepositoryId` = `amirhesamghahari/amir-ghahari-dev-frontend-repo` — the full path.
`OutputArtifactFormat: CODE_ZIP` — store the source as a zip file.
`OutputArtifacts: - Name: SourceArtifact` — gives the zip a name so the next stage can refer to it.

**Stage 2: Build**

```yaml
ActionTypeId:
  Category: Build
  Owner: AWS
  Provider: CodeBuild
  Version: '1'
Configuration:
  ProjectName: !Ref BuildProject
InputArtifacts:
  - Name: SourceArtifact
OutputArtifacts:
  - Name: BuildArtifact
```

This stage picks up `SourceArtifact` from the bucket, hands it to CodeBuild, and waits.
CodeBuild runs `buildspec.yml` (npm install → npm build → s3 sync → cloudfront invalidate).
When done, it writes a `BuildArtifact` back (just a marker that the stage completed).

**No Deploy stage** — normally you'd add a third stage to copy files somewhere.
But CodeBuild already does that directly (`aws s3 sync` in buildspec.yml).
Adding a Deploy stage would be redundant.

---

## Outputs Section

```yaml
Outputs:
  WebsiteURL:               → https://xxxxx.cloudfront.net
  CloudFrontDistributionId: → E1ABCDEF...
  WebsiteBucketName:        → amir-ghahari-website
  CodeStarConnectionArn:    → arn:aws:codestar-connections:...
```

After CloudFormation finishes creating everything, these values are printed.
You get them with:
```bash
aws cloudformation describe-stacks --stack-name portfolio-cicd --query "Stacks[0].Outputs"
```

**`WebsiteURL`** — your live site URL. Share this or map a custom domain to it.
**`CloudFrontDistributionId`** — for reference; already injected into CodeBuild automatically.
**`CodeStarConnectionArn`** — a reminder to activate the GitHub connection.

---

## How It All Fits Together (Full Flow)

```
You run: aws cloudformation deploy ...
                    ↓
CloudFormation creates all 9 resources in the right order
(it figures out the order automatically from !Ref / !GetAtt dependencies)
                    ↓
You manually activate the GitHub connection (one OAuth click)
                    ↓
You push a commit to main
                    ↓
GitHub notifies CodePipeline via the CodeStar Connection
                    ↓
DeployPipeline (Resource 9) starts
  Stage 1 — Source: downloads your repo → zips it → puts it in ArtifactBucket (Resource 4)
  Stage 2 — Build: CodeBuild (Resource 8) picks up the zip →
            runs buildspec.yml using CodeBuildRole (Resource 6):
              npm install
              npm run build
              aws s3 sync out/ → WebsiteBucket (Resource 2)
              aws cloudfront create-invalidation → CloudFrontDistribution (Resource 5)
                    ↓
CloudFront serves your updated site to visitors worldwide over HTTPS
```
