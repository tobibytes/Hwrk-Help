#!/usr/bin/env bash
set -euo pipefail

# push.sh — build and push Talvra images with per-service versions
# - Reads per-service versions from version.txt (KEY=VERSION lines)
# - Bumps version (patch by default) for selected services
# - Builds linux/amd64 images with docker buildx and pushes to ACR
# - Updates version.txt only after a successful push per service
#
# Requirements:
# - docker buildx
# - Logged in to ACR (docker/az). If not, set ACR_NAME and we will try: az acr login --name "$ACR_NAME"
#
# Usage examples:
#   ./push.sh                   # bump patch and push all services
#   ./push.sh web               # bump patch and push only web
#   ./push.sh web api-gateway   # bump patch and push selected services
#   ./push.sh --bump minor      # bump minor for all
#   ./push.sh --version 2.0.0 web # set explicit version for web
#   ACR_LOGIN_SERVER=... ./push.sh

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
VERSIONS_FILE="$ROOT_DIR/version.txt"
ACR_LOGIN_SERVER="${ACR_LOGIN_SERVER:-oldwhisper.azurecr.io}"
ACR_NAME="${ACR_NAME:-}"  # optional; used to try az acr login
BUMP_KIND="patch"          # patch|minor|major
EXPLICIT_VERSION=""        # if set, use this version for selected services

# macOS/BSD vs GNU sed in-place flag compatibility
if [[ "${OSTYPE:-}" == darwin* ]]; then
  SED_INPLACE=(-i '')
else
  SED_INPLACE=(-i)
fi

usage() {
  cat <<EOF
Usage: $0 [options] [service ...]
Options:
  --bump {patch|minor|major}  Bump level (default: patch)
  --version X.Y[.Z]           Use explicit version for selected services (no bump)
  --all                       Build all known services (default if no service args)
  -h, --help                  Show help

Environment:
  ACR_LOGIN_SERVER            Registry (default: oldwhisper.azurecr.io)
  ACR_NAME                    If set, attempt 'az acr login --name $ACR_NAME'

Known services:
  web, api-gateway, auth-service, canvas-service, ingestion-service, media-service, ai-service
EOF
}

# Service registry (name:dockerfile:repo-suffix)
SERVICES=(
  "web:frontend/web/Dockerfile:hwrk-web"
  "api-gateway:services/api-gateway/Dockerfile:hwrk-api-gateway"
  "auth-service:services/auth-service/Dockerfile:hwrk-auth-service"
  "canvas-service:services/canvas-service/Dockerfile:hwrk-canvas-service"
  "ingestion-service:services/ingestion-service/Dockerfile:hwrk-ingestion-service"
  "media-service:services/media-service/Dockerfile:hwrk-media-service"
  "ai-service:services/ai-service/Dockerfile:hwrk-ai-service"
)

# Parse args
ARGS=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --bump)
      BUMP_KIND="${2:-}"; shift 2 ;;
    --version)
      EXPLICIT_VERSION="${2:-}"; shift 2 ;;
    --all)
      ARGS=(all); shift ;;
    -h|--help)
      usage; exit 0 ;;
    --)
      shift; break ;;
    *)
      ARGS+=("$1"); shift ;;
  esac
done

if [[ ! -f "$VERSIONS_FILE" ]]; then
  echo "version.txt not found at $VERSIONS_FILE" >&2
  cat <<VEXAMPLE >&2
Create version.txt like:
  web=1.0.0
  api-gateway=1.0.0
  auth-service=1.0.0
  canvas-service=1.0.0
  ingestion-service=1.0.0
  media-service=1.0.0
  ai-service=1.0.0
VEXAMPLE
  exit 1
fi

# Attempt ACR login if requested
if [[ -n "$ACR_NAME" ]]; then
  if command -v az >/dev/null 2>&1; then
    echo "Logging in to ACR '$ACR_NAME'..."
    az acr login --name "$ACR_NAME" || true
  else
    echo "az not found; skipping az acr login" >&2
  fi
fi

