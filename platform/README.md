# Platform Workspace

Infrastructure and deployment assets for qeetmart runtime environments.

## Scope

This folder contains Kubernetes manifests for base resources and environment overlays.

Helm chart assets live in `helm/qeetmart`.

## Structure

| Path | Purpose |
| --- | --- |
| `platform/k8s/base` | Shared manifests used by all environments |
| `platform/k8s/overlays/dev` | Dev environment overrides |
| `platform/k8s/overlays/staging` | Staging environment overrides |
| `platform/k8s/overlays/prod` | Production environment overrides |
| `helm/qeetmart` | Helm chart templates and values |

## Validate Before Deploy

```bash
helm lint helm/qeetmart
kustomize build platform/k8s/overlays/dev > /tmp/kustomize-dev.yaml
kustomize build platform/k8s/overlays/staging > /tmp/kustomize-staging.yaml
kustomize build platform/k8s/overlays/prod > /tmp/kustomize-prod.yaml
```

## Apply with Kustomize

```bash
kubectl apply -k platform/k8s/overlays/dev
kubectl apply -k platform/k8s/overlays/staging
kubectl apply -k platform/k8s/overlays/prod
```

## Helm Usage

```bash
helm upgrade --install qeetmart helm/qeetmart -n qeetmart --create-namespace
```

## Operational Guardrails

- Use immutable image tags for staging and production
- Replace placeholders with managed secrets before deployment
- Keep environment-specific overrides in overlays, not in base
- Validate manifests in CI before promotion

## Related Docs

- Root guide: `README.md`
- CI workflow: `.github/workflows/ci.yml`
- Deploy workflow: `.github/workflows/deploy.yml`
