#!/usr/bin/env bash
set -euo pipefail

# ======================
# Talvra AKS deploy script
# ======================
# Fill these variables, then run:
#   bash deploy/script.sh
# This script will:
# - create namespace
# - create ACR image pull secret (acr-pull)
# - apply secrets and workloads
# - render ingress.tmpl.yaml -> ingress.yaml and apply it
#
# Prereqs: az, kubectl

# --- Required variables ---
NAMESPACE="talvra"
# ACR info (find via: az acr list -o table)
ACR_NAME="oldwhisper"             # e.g., myregistry
ACR_LOGIN_SERVER="oldwhisper.azurecr.io"   # e.g., myregistry.azurecr.io
DOCKER_EMAIL="tobiolajide01@gmail.com"            # any email string

# Ingress
INGRESS_CLASS="nginx"                    # e.g., nginx or azure-application-gateway; ensure controller is installed
HOST_WEB="www.hwrk.help"               # public hostname for the web UI
HOST_API="api.hwrk.help"               # public hostname for gateway API
TLS_SECRET_NAME="talvra-tls"           # optional: uncomment here and tls stanza in ingress.tmpl.yaml

# --- Images (replace in YAMLs before running or sed here) ---
# If you prefer, you can sed replace the images here. Otherwise edit the YAML files manually.
# ACR_IMG_PREFIX="${ACR_LOGIN_SERVER}"
# sed -i '' "s#REPLACE_WITH_YOUR_ACR/web:TAG#${ACR_IMG_PREFIX}/web:latest#g" deploy/web.yaml
# ... repeat for other services

# --- Helpers ---
need() { command -v "$1" >/dev/null 2>&1 || { echo "Missing dependency: $1" >&2; exit 1; }; }

main() {
  need az
  need kubectl

  echo "Context: $(kubectl config current-context)"
  echo "Using namespace: ${NAMESPACE}"

  # 1) Namespace
  kubectl get ns "$NAMESPACE" >/dev/null 2>&1 || kubectl create namespace "$NAMESPACE"

  # 2) ACR pull secret
  if kubectl -n "$NAMESPACE" get secret acr-pull >/dev/null 2>&1; then
    echo "acr-pull secret already exists in ${NAMESPACE}. Skipping creation."
  else
    echo "Creating docker-registry secret acr-pull in ${NAMESPACE}..."
    kubectl create secret docker-registry acr-pull \
      --namespace "$NAMESPACE" \
      --docker-server="$ACR_LOGIN_SERVER" \
      # --docker-username="$ACR_NAME" \
      # --docker-password="$(az acr credential show --name "$ACR_NAME" --query 'passwords[0].value' -o tsv)" \
      # --docker-email="$DOCKER_EMAIL"
  fi

  # 3) Secrets (edit deploy/secrets.yaml before running this)
  echo "Applying secrets from deploy/secrets.yaml..."
  kubectl apply -f deploy/secrets.yaml

  # 4) Redis (stateful)
  echo "Applying Redis StatefulSet..."
  kubectl apply -f deploy/redis.yaml

  # 5) Core services
  echo "Applying core services..."
  kubectl apply -f deploy/auth-service.yaml
  kubectl apply -f deploy/canvas-service.yaml
  kubectl apply -f deploy/ingestion-service.yaml
  kubectl apply -f deploy/media-service.yaml
  kubectl apply -f deploy/ai-service.yaml

  # 6) Gateway and Web (ClusterIP). Public access comes via the Ingress.
  echo "Applying api-gateway and web (ClusterIP)..."
  kubectl apply -f deploy/api-gateway.yaml
  kubectl apply -f deploy/web.yaml

  # 7) Ingress (render from template)
  echo "Rendering ingress from template..."
  export INGRESS_CLASS HOST_WEB HOST_API
  # If using TLS, also export TLS_SECRET_NAME and uncomment TLS in the template
  envsubst < deploy/ingress.tmpl.yaml > deploy/ingress.yaml
  echo "Applying ingress..."
  kubectl apply -f deploy/ingress.yaml

  echo "\nDone. Next steps:"
  echo "- Ensure an Ingress Controller is installed (e.g., NGINX Ingress)."
  echo "  For AKS (addon): az aks enable-addons --addons ingress-appgw or install NGINX Ingress via Helm."
  echo "- Point your DNS for ${HOST_WEB} and ${HOST_API} to the Ingress public IP:"
  echo "    kubectl get ingress talvra-ingress -n ${NAMESPACE}"
  echo "- Set FRONTEND_ORIGIN in deploy/secrets.yaml to match your Web URL (e.g., https://${HOST_WEB}) and re-apply secrets if needed."
  echo "- Check health endpoints:"
  echo "    /api/ingestion/health, /api/canvas/health, /api/ai/health via the gateway host."
}

main "$@"

