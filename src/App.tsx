import { lazy, Suspense, useEffect } from 'react';
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { InsumosProvider } from './contexts/InsumosContext';
import RotaProtegida from './components/auth/RotaProtegida';
import RotaPublica from './components/auth/RotaPublica';
import CarregamentoInicial from './components/CarregamentoInicial';

const carregarLogin = () => import('./pages/auth/Login');
const carregarSignup = () => import('./pages/auth/Signup');
const carregarDashboard = () => import('./pages/Dashboard/index');
const carregarStatus = () => import('./pages/Status');
const carregarConfirmarEmail = () => import('./pages/auth/ConfirmarEmail');
const carregarForgotPassword = () => import('./pages/auth/ForgotPassword');
const carregarResetPassword = () => import('./pages/auth/ResetPassword');
const carregarTermos = () => import('./pages/legal/Termos');
const carregarPrivacidade = () => import('./pages/legal/Privacidade');

const Login = lazy(carregarLogin);
const Signup = lazy(carregarSignup);
const Dashboard = lazy(carregarDashboard);
const Status = lazy(carregarStatus);
const ConfirmarEmail = lazy(carregarConfirmarEmail);
const ForgotPassword = lazy(carregarForgotPassword);
const ResetPassword = lazy(carregarResetPassword);
const Termos = lazy(carregarTermos);
const Privacidade = lazy(carregarPrivacidade);

function PrecarregarPaginas() {
  const { carregando } = useAuth();
  useEffect(() => {
    if (carregando) return;
    const conexao = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (conexao?.saveData || conexao?.effectiveType === 'slow-2g' || conexao?.effectiveType === '2g') return;

    const paginas = [carregarLogin, carregarSignup, carregarDashboard, carregarForgotPassword, carregarResetPassword, carregarConfirmarEmail, carregarStatus, carregarTermos, carregarPrivacidade];
    let cancelado = false;
    let agendamento: number;
    const proxima = () => {
      if (cancelado || paginas.length === 0) return;
      const carregar = paginas.shift()!;
      // Uma falha de pré-carregamento não impede a navegação ou as demais páginas.
      void carregar().catch(() => {}).finally(agendar);
    };
    const agendar = () => {
      if (cancelado || paginas.length === 0) return;
      if ('requestIdleCallback' in window) agendamento = window.requestIdleCallback(proxima);
      else agendamento = globalThis.setTimeout(proxima, 0);
    };
    agendar();
    return () => {
      cancelado = true;
      if ('cancelIdleCallback' in window) window.cancelIdleCallback(agendamento);
      else globalThis.clearTimeout(agendamento);
    };
  }, [carregando]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <InsumosProvider>
          <BrowserRouter>
            <Suspense fallback={<CarregamentoInicial />}>
            <Routes>
              {/* ============ ROTAS PÚBLICAS ============ */}
              <Route
                path="/"
                element={
                  <RotaPublica>
                    <Landing />
                  </RotaPublica>
                }
              />
              <Route
                path="/login"
                element={
                  <RotaPublica>
                    <Login />
                  </RotaPublica>
                }
              />
              <Route
                path="/signup"
                element={
                  <RotaPublica>
                    <Signup />
                  </RotaPublica>
                }
              />

              {/* ============ RECUPERAÇÃO DE SENHA ============ */}
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* ============ PÁGINAS DE STATUS (sempre acessíveis) ============ */}
              <Route path="/status" element={<Status />} />
              <Route path="/confirmar" element={<ConfirmarEmail />} />

              {/* ============ PÁGINAS LEGAIS (sempre acessíveis) ============ */}
              <Route path="/termos" element={<Termos />} />
              <Route path="/privacidade" element={<Privacidade />} />

              {/* ============ ROTAS PROTEGIDAS ============ */}
              <Route
                path="/dashboard"
                element={
                  <RotaProtegida>
                    <Dashboard />
                  </RotaProtegida>
                }
              />

              {/* ============ FALLBACK ============ */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <PrecarregarPaginas />
            </Suspense>
          </BrowserRouter>
        </InsumosProvider>
      </ToastProvider>
    </AuthProvider>
  );
}