# Fix: Windows Turbopack Symlink Error with PostgreSQL

## The Problem

When running Next.js with Turbopack on Windows, you may encounter this error:

```
create symlink to ../../../node_modules/pg
Caused by: A required privilege is not held by the client. (os error 1314)
```

This happens because Turbopack tries to create symlinks, but Windows requires special privileges for symlinks.

## Solution: Enable Developer Mode in Windows

### Option 1: Enable Developer Mode (Recommended)

This is the easiest and most permanent solution:

1. **Open Windows Settings**
   - Press `Win + I` or search for "Settings"

2. **Navigate to Developer Settings**
   - Windows 11: `Privacy & Security` → `For developers`
   - Windows 10: `Update & Security` → `For developers`

3. **Enable Developer Mode**
   - Toggle "Developer Mode" to **ON**
   - Click "Yes" when prompted to confirm
   - Wait for Windows to install required packages

4. **Restart Your Terminal**
   - Close all PowerShell/CMD windows
   - Close VS Code
   - Reopen VS Code and your terminal

5. **Restart Next.js Dev Server**
   ```bash
   npm run dev
   ```

### Option 2: Run as Administrator (Temporary)

If you can't enable Developer Mode, run VS Code as Administrator:

1. Close VS Code
2. Right-click on VS Code icon
3. Select "Run as administrator"
4. Open your project and run `npm run dev`

**Note**: This works but is not convenient for daily development.

### Option 3: Disable Turbopack (Fallback)

If neither option works, disable Turbopack and use Webpack instead:

1. Update your `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "dev:turbo": "next dev --turbo"
  }
}
```

2. The `dev` command will now use Webpack by default (slower but works)
3. Turbopack is still experimental, so Webpack is more stable anyway

## Verify the Fix

After enabling Developer Mode:

1. Delete the `.next` folder:

   ```bash
   rm -r .next
   ```

2. Start the dev server:

   ```bash
   npm run dev
   ```

3. You should see:
   ```
   ▲ Next.js 16.1.0 (Turbopack)
   - Local:         http://localhost:3000
   ✓ Ready in XXXms
   ```

## Why This Happens

- **Symlinks** are shortcuts that point to other files/folders
- **Turbopack** uses symlinks for fast module resolution
- **Windows** requires Developer Mode or Admin rights to create symlinks
- **Linux/Mac** don't have this restriction

## Additional Resources

- [Windows Developer Mode Documentation](https://learn.microsoft.com/en-us/windows/apps/get-started/enable-your-device-for-development)
- [Next.js Turbopack Documentation](https://nextjs.org/docs/architecture/turbopack)
- [GitHub Issue: pg + Turbopack on Windows](https://github.com/vercel/next.js/issues/48748)

## Still Having Issues?

If you're still getting errors after enabling Developer Mode:

1. **Check database connection**:
   - Verify your `.env.local` file has correct Supabase credentials
   - Make sure `POSTGRES_HOST` is just the hostname, not the full connection string

2. **Check for other errors**:
   - Look at the terminal output for database connection errors
   - Check if tables are created in Supabase

3. **Clear build cache**:
   ```bash
   rm -r .next
   rm -r node_modules
   npm install
   npm run dev
   ```

---

**Current Status**: Your `.env.local` and code are configured correctly. The only issue is the Windows symlink permission.
