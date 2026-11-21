import { useState, type FormEvent } from 'react';
import { authService } from '../../services/auth.service';
import RecoveryLayout from './RecoveryLayout';
export default function ForgotPassword() {
 const [email, setEmail] = useState(''); const [enviado, setEnviado] = useState(false); const [carregando, setCarregando] = useState(false); const [erro, setErro] = useState('');
 async function enviar(event: FormEvent) { event.preventDefault(); setErro(''); setCarregando(true); try { await authService.solicitarRecuperacao(email.trim()); setEnviado(true); } catch { setErro('Não foi possível enviar sua solicitação. Tente novamente mais tarde.'); } finally { setCarregando(false); } }
 return <RecoveryLayout title={enviado ? 'Confira seu e-mail' : 'Esqueceu sua senha?'} subtitle={enviado ? 'Se este e-mail estiver cadastrado, enviaremos um link para redefinir sua senha.' : 'Informe seu e-mail e enviaremos as instruções para recuperar seu acesso.'}>
 {enviado ? <div className="recovery-success" role="status"><span>✉</span><p>Verifique também sua caixa de spam. O link é válido por 1 hora.</p><button type="button" className="recovery-secondary" onClick={() => setEnviado(false)}>Tentar outro e-mail</button></div> : <form className="recovery-form flex flex-col gap-[9px]" onSubmit={enviar}>{erro && <div className="recovery-error" role="alert">{erro}</div>}<label htmlFor="email">E-mail</label><input id="email" type="email" autoComplete="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required maxLength={200} /><button className="recovery-submit flex items-center justify-center gap-[10px]" disabled={carregando}>{carregando ? 'Enviando...' : 'Enviar link de recuperação'} <span>→</span></button></form>}</RecoveryLayout>;
}
