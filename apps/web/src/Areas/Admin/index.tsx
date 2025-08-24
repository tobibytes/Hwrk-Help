import { FRONT_ROUTES, buildPath } from '@/app/routes';

export default function AdminArea() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Talvra Admin</h1>
      <p>Welcome to the Talvra learning platform administration area.</p>
      
      <nav style={{ marginTop: '2rem' }}>
        <h2>Navigation</h2>
        <ul>
          <li>
            <a href={buildPath(FRONT_ROUTES.ADMIN)}>
              {FRONT_ROUTES.ADMIN.name}
            </a>
          </li>
          <li>
            <a href={buildPath(FRONT_ROUTES.COURSES)}>
              {FRONT_ROUTES.COURSES.name}
            </a>
          </li>
        </ul>
      </nav>

      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '4px' 
      }}>
        <h3>Phase 1: Frontend Base</h3>
        <p>✅ Task T010: Scaffold Vite React app and structure</p>
        <ul>
          <li>✅ Created Vite React TypeScript app</li>
          <li>✅ Added path aliases for @/, @ui, @hooks, @constants, @routes, @api</li>
          <li>✅ Created Areas folder structure</li>
          <li>✅ Added AppProvider, AppRoutes, and routes.ts</li>
          <li>✅ Admin page renders successfully</li>
        </ul>
      </div>
    </div>
  );
}
