# GCP Cloud Run Deployment Guide

## Prerequisites

1. **Google Cloud SDK** installed:
   ```bash
   brew install google-cloud-sdk
   ```

2. **GCP Project** set up:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

3. **Enable required APIs**:
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable secretmanager.googleapis.com
   ```

## Setup Secret Manager

Store your Gemini API key securely:

```bash
# Create the secret
echo -n "AIzaSyB12va6KlqqNyS4QObEHGopTqOOV7mL8_I" | \
  gcloud secrets create GEMINI_API_KEY --data-file=-

# Grant Cloud Run access to the secret
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

## Deployment Methods

### Option 1: Manual Deployment (Quickest)

```bash
# Build and deploy in one command
gcloud run deploy scam-shield \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest
```

### Option 2: Using Cloud Build (Recommended)

```bash
# Submit build using cloudbuild.yaml
gcloud builds submit --config cloudbuild.yaml

# Or submit with inline configuration
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/scam-shield
```

### Option 3: Local Docker Build + Push

```bash
# Build locally
docker build -t gcr.io/YOUR_PROJECT_ID/scam-shield:v1 .

# Push to Google Container Registry
docker push gcr.io/YOUR_PROJECT_ID/scam-shield:v1

# Deploy to Cloud Run
gcloud run deploy scam-shield \
  --image gcr.io/YOUR_PROJECT_ID/scam-shield:v1 \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest
```

## Environment Variables

The app expects `GEMINI_API_KEY` as an environment variable. This is automatically injected from Secret Manager using the `--set-secrets` flag.

If you need to add more environment variables:

```bash
gcloud run services update scam-shield \
  --set-env-vars "NODE_ENV=production,OTHER_VAR=value" \
  --region us-central1
```

## Test Your Deployment

After deployment, Cloud Run will provide a URL like:
```
https://scam-shield-XXXXX-uc.a.run.app
```

Test it:
```bash
curl https://scam-shield-XXXXX-uc.a.run.app
```

## HTTPS Configuration

Cloud Run automatically provides:
- HTTPS certificate
- Automatic redirects from HTTP to HTTPS
- Global CDN (when using Cloud CDN)

## Custom Domain (Optional)

1. Verify domain ownership:
   ```bash
   gcloud domains verify YOUR_DOMAIN.com
   ```

2. Map domain to service:
   ```bash
   gcloud run domain-mappings create \
     --service scam-shield \
     --domain YOUR_DOMAIN.com \
     --region us-central1
   ```

## Monitoring & Logs

View logs:
```bash
gcloud run services logs read scam-shield --region us-central1
```

Stream logs:
```bash
gcloud run services logs tail scam-shield --region us-central1
```

## Cost Optimization

Cloud Run pricing:
- **Free tier**: 2 million requests/month
- **Pay per use**: Only charged when serving requests
- **Auto-scaling**: Scales to zero when idle

Optimize costs:
```bash
# Set max instances
gcloud run services update scam-shield \
  --max-instances 10 \
  --region us-central1

# Set min instances (keeps warm, costs more)
gcloud run services update scam-shield \
  --min-instances 0 \
  --region us-central1
```

## CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      
      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy scam-shield \
            --source . \
            --region us-central1 \
            --platform managed \
            --allow-unauthenticated \
            --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest
```

## Troubleshooting

**Issue: Build fails**
```bash
# Check build logs
gcloud builds list --limit 5
gcloud builds log BUILD_ID
```

**Issue: Service not accessible**
```bash
# Check service status
gcloud run services describe scam-shield --region us-central1

# Check IAM permissions
gcloud run services get-iam-policy scam-shield --region us-central1
```

**Issue: Secret not found**
```bash
# List secrets
gcloud secrets list

# Check secret versions
gcloud secrets versions list GEMINI_API_KEY
```

## Security Best Practices

1. **Never commit `.env` files** (already in .gitignore)
2. **Use Secret Manager** for all sensitive data
3. **Enable Cloud Armor** for DDoS protection (optional)
4. **Set up IAM roles** properly
5. **Enable VPC Service Controls** for additional security (enterprise)

## Update Deployment

To update your app:
```bash
# Make code changes, then redeploy
gcloud run deploy scam-shield \
  --source . \
  --region us-central1
```

Or with Cloud Build:
```bash
gcloud builds submit --config cloudbuild.yaml
```

## Rollback

If something goes wrong:
```bash
# List revisions
gcloud run revisions list --service scam-shield --region us-central1

# Rollback to previous revision
gcloud run services update-traffic scam-shield \
  --to-revisions REVISION_NAME=100 \
  --region us-central1
```

## Next Steps

- Set up monitoring alerts in Cloud Console
- Configure Cloud CDN for global performance
- Add custom domain for production
- Set up automated backups if storing data
- Configure Cloud Armor for security rules
