# Cloudflare Deployment Error Fix

## Error
```
Service binding 'WORKER_SELF_REFERENCE' references Worker 'lumiere-restaurant-management' 
which was not found.
```

## Root Cause
- The Cloudflare Worker has a service binding configured that references the old worker name `lumiere-restaurant-management`
- The actual worker name is `restobar-management-system`
- This configuration is set in the Cloudflare Dashboard (remote config)

## Solution

### Option 1: Remove Service Binding (Recommended)
1. Go to Cloudflare Dashboard
2. Navigate to **Workers & Pages**
3. Click on `restobar-management-system` worker
4. Go to **Settings** → **Variables**
5. Scroll to **Service Bindings** section
6. **Delete** the `WORKER_SELF_REFERENCE` binding
7. Click **Save**
8. Try deploying again

### Option 2: Update Service Binding Name
If you need the service binding:
1. Follow steps 1-5 above
2. **Edit** the `WORKER_SELF_REFERENCE` binding
3. Change the worker reference from `lumiere-restaurant-management` to `restobar-management-system`
4. Click **Save**
5. Try deploying again

### Option 3: Create wrangler.toml (Override Remote Config)
Create a `wrangler.toml` file in the project root:

```toml
name = "restobar-management-system"
main = ".vercel/output/static/_worker.js"
compatibility_date = "2026-09-13"
workers_dev = false
preview_urls = false

[observability]
enabled = false

[observability.logs]
enabled = false

# Remove or comment out service bindings if not needed
# [[services]]
# binding = "WORKER_SELF_REFERENCE"
# service = "restobar-management-system"

# Environment variables
[vars]
NEXT_PUBLIC_SUPABASE_URL = "https://szfvjfvukicjmuxogglt.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY = "sb_publishable_F0YFhnyT82KlMNny7t3hUg_i89JPklS"
```

## Additional Notes

### Why Service Bindings Exist
Service bindings allow one Worker to call another Worker directly. If you don't need this feature (most Next.js apps don't), you can safely remove it.

### Compatibility Date Warning
The warning about compatibility_date difference (`2026-09-13` vs `2026-09-11`) is minor and won't cause deployment failure.

## Quick Fix Steps
**Easiest solution - Remove via Dashboard:**

1. Open: https://dash.cloudflare.com
2. Go to: Workers & Pages → restobar-management-system → Settings
3. Find: Service Bindings section
4. Delete: WORKER_SELF_REFERENCE
5. Save and redeploy

This should resolve the deployment error immediately.
