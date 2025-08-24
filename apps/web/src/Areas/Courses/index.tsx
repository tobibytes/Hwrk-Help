import { FRONT_ROUTES, buildPath } from '@/app/routes';

export default function CoursesArea() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Courses</h1>
      <p>This will display the list of courses from Canvas integration.</p>
      
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
        backgroundColor: '#e8f4fd', 
        borderRadius: '4px' 
      }}>
        <h3>Coming in Future Tasks</h3>
        <ul>
          <li>T032: Frontend Courses list page</li>
          <li>Canvas integration and course data display</li>
          <li>Document management and study aids</li>
        </ul>
      </div>
    </div>
  );
}
