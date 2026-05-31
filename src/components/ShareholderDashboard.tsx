const ShareholderDashboard = ({ currentUser, darkMode, onBack, onToggleDarkMode }: any) => {
  return (
    <div style={{ padding: 30, minHeight: '100vh', background: darkMode ? '#111827' : '#f8fafc', color: darkMode ? '#fff' : '#111827' }}>
      <button onClick={onBack}>Déconnexion</button>
      <button onClick={onToggleDarkMode} style={{ marginLeft: 10 }}>Mode</button>

      <h1>Interface Actionnaire</h1>
      <p>Bienvenue {currentUser?.name || 'Actionnaire'}</p>

      <h2>Mes accès</h2>
      <ul>
        <li>Mes actions</li>
        <li>Dividendes</li>
        <li>Rapports financiers</li>
        <li>Assemblées générales</li>
        <li>Documents légaux</li>
        <li>Politiques de confidentialité</li>
        <li>Accords et signatures</li>
      </ul>
    </div>
  );
};

export default ShareholderDashboard;