contains_service() {
  local name="$1"
  for entry in "${SERVICES[@]}"; do
    IFS=":" read -r svc _ _ <<<"$entry"
    if [[ "$svc" == "$name" ]]; then return 0; fi
  done
  return 1
}

get_service_meta() {
  local name="$1"
  for entry in "${SERVICES[@]}"; do
    IFS=":" read -r svc df repo <<<"$entry"
    if [[ "$svc" == "$name" ]]; then
      echo "$df:$repo"
      return 0
    fi
  done
  echo ""; return 1
}

read_version() {
  local name="$1"
  local line
  line=$(grep -E "^${name}=" "$VERSIONS_FILE" || true)
  if [[ -z "$line" ]]; then
    echo ""; return 0
  fi
  echo "${line#*=}"
}

normalize_semver() {
  local v="$1"
  # Accept N, N.M, N.M.P; normalize to N.M.P
  if [[ "$v" =~ ^[0-9]+$ ]]; then
    echo "$v.0.0"; return 0
  elif [[ "$v" =~ ^([0-9]+)\.([0-9]+)$ ]]; then
    echo "${BASH_REMATCH[1]}.${BASH_REMATCH[2]}.0"; return 0
  else
    echo "$v"; return 0
  fi
}

bump_version() {
  local v norm kind
  v="$(normalize_semver "$1")"; kind="${2:-patch}"
  IFS='.' read -r MA MI PA <<<"$v"
  case "$kind" in
    major) ((MA+=1)); MI=0; PA=0 ;;
    minor) ((MI+=1)); PA=0 ;;
    *)     ((PA+=1)) ;;
  esac
  echo "$MA.$MI.$PA"
}

write_version() {
  local name="$1" v="$2"
  if grep -qE "^${name}=" "$VERSIONS_FILE"; then
    sed "${SED_INPLACE[@]}" -E "s|^(${name}=).*|\1${v}|" "$VERSIONS_FILE"
  else
    echo "${name}=${v}" >> "$VERSIONS_FILE"
  fi
}

build_and_push() {
  local name="$1" dockerfile="$2" repo_suffix="$3" version="$4"
  local image="${ACR_LOGIN_SERVER}/${repo_suffix}:${version}"
  echo "\n==> Building ${name} as ${image}"
  docker buildx build \
    --platform linux/amd64 \
    -t "$image" \
    -f "$dockerfile" \
    "$ROOT_DIR" \
    --push
  echo "Pushed ${image}"
}

# Determine target services
TARGETS=()
if [[ ${#ARGS[@]} -eq 0 || ( ${#ARGS[@]} -eq 1 && "${ARGS[0]}" == "all" ) ]]; then
  # all services
  for entry in "${SERVICES[@]}"; do
    IFS=":" read -r svc _ _ <<<"$entry"; TARGETS+=("$svc")
  done
else
  for a in "${ARGS[@]}"; do
    if contains_service "$a"; then
      TARGETS+=("$a")
    else
      echo "Unknown service: $a" >&2; usage; exit 1
    fi
  done
fi

# Validate bump kind
case "$BUMP_KIND" in
  major|minor|patch) : ;;
  *) echo "Invalid --bump: $BUMP_KIND" >&2; exit 1 ;;
 esac

# Process services
SUMMARY=()
for svc in "${TARGETS[@]}"; do
  meta="$(get_service_meta "$svc")" || { echo "Failed to get meta for $svc" >&2; exit 1; }
  IFS=":" read -r df repo <<<"$meta"
  current="$(read_version "$svc")"
  next=""
  if [[ -n "$EXPLICIT_VERSION" ]]; then
    next="$EXPLICIT_VERSION"
  else
    if [[ -z "$current" ]]; then current="0.0.0"; fi
    next="$(bump_version "$current" "$BUMP_KIND")"
  fi

  build_and_push "$svc" "$ROOT_DIR/$df" "$repo" "$next"
  write_version "$svc" "$next"
  SUMMARY+=("$svc=$next")

done

echo "\nAll done. Versions:"
for s in "${SUMMARY[@]}"; do echo "  $s"; done

echo "\nversion.txt updated. Remember to update your Kubernetes deployments to use the new tags."
