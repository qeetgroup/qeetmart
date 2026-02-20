# Platform

Deployment assets for Kubernetes and Helm.

## Kustomize

- Base manifests: `platform/k8s/base`
- Overlays: `platform/k8s/overlays/{dev,staging,prod}`

Example:

```bash
kubectl apply -k platform/k8s/overlays/dev
```

## Helm

Chart path: `helm/qeetmart`

Example:

```bash
helm upgrade --install qeetmart helm/qeetmart -n qeetmart --create-namespace
```

## Notes

- Base manifests assume external PostgreSQL/Redis instances per service.
- Replace all placeholder secrets before deploying.
- Use staging/prod overlays with immutable image tags.
