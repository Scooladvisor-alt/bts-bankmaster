import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Liste tous les utilisateurs — accessible aux admins ET teachers via service role
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();

  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin' && user.role !== 'teacher') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const users = await base44.asServiceRole.entities.User.list(null, 200);
  return Response.json({ users: users || [] });
});