// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client';
import './index.css';
import { AbilityProvider } from '@/providers/AbilityProvider';
import { AuthProvider } from '@/providers/auth/auth';
import { LocaleProvider } from '@/providers/LocaleContext';
import App from './App';
import '@ant-design/v5-patch-for-react-19';

createRoot(document.getElementById('root') as HTMLElement).render(
  <LocaleProvider>
    <AuthProvider>
      <AbilityProvider>
        <App />
      </AbilityProvider>
    </AuthProvider>
  </LocaleProvider>,
);
