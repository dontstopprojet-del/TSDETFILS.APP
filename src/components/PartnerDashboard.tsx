const PartnerDashboard = ({ currentUser, darkMode, onBack, onToggleDarkMode }: any) => {
  const cards = [
    {
      icon: '📁',
      title: 'Contrats de partenariat',
      text: 'Consulter et gérer tous vos contrats de partenariat.',
      badge: '',
    },
    {
      icon: '💼',
      title: 'Projets associés',
      text: 'Suivre les projets qui vous sont associés en temps réel.',
      badge: '',
    },
    {
      icon: '💵',
      title: 'Factures & paiements',
      text: 'Voir vos factures, paiements et échéances.',
      badge: '1',
    },
    {
      icon: '🗂️',
      title: 'Documents partagés',
      text: 'Accéder aux fichiers et documents officiels.',
      badge: '',
    },
    {
      icon: '🔒',
      title: 'Clauses de confidentialité',
      text: 'Consulter les NDA, clauses et politiques de confidentialité.',
      badge: '',
    },
    {
      icon: '📝',
      title: 'Accords & signatures',
      text: 'Signer ou consulter les accords et documents validés.',
      badge: '',
    },
  ];

  const navItems = [
    { icon: '🏠', label: 'Accueil' },
    { icon: '📋', label: 'Devis' },
    { icon: '📅', label: 'RDV' },
    { icon: '📊', label: 'Suivi' },
    { icon: '💰', label: 'Factures' },
    { icon: '👤', label: 'Profil' },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: darkMode ? '#0f172a' : '#f3f7fb',
        color: darkMode ? '#ffffff' : '#0f172a',
        fontFamily: 'Arial, sans-serif',
        padding: '22px',
        paddingBottom: '110px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '22px',
        }}
      >
        <button
          onClick={onBack}
          style={{
            border: 'none',
            background: darkMode ? '#1e293b' : '#ffffff',
            color: darkMode ? '#ffffff' : '#0f172a',
            borderRadius: '18px',
            padding: '14px 18px',
            fontSize: '16px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(15, 23, 42, 0.10)',
          }}
        >
          ← Déconnexion
        </button>

        <button
          onClick={onToggleDarkMode}
          style={{
            border: 'none',
            background: darkMode ? '#1e293b' : '#ffffff',
            color: darkMode ? '#ffffff' : '#0f172a',
            borderRadius: '18px',
            padding: '14px 18px',
            fontSize: '16px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(15, 23, 42, 0.10)',
          }}
        >
          Mode {darkMode ? '☀️' : '🌙'}
        </button>
      </div>

      <div
        style={{
          background: 'linear-gradient(135deg, #0069d9 0%, #1fb6ff 55%, #0f766e 100%)',
          borderRadius: '28px',
          padding: '34px',
          marginBottom: '26px',
          color: '#ffffff',
          boxShadow: '0 18px 45px rgba(37, 99, 235, 0.30)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: '-50px',
            top: '-40px',
            width: '220px',
            height: '220px',
            background: 'rgba(255,255,255,0.14)',
            borderRadius: '50%',
          }}
        />

        <div
          style={{
            display: 'flex',
            gap: '22px',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: '105px',
              height: '105px',
              borderRadius: '50%',
              border: '6px solid rgba(255,255,255,0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '46px',
              fontWeight: 800,
              background: 'rgba(255,255,255,0.12)',
              boxShadow: '0 12px 30px rgba(0,0,0,0.20)',
              flexShrink: 0,
            }}
          >
            {(currentUser?.name || 'P').charAt(0).toUpperCase()}
          </div>

          <div>
            <h1 style={{ margin: 0, fontSize: '34px', fontWeight: 800 }}>
              Espace Partenaire 🤝
            </h1>

            <p style={{ margin: '12px 0 8px', fontSize: '20px', fontWeight: 700 }}>
              Bienvenue {currentUser?.name || 'Partenaire'} 👋
            </p>

            <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.6, maxWidth: '680px' }}>
              Accédez à vos contrats, projets associés, documents partagés,
              clauses de confidentialité et accords.
            </p>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '26px',
        }}
      >
        {cards.map((card) => (
          <div
            key={card.title}
            style={{
              background: darkMode ? '#1e293b' : '#ffffff',
              borderRadius: '24px',
              padding: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
              minHeight: '120px',
              boxShadow: darkMode
                ? '0 12px 30px rgba(0,0,0,0.25)'
                : '0 12px 30px rgba(15, 23, 42, 0.08)',
              border: darkMode ? '1px solid #334155' : '1px solid #e5eef8',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '20px',
                background: darkMode ? '#0f172a' : '#eef6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '34px',
                flexShrink: 0,
              }}
            >
              {card.icon}
            </div>

            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 8px', fontSize: '20px' }}>{card.title}</h3>
              <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.5, opacity: 0.75 }}>
                {card.text}
              </p>
            </div>

            {card.badge && (
              <span
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '48px',
                  background: '#ef4444',
                  color: '#ffffff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                }}
              >
                {card.badge}
              </span>
            )}

            <span style={{ fontSize: '32px', color: '#0ea5e9' }}>›</span>
          </div>
        ))}
      </div>

      <div
        style={{
          background: darkMode ? '#1e293b' : '#ffffff',
          borderRadius: '24px',
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '18px',
          boxShadow: darkMode
            ? '0 12px 30px rgba(0,0,0,0.25)'
            : '0 12px 30px rgba(15, 23, 42, 0.08)',
          border: darkMode ? '1px solid #334155' : '1px solid #e5eef8',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#2563eb',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '30px',
          }}
        >
          ℹ️
        </div>

        <div>
          <h3 style={{ margin: '0 0 8px', fontSize: '20px' }}>Espace sécurisé</h3>
          <p style={{ margin: 0, opacity: 0.75 }}>
            Toutes vos données sont protégées et accessibles uniquement selon votre autorisation.
          </p>
        </div>
      </div>

      <button
        style={{
          position: 'fixed',
          right: '24px',
          bottom: '188px',
          width: '66px',
          height: '66px',
          borderRadius: '50%',
          border: 'none',
          background: '#22c55e',
          color: '#ffffff',
          fontSize: '30px',
          cursor: 'pointer',
          boxShadow: '0 14px 30px rgba(34,197,94,0.35)',
          zIndex: 20,
        }}
      >
        ✉️
      </button>

      <button
        style={{
          position: 'fixed',
          right: '24px',
          bottom: '110px',
          width: '66px',
          height: '66px',
          borderRadius: '50%',
          border: 'none',
          background: '#2563eb',
          color: '#ffffff',
          fontSize: '30px',
          cursor: 'pointer',
          boxShadow: '0 14px 30px rgba(37,99,235,0.35)',
          zIndex: 20,
        }}
      >
        💬
      </button>

      <div
        style={{
          position: 'fixed',
          left: '22px',
          right: '22px',
          bottom: '22px',
          background: darkMode ? '#1e293b' : '#ffffff',
          borderRadius: '28px',
          padding: '14px 18px',
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '8px',
          boxShadow: '0 16px 40px rgba(15, 23, 42, 0.14)',
          border: darkMode ? '1px solid #334155' : '1px solid #e5eef8',
          zIndex: 15,
        }}
      >
        {navItems.map((item) => (
          <div
            key={item.label}
            style={{
              textAlign: 'center',
              padding: '8px 4px',
              borderRadius: '18px',
              background: item.label === 'Profil'
                ? darkMode
                  ? '#0f172a'
                  : '#e8f3ff'
                : 'transparent',
              color: item.label === 'Profil' ? '#0369a1' : darkMode ? '#ffffff' : '#475569',
              fontWeight: item.label === 'Profil' ? 800 : 500,
              fontSize: '13px',
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>{item.icon}</div>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PartnerDashboard;