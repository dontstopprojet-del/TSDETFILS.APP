import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import LoginScreen from './components/LoginScreen';
import ShareholderApp from './components/ShareholderApp';
import PartnerApp from './components/PartnerApp';
import AssociateDashboard from './components/AssociateDashboard';

function App() {
  const [session, setSession] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [lang, setLang] = useState('fr');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) loadUser(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) loadUser(session.user.id);
      else { setCurrentUser(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUser = async (userId: string) => {
    const { data } = await supabase
      .from('app_users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    setCurrentUser(data);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setSession(null);
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
        <div style={{ color: '#94a3b8', fontSize: '18px' }}>Chargement...</div>
      </div>
    );
  }

  if (!session || !currentUser) {
    return <LoginScreen darkMode={darkMode} lang={lang} onLogin={(user: any) => setCurrentUser(user)} />;
  }

  const role = currentUser.role;

  if (role === 'shareholder') {
    return <ShareholderApp currentUser={currentUser} darkMode={darkMode} setDarkMode={setDarkMode} lang={lang} setLang={setLang} onLogout={handleLogout} />;
  }

  if (role === 'partner') {
    return <PartnerApp currentUser={currentUser} darkMode={darkMode} setDarkMode={setDarkMode} lang={lang} setLang={setLang} onLogout={handleLogout} />;
  }

  if (role === 'associate') {
    return <AssociateDashboard currentUser={currentUser} darkMode={darkMode} setDarkMode={setDarkMode} lang={lang} setLang={setLang} onLogout={handleLogout} />;
  }

  if (role === 'admin') {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: darkMode ? '#0f172a' : '#f8fafc', gap: '20px' }}>
        <h1 style={{ color: darkMode ? '#f1f5f9' : '#0f172a', fontSize: '24px' }}>TSDFILS SARLU - Admin</h1>
        <p style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>Bienvenue {currentUser.name}</p>
        <button onClick={handleLogout} style={{ padding: '12px 24px', background: '#EF4444', color: '#FFF', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '600' }}>Deconnexion</button>
      </div>
    );
  }

  // Default for client/tech/office - basic view
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: darkMode ? '#0f172a' : '#f8fafc', gap: '20px' }}>
      <h1 style={{ color: darkMode ? '#f1f5f9' : '#0f172a', fontSize: '24px' }}>TSDFILS SARLU</h1>
      <p style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>Bienvenue {currentUser.name} ({role})</p>
      <button onClick={handleLogout} style={{ padding: '12px 24px', background: '#EF4444', color: '#FFF', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '600' }}>Deconnexion</button>
    </div>
  );
}

export default App;
