const PartnerDashboard = ({ currentUser, darkMode, onBack, onToggleDarkMode }: any) => {
  const cards = [
    { title: 'Contrats', text: 'Consulter les contrats de partenariat.' },
    { title: 'Projets associés', text: 'Suivre les projets liés au partenariat.' },
    { title: 'Factures & paiements', text: 'Voir les paiements, factures et échéances.' },
    { title: 'Documents partagés', text: 'Accéder aux fichiers et documents officiels.' },
    { title: 'Confidentialité', text: 'Clauses, NDA et politiques de confidentialité.' },
    { title: 'Accords & signatures', text: 'Signer ou consulter les accords validés.' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: darkMode ? '#0f172a' : '#eef6fb',
      color: darkMode ? '#fff' : '#0f172a',
      padding: 30,
      fontFamily: 'Arial, sans-serif',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 30 }}>
        <button onClick={onBack}>Déconnexion</button>
        <button onClick={onToggleDarkMode}>Mode</button>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, #0ea5e9, #0f766e)',
        color: '#fff',
        padding: 30,
        borderRadius: 24,
        marginBottom: 30,
        boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
      }}>
        <h1 style={{ margin: 0 }}>Espace Partenaire</h1>
        <p style={{ fontSize: 18 }}>
          Bienvenue {currentUser?.name || 'Partenaire'}
        </p>
        <p>
          Accédez à vos contrats, projets associés, documents partagés, clauses de confidentialité et accords.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 20,
      }}>
        {cards.map((card) => (
          <div key={card.title} style={{
            background: darkMode ? '#1e293b' : '#ffffff',
            padding: 24,
            borderRadius: 18,
            boxShadow: '0 10px 30px rgba(0,0,0,0.10)',
            border: darkMode ? '1px solid #334155' : '1px solid #dbeafe',
          }}>
            <h3 style={{ marginTop: 0 }}>{card.title}</h3>
            <p style={{ opacity: 0.8 }}>{card.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PartnerDashboard;