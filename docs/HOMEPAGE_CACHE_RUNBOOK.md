# Homepage cache revalidation runbook

## What is cached

- Route `/` (ISR revalidate every 300s).
- Hero critical payload (tag: `homepage:hero`).
- Secondary sections payload (tag: `homepage:sections`).

## Manual revalidation

Use protected endpoint:

```bash
curl -X POST \
  -H "x-revalidate-token: $REVALIDATE_TOKEN" \
  https://<your-domain>/api/revalidate/homepage
```

## When to trigger

- Hero curation content changed in admin.
- Production incident with stale hero/section payload.
- Post-release validation to guarantee fresh homepage shell.

## Rollback switch

Disable new behavior by setting env vars:

- `NEXT_PUBLIC_HOME_SERVER_FIRST_HERO=false`
- `NEXT_PUBLIC_HOME_DEFERRED_SECTIONS=false`

Each flag controls its own area:

- `NEXT_PUBLIC_HOME_SERVER_FIRST_HERO=false` → legacy server-rendered hero slider.
- `NEXT_PUBLIC_HOME_DEFERRED_SECTIONS=false` → legacy server-rendered secondary sections.
