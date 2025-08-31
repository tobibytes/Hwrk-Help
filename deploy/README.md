# Talvra AKS deployment manifests

This folder contains Kubernetes YAML manifests for deploying Talvra to AKS.

Services included
- api-gateway (ClusterIP, exposed via Ingress)
- web (ClusterIP, exposed via Ingress)
- auth-service (ClusterIP)
- canvas-service (ClusterIP)
- ingestion-service (ClusterIP)
- ai-service (ClusterIP)
- media-service (ClusterIP)
- redis (StatefulSet with PersistentVolumeClaim)

Not included
- Postgres: you said you have this in the cloud. Point the services at your DB via the DATABASE_URL/CANVAS_DATABASE_URL secrets.

Setup steps (in your Azure terminal)
1) Create the namespace
   kubectl apply -f deploy/namespace.yaml

2) Create the ACR image pull secret (recommended)
   Replace placeholders with your ACR details.
   kubectl create secret docker-registry acr-pull \
     --namespace talvra \
     --docker-server=<YOUR_ACR_LOGIN_SERVER> \
     --docker-username=<YOUR_ACR_NAME> \
     --docker-password="$(az acr credential show --name <YOUR_ACR_NAME> --query 'passwords[0].value' -o tsv)" \
     --docker-email=<YOUR_EMAIL>

   If you prefer to keep everything in YAML, you can also edit deploy/secrets.yaml and replace .dockerconfigjson with your base64-encoded config.

3) Fill in secrets
   - Edit deploy/secrets.yaml and provide values under stringData for:
     - DATABASE_URL (auth-service) and CANVAS_DATABASE_URL (canvas-service) pointing to your cloud Postgres
     - AUTH_COOKIE_SECRET and CANVAS_TOKEN_SECRET
     - GOOGLE_* (if using Google login)
     - CANVAS_BASE_URL (your Canvas instance URL)
     - FRONTEND_ORIGIN (public URL you’ll use for the web app)
     - REDIS_PASSWORD (optional; if set, Redis will require auth)
     - If using Azure Blob storage for ingestion outputs:
       - Set INGEST_STORAGE_PROVIDER to "azure"
       - Set AZURE_STORAGE_CONNECTION_STRING (see below)
       - Set AZURE_STORAGE_CONTAINER (e.g., talvra)
     - If using real AI generation:
       - Set AI_GENERATION to "real"
       - Set OPENAI_API_KEY
       - Optionally tune OPENAI_CHAT_MODEL and OPENAI_EMBED_MODEL

   Apply the secrets:
   kubectl apply -f deploy/secrets.yaml

4) Azure Blob Storage instructions
   - Build a connection string using your Storage Account and Access Key:
     AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=<ACCOUNT_NAME>;AccountKey=<ACCESS_KEY>;EndpointSuffix=core.windows.net"
   - Put that connection string into deploy/secrets.yaml under AZURE_STORAGE_CONNECTION_STRING
   - Set AZURE_STORAGE_CONTAINER to the container name you want the ingestion-service to write to
   - Set INGEST_STORAGE_PROVIDER to "azure"
   - No additional volumes are needed; the ingestion-service writes directly to Blob

5) Update image names
   - Edit each Deployment YAML and replace image: REPLACE_WITH_YOUR_ACR/<service>:TAG with your pushed ACR image reference for:
     - api-gateway.yaml
     - web.yaml
     - auth-service.yaml
     - canvas-service.yaml
     - ingestion-service.yaml
     - ai-service.yaml
     - media-service.yaml

6) Deploy Redis (stateful)
   kubectl apply -f deploy/redis.yaml

7) Deploy backend services
   kubectl apply -f deploy/auth-service.yaml
   kubectl apply -f deploy/canvas-service.yaml
   kubectl apply -f deploy/ingestion-service.yaml
   kubectl apply -f deploy/ai-service.yaml
   kubectl apply -f deploy/media-service.yaml

8) Deploy gateway and web (ClusterIP)
   kubectl apply -f deploy/api-gateway.yaml
   kubectl apply -f deploy/web.yaml

9) Verify
   - Wait for the Ingress external IP:
     kubectl get ingress talvra-ingress -n talvra
   - Point DNS for your hosts (HOST_WEB, HOST_API) to the Ingress EXTERNAL-IP
   - Ensure FRONTEND_ORIGIN in secrets.yaml matches your public Web URL (e.g., https://<HOST_WEB>)
   - Health checks:
     - api-gateway: /health
     - canvas-service: /canvas/health
     - ingestion-service: /ingestion/health
     - ai-service: /ai/health
     - media-service: /media/health

Notes
- We did not modify your service env variable names. Manifests use envFrom: secretRef: talvra-secrets so you can manage env in one place.
- Postgres is external—provide the proper connection strings via secrets.
- Redis is single-replica with a PVC (5Gi). Adjust storageClassName if you want a specific Azure managed disk class (e.g., managed-csi or managed-premium).
- This setup exposes public traffic via a single Ingress with host-based routing to web and api-gateway.

