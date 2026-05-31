const PartnerDashboard = ({ currentUser, darkMode, onBack, onToggleDarkMode }: any) => {
  return (
    <div style={{ padding: 30, minHeight: '100vh', background: darkMode ? '#111827' : '#f8fafc', color: darkMode ? '#fff' : '#111827' }}>
      <button onClick={onBack}>Déconnexion</button>
      <button onClick={onToggleDarkMode} style={{ marginLeft: 10 }}>Mode</button>

      <h1>Interface Partenaire</h1>
      <p>Bienvenue {currentUser?.name || 'Partenaire'}</p>

      <h2>Mes accès</h2>
      <ul>
        <li>Contrats de partenariat</li>
        <li>Projets associés</li>
        <li>Factures et paiements</li>
        <li>Documents partagés</li>
        <li>Clauses de confidentialité</li>
        <li>Mentions légales</li>
        <li>Accords et signatures</li>
      </ul>
    </div>
  );
};

export default PartnerDashboard;