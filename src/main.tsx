import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import EditCourse from './pages/instructor/EditCourse';

createRoot(document.getElementById("root")!).render(<App />);
