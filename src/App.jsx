import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Landing from '@/pages/Landing';
import Subject from '@/pages/Subject';
import Module from '@/pages/Module';
import Admin from '@/pages/Admin';
import Teacher from '@/pages/Teacher';
import AmfRevision from '@/pages/AmfRevision';
import TradingDesk from '@/pages/TradingDesk';
import VojesAnalyseur from '@/pages/VojesAnalyseur';
import CesbfProgramme from '@/pages/CesbfProgramme';
import Anglais from '@/pages/Anglais';
import AnglaisVocabulaire from '@/pages/AnglaisVocabulaire';
import CultureGenerale from '@/pages/CultureGenerale';
import FelicitationToast from '@/components/felicitations/FelicitationToast';
import GlobalLoginGate from '@/components/GlobalLoginGate';
import Holidays from '@/pages/Holidays';


// FERMETURE VACANCES — le gate intercepte tout et affiche la page vacances.
// Les routes réelles sont conservées (pour ne pas casser la base de code) mais
// ne sont jamais atteintes : HolidaysGate ignore ses children.
const HolidaysGate = ({ children }) => <Holidays />;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Pendant les vacances : tout est bloqué, on affiche Holidays.
  return (
    <HolidaysGate>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/teacher/:subject" element={<Teacher />} />
        <Route path="/teacher" element={<Teacher />} />
        <Route path="/cesbf/amf" element={<AmfRevision />} />
        <Route path="/cesbf/amf/trading" element={<TradingDesk />} />
        <Route path="/vojes/analyseur" element={<VojesAnalyseur />} />
        <Route path="/cesbf/programme" element={<CesbfProgramme />} />
        <Route path="/anglais" element={<Anglais />} />
        <Route path="/anglais/vocabulaire" element={<AnglaisVocabulaire />} />
        <Route path="/culture-generale" element={<CultureGenerale />} />

        <Route path="/:subject" element={<Subject />} />
        <Route path="/:subject/:method" element={<Module />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </HolidaysGate>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
          <FelicitationToast />
          <GlobalLoginGate />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App