import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { safeDate } from '../utils/safeFormat';

interface AssociateDashboardProps {
  currentUser: any;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  lang: string;
  setLang: (v: string) => void;
  onLogout: () => void;
}

const i18n = {
  fr: {
    home: 'Accueil', missions: 'Missions', documents: 'Documents', agreements: 'Accords', profile: 'Profil',
    settings: 'Parametres', faq: 'FAQ', logout: 'Deconnexion', back: 'Retour',
    darkMode: 'Mode Sombre', language: 'Langue', appearance: 'Apparence',
    enabled: 'Active', disabled: 'Desactive',
    company: 'TSDFILS SARLU', subtitle: 'Espace Associe', role: 'Associe',
    associateNumber: 'Numero d\'associe', status: 'Statut', active: 'Actif',
    myInfo: 'Mes Informations', assignedMissions: 'Missions Associees',
    sharedDocs: 'Documents Partages', agreementsSign: 'Accords et Signatures',
    legalMentions: 'Mentions Legales', confidentiality: 'Politique de Confidentialite',
    noMissions: 'Aucune mission assignee', noDocs: 'Aucun document partage',
    sign: 'Signer le document', signedOn: 'Signe le',
    account: 'Compte', phone: 'Telephone', dob: 'Date de naissance',
    contractDate: 'Date signature contrat', maritalStatus: 'Etat civil',
    notifications: 'Notifications', pushNotif: 'Notifications push',
    notifDesc: 'Missions, documents, mises a jour', notifActive: 'Actif',
    about: 'A propos', version: 'Version', application: 'Application',
  },
  en: {
    home: 'Home', missions: 'Missions', documents: 'Documents', agreements: 'Agreements', profile: 'Profile',
    settings: 'Settings', faq: 'FAQ', logout: 'Logout', back: 'Back',
    darkMode: 'Dark Mode', language: 'Language', appearance: 'Appearance',
    enabled: 'Enabled', disabled: 'Disabled',
    company: 'TSDFILS SARLU', subtitle: 'Associate Portal', role: 'Associate',
    associateNumber: 'Associate Number', status: 'Status', active: 'Active',
    myInfo: 'My Information', assignedMissions: 'Assigned Missions',
    sharedDocs: 'Shared Documents', agreementsSign: 'Agreements & Signatures',
    legalMentions: 'Legal Mentions', confidentiality: 'Confidentiality Policy',
    noMissions: 'No assigned missions', noDocs: 'No shared documents',
    sign: 'Sign document', signedOn: 'Signed on',
    account: 'Account', phone: 'Phone', dob: 'Date of birth',
    contractDate: 'Contract date', maritalStatus: 'Marital status',
    notifications: 'Notifications', pushNotif: 'Push notifications',
    notifDesc: 'Missions, documents, updates', notifActive: 'Active',
    about: 'About', version: 'Version', application: 'Application',
  },
};

const legalDocs = [
  { key: 'associate_agreement', fr: 'Accord d\'Association', en: 'Association Agreement' },
  { key: 'confidentiality', fr: 'Politique de Confidentialite', en: 'Confidentiality Policy' },
  { key: 'non_compete', fr: 'Clause de Non-Concurrence', en: 'Non-Compete Clause' },
  { key: 'data_protection', fr: 'Protection des Donnees', en: 'Data Protection' },
  { key: 'liability', fr: 'Clause de Responsabilite', en: 'Liability Clause' },
  { key: 'termination', fr: 'Clause de Resiliation', en: 'Termination Clause' },
  { key: 'intellectual_property', fr: 'Propriete Intellectuelle', en: 'Intellectual Property' },
  { key: 'dispute_resolution', fr: 'Reglement des Litiges', en: 'Dispute Resolution' },
];

