import AppProvider from '@/app/AppProvider';
import AppRoutes from '@/app/AppRoutes';

function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}

export default App;
