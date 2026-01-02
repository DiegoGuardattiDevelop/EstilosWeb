import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    // Use Server render mode for dynamic routes with params to avoid prerender errors
    renderMode: RenderMode.Server
  }
];