const legalTexts: Record<string, string[]> = {
  associate_agreement: [
    "Cet accord definit les droits et obligations de l'associe au sein de TSDFILS SARLU.",
    "L'associe participe aux decisions strategiques selon sa part de contribution.",
    "Les assemblees generales sont convoquees au moins une fois par trimestre.",
    "L'associe a acces aux rapports financiers et aux bilans de la societe.",
    "Les conditions de sortie du statut d'associe sont definies dans le present accord.",
    "L'associe s'engage a promouvoir les interets de TSDFILS SARLU dans ses activites.",
  ],
  confidentiality: [
    "L'associe s'engage a maintenir confidentielle toute information strategique.",
    "Les donnees commerciales, financieres et techniques sont protegees.",
    "L'obligation de confidentialite persiste 5 ans apres cessation du statut.",
    "Les informations ne peuvent etre divulguees sans accord ecrit prealable.",
    "Les violations entraineront des sanctions et dommages-interets.",
    "Les informations deja publiques sont exclues de cette obligation.",
  ],
  non_compete: [
    "L'associe ne peut exercer d'activite concurrente pendant la duree de l'accord.",
    "Restriction geographique: territoire de la Guinee et pays limitrophes.",
    "Duree post-accord: 24 mois apres cessation du statut d'associe.",
    "Les activites concurrentes incluent tout service similaire a TSDFILS SARLU.",
    "Clause de non-sollicitation des clients et employes pendant 3 ans.",
    "Des exceptions peuvent etre accordees par le conseil d'administration.",
  ],
  data_protection: [
    "L'associe s'engage a respecter les normes de protection des donnees.",
    "Les donnees personnelles sont traitees uniquement aux fins de l'association.",
    "Droit d'acces, de rectification et de suppression garanti.",
    "Notification obligatoire sous 48h en cas de violation de donnees.",
    "Securisation des systemes informatiques hebergeant les donnees.",
    "Audit de conformite possible a la demande de la direction.",
  ],
  liability: [
    "Responsabilite de l'associe limitee a sa part de contribution au capital.",
    "Aucune responsabilite personnelle sur les dettes sociales de la societe.",
    "Obligation d'assurance responsabilite civile professionnelle.",
    "Plafond de responsabilite fixe au montant de l'apport de l'associe.",
    "Exclusion de responsabilite en cas de force majeure.",
    "Les reclamations doivent etre presentees dans un delai de 90 jours.",
  ],
  termination: [
    "Resiliation possible avec un preavis ecrit de 90 jours.",
    "Resiliation immediate en cas de faute grave ou manquement contractuel.",
    "Restitution de tous les biens et documents dans les 15 jours.",
    "Reglement final des comptes dans les 60 jours suivant la resiliation.",
    "Les clauses de confidentialite et non-concurrence survivent a la resiliation.",
    "Droit de rachat des parts par les autres associes.",
  ],
  intellectual_property: [
    "Les creations realisees dans le cadre de l'association appartiennent a TSDFILS SARLU.",
    "L'associe conserve ses droits intellectuels preexistants.",
    "Licence d'utilisation reciproque pendant la duree de l'accord.",
    "Protection des secrets de fabrication et du savoir-faire technique.",
    "Interdiction de depot de brevet sur les creations communes sans accord.",
    "Retrocession des droits en cas de fin d'association.",
  ],
  dispute_resolution: [
    "Tentative de resolution amiable obligatoire pendant 30 jours.",
    "Mediation par un mediateur agree en cas d'echec de negociation.",
    "Arbitrage selon les regles OHADA en dernier recours.",
    "Tribunal competent: juridiction commerciale de Conakry.",
    "Loi applicable: droit commercial guineen et OHADA.",
    "Frais de procedure partages egalement entre les parties.",
  ],
};

const faqData = [
  { q: { fr: "Quels sont mes droits en tant qu'associe ?", en: "What are my rights as an associate?" }, a: { fr: "Participation aux assemblees, droit de vote, acces aux rapports financiers, et partage des benefices.", en: "Participation in meetings, voting rights, access to financial reports, and profit sharing." } },
  { q: { fr: "Comment sont reparties les missions ?", en: "How are missions assigned?" }, a: { fr: "Les missions sont attribuees par le conseil d'administration selon les competences et disponibilites.", en: "Missions are assigned by the board based on skills and availability." } },
  { q: { fr: "Comment modifier mes informations ?", en: "How to update my information?" }, a: { fr: "Contactez l'administration a admin@tsdetfils.com pour toute modification.", en: "Contact administration at admin@tsdetfils.com for any changes." } },
  { q: { fr: "Quelle est la duree de mon accord ?", en: "What is my agreement duration?" }, a: { fr: "L'accord est reconductible annuellement sauf preavis de 90 jours.", en: "The agreement is annually renewable unless 90 days notice is given." } },
  { q: { fr: "Comment contacter le support ?", en: "How to contact support?" }, a: { fr: "Email: associes@tsdetfils.com - Reponse sous 24h.", en: "Email: associes@tsdetfils.com - Response within 24h." } },
];

export default function AssociateDashboard({ currentUser, darkMode, setDarkMode, lang, setLang, onLogout }: AssociateDashboardProps) {
  const t = i18n[lang as keyof typeof i18n] || i18n.fr;
  const [screen, setScreen] = useState('home');
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [agreements, setAgreements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const c = {
    primary: '#7C3AED', secondary: '#8B5CF6', accent: '#A78BFA',
    success: '#10B981', danger: '#EF4444', warning: '#F59E0B',
    card: darkMode ? '#1e293b' : '#FFFFFF',
    bg: darkMode ? '#0f172a' : '#f8fafc',
    text: darkMode ? '#f1f5f9' : '#0f172a',
    muted: darkMode ? '#94a3b8' : '#64748b',
    border: darkMode ? '#334155' : '#e2e8f0',
    light: darkMode ? '#334155' : '#e2e8f0',
  };

  useEffect(() => { loadData(); }, [currentUser?.id]);

  const loadData = async () => {
    setLoading(true);
    const uid = currentUser?.id;
    if (!uid) { setLoading(false); return; }
    const { data } = await supabase.from('partner_agreements').select('*').eq('user_id', uid);
    setAgreements(data || []);
    setLoading(false);
  };

  const signDoc = async (docKey: string) => {
    await supabase.from('partner_agreements').insert([{
      user_id: currentUser?.id,
      agreement_type: docKey,
      signed_at: new Date().toISOString(),
      signature_text: `Signed by ${currentUser?.email}`,
    }]);
    loadData();
  };

  const isSigned = (key: string) => agreements.some(a => a.agreement_type === key);
  const signDate = (key: string) => { const a = agreements.find(x => x.agreement_type === key); return a ? safeDate(a.signed_at, lang) : null; };

  const navItems = [
    { s: 'home', icon: '🏠', label: t.home },
    { s: 'missions', icon: '📋', label: t.missions },
    { s: 'documents', icon: '📄', label: t.documents },
    { s: 'agreements', icon: '✍️', label: t.agreements },
    { s: 'profile', icon: '👤', label: t.profile },
  ];

  const Header = ({ title, icon }: { title: string; icon: string }) => (
    <div style={{ background: 'linear-gradient(135deg, #5B21B6, #7C3AED, #8B5CF6)', padding: '24px 20px', paddingTop: '48px', color: 'white' }}>
      <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>{icon} {title}</h2>
    </div>
  );

  const Nav = () => (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: c.card, padding: '8px 4px 14px', display: 'flex', justifyContent: 'space-around', boxShadow: '0 -4px 20px rgba(0,0,0,0.1)', borderRadius: '20px 20px 0 0', zIndex: 100, borderTop: `1px solid ${c.border}` }}>
      {navItems.map(n => (
        <button key={n.s} onClick={() => { setScreen(n.s); setSelectedDoc(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 10px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <span style={{ fontSize: '19px' }}>{n.icon}</span>
          <span style={{ fontSize: '9px', fontWeight: screen === n.s ? '700' : '400', color: screen === n.s ? c.primary : c.muted }}>{n.label}</span>
          {screen === n.s && <div style={{ width: '16px', height: '3px', borderRadius: '2px', background: c.primary, marginTop: '1px' }} />}
        </button>
      ))}
    </div>
  );

  if (loading) return <div style={{ background: c.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.text }}>Chargement...</div>;

  // Agreement detail
  if (screen === 'agreements' && selectedDoc) {
    const doc = legalDocs.find(d => d.key === selectedDoc);
    const txt = legalTexts[selectedDoc] || [];
    const signed = isSigned(selectedDoc);
    return (
      <div style={{ background: c.bg, minHeight: '100vh', color: c.text, paddingBottom: '90px' }}>
        <Header title={doc ? doc[lang as 'fr' | 'en'] || doc.fr : ''} icon="📋" />
        <div style={{ padding: '20px' }}>
          <button onClick={() => setSelectedDoc(null)} style={{ background: c.primary, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px', fontWeight: '600' }}>← {t.back}</button>
          <div style={{ background: c.card, padding: '20px', borderRadius: '14px', border: `1px solid ${c.border}`, marginBottom: '20px' }}>
            {txt.map((l, i) => <p key={i} style={{ margin: '12px 0', lineHeight: '1.7', fontSize: '14px' }}>• {l}</p>)}
          </div>
          {signed ? (
            <div style={{ background: `${c.success}18`, border: `1px solid ${c.success}`, color: c.success, padding: '16px', borderRadius: '10px', textAlign: 'center', fontWeight: '600' }}>✓ {t.signedOn} {signDate(selectedDoc)}</div>
          ) : (
            <button onClick={() => signDoc(selectedDoc)} style={{ width: '100%', background: c.primary, color: 'white', border: 'none', padding: '16px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '15px' }}>{t.sign}</button>
          )}
        </div>
        <Nav />
      </div>
    );
  }

  return (
    <div style={{ background: c.bg, minHeight: '100vh', color: c.text, paddingBottom: '90px' }}>

      {screen === 'home' && (<>
        <Header title={`${t.company} - ${t.subtitle}`} icon="🏢" />
        <div style={{ padding: '20px', display: 'grid', gap: '14px' }}>
          {/* Avatar + info */}
          <div style={{ background: c.card, padding: '20px', borderRadius: '14px', border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '22px', fontWeight: '700', flexShrink: 0 }}>
              {(currentUser?.name || 'A')[0].toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '16px', fontWeight: '700', color: c.text }}>{currentUser?.name || '-'}</div>
              <div style={{ fontSize: '12px', color: c.muted, marginTop: '2px' }}>{t.associateNumber}: {currentUser?.associate_number || '-'}</div>
              <div style={{ marginTop: '6px', display: 'inline-block', background: `${c.success}20`, color: c.success, padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>{t.active}</div>
            </div>
          </div>

          {/* Quick access cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button onClick={() => setScreen('missions')} style={{ background: c.card, border: `1px solid ${c.border}`, padding: '18px 14px', borderRadius: '14px', cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📋</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: c.text }}>{t.assignedMissions}</div>
            </button>
            <button onClick={() => setScreen('documents')} style={{ background: c.card, border: `1px solid ${c.border}`, padding: '18px 14px', borderRadius: '14px', cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📄</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: c.text }}>{t.sharedDocs}</div>
            </button>
            <button onClick={() => setScreen('agreements')} style={{ background: c.card, border: `1px solid ${c.border}`, padding: '18px 14px', borderRadius: '14px', cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>✍️</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: c.text }}>{t.agreementsSign}</div>
            </button>
            <button onClick={() => setScreen('settings')} style={{ background: c.card, border: `1px solid ${c.border}`, padding: '18px 14px', borderRadius: '14px', cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚙️</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: c.text }}>{t.settings}</div>
            </button>
          </div>

          {/* Signature progress */}
          <div style={{ background: c.card, padding: '16px', borderRadius: '14px', border: `1px solid ${c.border}` }}>
            <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px' }}>{t.agreementsSign}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: c.light }}>
                <div style={{ height: '100%', borderRadius: '4px', background: c.success, width: `${(agreements.length / legalDocs.length) * 100}%` }} />
              </div>
              <span style={{ fontSize: '13px', fontWeight: '600', color: c.success }}>{agreements.length}/{legalDocs.length}</span>
            </div>
          </div>
        </div>
      </>)}

      {screen === 'missions' && (<>
        <Header title={t.assignedMissions} icon="📋" />
        <div style={{ padding: '20px' }}>
          <div style={{ background: c.card, padding: '40px 20px', borderRadius: '14px', border: `1px solid ${c.border}`, textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
            <div style={{ fontSize: '15px', color: c.muted }}>{t.noMissions}</div>
          </div>
        </div>
      </>)}

      {screen === 'documents' && (<>
        <Header title={t.sharedDocs} icon="📄" />
        <div style={{ padding: '20px' }}>
          <div style={{ background: c.card, padding: '40px 20px', borderRadius: '14px', border: `1px solid ${c.border}`, textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📄</div>
            <div style={{ fontSize: '15px', color: c.muted }}>{t.noDocs}</div>
          </div>
        </div>
      </>)}

      {screen === 'agreements' && (<>
        <Header title={t.agreementsSign} icon="✍️" />
        <div style={{ padding: '20px', display: 'grid', gap: '12px' }}>
          {legalDocs.map(d => (
            <button key={d.key} onClick={() => setSelectedDoc(d.key)} style={{ background: c.card, border: `1px solid ${c.border}`, padding: '16px', borderRadius: '12px', cursor: 'pointer', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>📜</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '14px', color: c.text }}>{d[lang as 'fr' | 'en'] || d.fr}</div>
                  {isSigned(d.key) && <div style={{ fontSize: '11px', color: c.success }}>✓ {t.signedOn} {signDate(d.key)}</div>}
                </div>
                <span style={{ color: c.primary }}>→</span>
              </div>
            </button>
          ))}
        </div>
      </>)}

      {screen === 'profile' && (<>
        <div style={{ background: 'linear-gradient(135deg, #5B21B6, #7C3AED, #8B5CF6)', padding: '30px 20px', paddingTop: '50px', color: 'white', textAlign: 'center' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '28px', fontWeight: '700' }}>{(currentUser?.name || 'A')[0].toUpperCase()}</div>
          <h2 style={{ margin: '0 0 4px', fontSize: '20px' }}>{currentUser?.name}</h2>
          <p style={{ margin: 0, fontSize: '13px', opacity: 0.8 }}>{currentUser?.email}</p>
          <div style={{ marginTop: '6px', fontSize: '12px', opacity: 0.7 }}>{t.associateNumber}: {currentUser?.associate_number || '-'}</div>
          <div style={{ marginTop: '8px', display: 'inline-block', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '12px', fontSize: '12px' }}>{t.role}</div>
        </div>
        <div style={{ padding: '20px', display: 'grid', gap: '12px' }}>
          <button onClick={() => setScreen('settings')} style={{ background: c.card, border: `1px solid ${c.border}`, padding: '16px', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px', color: c.text, fontSize: '15px', fontWeight: '600' }}>⚙️ {t.settings}</button>
          <button onClick={() => setScreen('faq')} style={{ background: c.card, border: `1px solid ${c.border}`, padding: '16px', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px', color: c.text, fontSize: '15px', fontWeight: '600' }}>❓ {t.faq}</button>
          <button onClick={() => setScreen('agreements')} style={{ background: c.card, border: `1px solid ${c.border}`, padding: '16px', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px', color: c.text, fontSize: '15px', fontWeight: '600' }}>✍️ {t.agreementsSign}</button>
          <button onClick={onLogout} style={{ background: c.danger, border: 'none', padding: '16px', borderRadius: '12px', cursor: 'pointer', color: 'white', fontWeight: '600', fontSize: '15px', marginTop: '8px' }}>🚪 {t.logout}</button>
        </div>
      </>)}

      {screen === 'settings' && (<>
        <Header title={t.settings} icon="⚙️" />
        <div style={{ padding: '20px' }}>
          <button onClick={() => setScreen('profile')} style={{ background: c.primary, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px', fontWeight: '600' }}>← {t.back}</button>

          {/* Dark mode */}
          <div style={{ background: c.card, padding: '20px', borderRadius: '14px', border: `1px solid ${c.border}`, marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: c.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>{t.appearance}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '22px' }}>{darkMode ? '🌙' : '☀️'}</span>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '15px', color: c.text }}>{t.darkMode}</div>
                  <div style={{ fontSize: '12px', color: c.muted }}>{darkMode ? t.enabled : t.disabled}</div>
                </div>
              </div>
              <button onClick={() => setDarkMode(!darkMode)} style={{ width: '52px', height: '28px', borderRadius: '14px', border: 'none', cursor: 'pointer', background: darkMode ? c.primary : '#cbd5e1', position: 'relative', transition: 'background 0.3s' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: darkMode ? '27px' : '3px', transition: 'left 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
              </button>
            </div>
          </div>

          {/* Language */}
          <div style={{ background: c.card, padding: '20px', borderRadius: '14px', border: `1px solid ${c.border}`, marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: c.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>{t.language}</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setLang('fr')} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: `2px solid ${lang === 'fr' ? c.primary : c.border}`, background: lang === 'fr' ? (darkMode ? 'rgba(124,58,237,0.15)' : '#f5f3ff') : c.card, cursor: 'pointer' }}>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>🇫🇷</div>
                <div style={{ fontSize: '13px', fontWeight: lang === 'fr' ? '700' : '500', color: lang === 'fr' ? c.primary : c.text }}>Francais</div>
              </button>
              <button onClick={() => setLang('en')} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: `2px solid ${lang === 'en' ? c.primary : c.border}`, background: lang === 'en' ? (darkMode ? 'rgba(124,58,237,0.15)' : '#f5f3ff') : c.card, cursor: 'pointer' }}>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>🇬🇧</div>
                <div style={{ fontSize: '13px', fontWeight: lang === 'en' ? '700' : '500', color: lang === 'en' ? c.primary : c.text }}>English</div>
              </button>
            </div>
          </div>

          {/* Account info */}
          <div style={{ background: c.card, padding: '20px', borderRadius: '14px', border: `1px solid ${c.border}`, marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: c.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>{t.account}</div>
            {[
              { icon: '👤', val: currentUser?.name || '-', sub: currentUser?.email },
              { icon: '🔢', val: currentUser?.associate_number || '-', sub: t.associateNumber },
              { icon: '📞', val: currentUser?.phone || '-', sub: t.phone },
              { icon: '🎂', val: safeDate(currentUser?.date_of_birth || currentUser?.birth_date, lang), sub: t.dob },
              { icon: '📅', val: safeDate(currentUser?.contract_signature_date || currentUser?.contract_date, lang), sub: t.contractDate },
              { icon: '💍', val: currentUser?.marital_status || '-', sub: t.maritalStatus },
            ].map((item, i) => (
              <div key={i}>
                {i > 0 && <div style={{ height: '1px', background: c.border, margin: '12px 0' }} />}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '18px' }}>{item.icon}</span>
                  <div><div style={{ fontSize: '14px', fontWeight: '600', color: c.text }}>{item.val}</div><div style={{ fontSize: '11px', color: c.muted }}>{item.sub}</div></div>
                </div>
              </div>
            ))}
          </div>

          {/* Notifications */}
          <div style={{ background: c.card, padding: '20px', borderRadius: '14px', border: `1px solid ${c.border}`, marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: c.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>{t.notifications}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '18px' }}>🔔</span>
                <div><div style={{ fontSize: '14px', fontWeight: '600', color: c.text }}>{t.pushNotif}</div><div style={{ fontSize: '11px', color: c.muted }}>{t.notifDesc}</div></div>
              </div>
              <div style={{ background: c.success, color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>{t.notifActive}</div>
            </div>
          </div>

          {/* About */}
          <div style={{ background: c.card, padding: '20px', borderRadius: '14px', border: `1px solid ${c.border}`, marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: c.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>{t.about}</div>
            <div style={{ display: 'grid', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: c.text }}>{t.application}</span><span style={{ color: c.muted }}>TSDFILS SARLU</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: c.text }}>{t.version}</span><span style={{ color: c.muted }}>1.0.0</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: c.text }}>{t.role}</span><span style={{ color: c.primary, fontWeight: '600' }}>{t.role}</span></div>
            </div>
          </div>

          <button onClick={onLogout} style={{ width: '100%', background: c.danger, color: 'white', border: 'none', padding: '16px', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', fontSize: '15px' }}>🚪 {t.logout}</button>
        </div>
      </>)}

      {screen === 'faq' && (<>
        <Header title={t.faq} icon="❓" />
        <div style={{ padding: '20px' }}>
          <button onClick={() => setScreen('profile')} style={{ background: c.primary, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px', fontWeight: '600' }}>← {t.back}</button>
          {faqData.map((f, i) => (
            <div key={i} style={{ background: c.card, padding: '16px', borderRadius: '14px', border: `1px solid ${c.border}`, marginBottom: '12px' }}>
              <div style={{ fontWeight: '600', marginBottom: '8px', color: c.primary, fontSize: '14px' }}>{f.q[lang as 'fr' | 'en'] || f.q.fr}</div>
              <div style={{ fontSize: '13px', color: c.muted, lineHeight: '1.6' }}>{f.a[lang as 'fr' | 'en'] || f.a.fr}</div>
            </div>
          ))}
        </div>
      </>)}

      <Nav />
    </div>
  );
}
