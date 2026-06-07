import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { safeLocale, safeDate } from '../utils/safeFormat';

interface ShareholderAppProps {
  currentUser: any;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  lang: string;
  setLang: (v: string) => void;
  onLogout: () => void;
}

const i18n = {
  fr: {
    home: 'Accueil', sharesTab: 'Actions', dividends: 'Dividendes', documents: 'Documents', profile: 'Profil',
    totalShares: 'Total Actions', totalDividends: 'Total Dividendes', portfolioValue: 'Valeur Portefeuille',
    activeProjects: 'Projets Actifs', totalRevenue: 'CA Total', employees: 'Effectifs',
    certificate: 'Certificat', qty: 'Parts', price: 'Prix', acquired: 'Acquis', value: 'Valeur',
    fiscalYear: 'Annee Fiscale', amount: 'Montant', status: 'Statut', paid: 'Paye', pending: 'En Attente',
    noShares: 'Aucune action pour le moment', noDividends: 'Aucun dividende disponible',
    settings: 'Parametres', legalDocs: 'Documents Legaux', faq: 'FAQ', logout: 'Deconnexion',
    darkMode: 'Mode Sombre', language: 'Langue', back: 'Retour', sign: 'Signer le document',
    signedOn: 'Signe le', company: 'TSDFILS SARLU', subtitle: 'Espace Actionnaire', role: 'Actionnaire',
    metrics: 'Metriques Entreprise', gnf: 'GNF'
  },
  en: {
    home: 'Home', sharesTab: 'Shares', dividends: 'Dividends', documents: 'Documents', profile: 'Profile',
    totalShares: 'Total Shares', totalDividends: 'Total Dividends', portfolioValue: 'Portfolio Value',
    activeProjects: 'Active Projects', totalRevenue: 'Total Revenue', employees: 'Employees',
    certificate: 'Certificate', qty: 'Shares', price: 'Price', acquired: 'Acquired', value: 'Value',
    fiscalYear: 'Fiscal Year', amount: 'Amount', status: 'Status', paid: 'Paid', pending: 'Pending',
    noShares: 'No shares at this time', noDividends: 'No dividends available',
    settings: 'Settings', legalDocs: 'Legal Documents', faq: 'FAQ', logout: 'Logout',
    darkMode: 'Dark Mode', language: 'Language', back: 'Back', sign: 'Sign document',
    signedOn: 'Signed on', company: 'TSDFILS SARLU', subtitle: 'Shareholder Portal', role: 'Shareholder',
    metrics: 'Company Metrics', gnf: 'GNF'
  }
};

const legalDocs = [
  { key: 'confidentiality', fr: 'Politique de Confidentialite', en: 'Confidentiality Policy' },
  { key: 'shareholder_pact', fr: "Pacte d'Actionnaires", en: "Shareholders' Agreement" },
  { key: 'statutes', fr: 'Statuts de la Societe', en: 'Company Statutes' },
  { key: 'non_compete', fr: 'Clause de Non-Concurrence', en: 'Non-Compete Clause' },
  { key: 'data_protection', fr: 'Protection des Donnees', en: 'Data Protection' },
  { key: 'share_transfer', fr: "Clause de Cession d'Actions", en: 'Share Transfer Clause' },
  { key: 'preemptive_rights', fr: 'Droit de Preemption', en: 'Preemptive Rights' },
  { key: 'limited_liability', fr: 'Responsabilite Limitee', en: 'Limited Liability' },
];

const legalTexts: Record<string, string[]> = {
  confidentiality: [
    "Confidentialite stricte de toutes les informations partagees entre TSDFILS SARLU et ses actionnaires.",
    "Protection des donnees personnelles selon les standards internationaux applicables.",
    "Restriction d'acces aux documents confidentiels aux seules parties autorisees.",
    "Obligation de non-divulgation pour une periode de 5 ans minimum apres cessation.",
    "Sanctions legales en cas de violation de confidentialite par une partie.",
    "Exceptions uniquement pour obligations legales ou judiciaires dument constatees.",
  ],
  shareholder_pact: [
    "Accord entre actionnaires regissant les relations et droits de chacun au sein de la societe.",
    "Conditions d'entree et de sortie du capital social definies par les parties.",
    "Droits de vote et pouvoirs de direction attribues selon la participation.",
    "Mecanismes de resolution de litiges entre actionnaires (mediation, arbitrage).",
    "Droit de preemption en cas de cession d'actions par un actionnaire.",
    "Clauses de drag-along et tag-along pour proteger les minoritaires.",
  ],
  statutes: [
    "Forme juridique: Societe a Responsabilite Limitee (SARL) de droit guineen.",
    "Capital social defini et divise en parts sociales egalitaires.",
    "Gerant(s) nommes selon les dispositions statutaires en assemblee.",
    "Assemblee generale ordinaire tenue au moins une fois par an.",
    "Remuneration du gerant et politique de distribution des dividendes.",
    "Dissolution et liquidation selon la legislation en vigueur.",
  ],
  non_compete: [
    "Interdiction de concurrence pendant toute la duree du mandat d'actionnaire.",
    "Restriction geographique applicable sur le territoire de la Republique de Guinee.",
    "Duree post-mandat: 2 ans apres cessation de fonctions ou cession des parts.",
    "Liste des activites explicitement interdites definie en annexe.",
    "Compensation financiere prevue en cas de non-respect de la clause.",
    "Clause de non-solicitation des clients et employes de TSDFILS SARLU.",
  ],
  data_protection: [
    "Conformite aux normes de protection des donnees personnelles des actionnaires.",
    "Droit d'acces, rectification et suppression des donnees sur demande.",
    "Consentement explicite requis pour tout traitement de donnees personnelles.",
    "Securite renforcee des systemes informatiques hebergeant les donnees.",
    "Notification obligatoire en cas de fuite ou violation de donnees.",
    "Responsable de la protection des donnees designe au sein de la societe.",
  ],
  share_transfer: [
    "Restrictions a la cession libre d'actions sans accord prealable.",
    "Notification prealable au gerant de toute cession envisagee (30 jours).",
    "Droit de preemption de la SARL et des autres actionnaires existants.",
    "Prix de cession determine selon des criteres d'evaluation definis.",
    "Delai de retractation: 30 jours apres notification de la cession.",
    "Signature obligatoire d'un acte de cession devant notaire.",
  ],
  preemptive_rights: [
    "Droit de priorite pour l'acquisition de nouvelles actions emises.",
    "Application prioritaire lors de toute augmentation de capital social.",
    "Droit de suite en cas de cession par un autre actionnaire.",
    "Delai d'exercice: 15 jours a compter de la notification officielle.",
    "Exercice proportionnel a la participation actuelle dans le capital.",
    "Conditions tarifaires preferentielles pour les actionnaires existants.",
  ],
  limited_liability: [
    "Responsabilite de chaque actionnaire limitee au montant de son apport.",
    "Aucune responsabilite personnelle sur les dettes sociales de la societe.",
    "Exceptions: fraude, abus de biens sociaux, confusion de patrimoine.",
    "Couverture d'assurance responsabilite civile mise en place par la societe.",
    "Indemnisation du gerant selon les polices d'assurance souscrites.",
    "Fonds de reserve constitue pour faire face aux situations de crise.",
  ],
};

const faqData = [
  { q: { fr: "Quels sont mes droits en tant qu'actionnaire ?", en: "What are my rights as a shareholder?" }, a: { fr: "Vous avez le droit de vote aux assemblees generales, de recevoir des dividendes proportionnels a vos parts, et d'acceder aux informations financieres de la societe.", en: "You have voting rights at general meetings, the right to receive dividends proportional to your shares, and access to the company's financial information." }},
  { q: { fr: "Comment sont distribues les dividendes ?", en: "How are dividends distributed?" }, a: { fr: "Les dividendes sont distribues apres approbation en assemblee generale annuelle. Le paiement s'effectue selon le calendrier etabli par le gerant.", en: "Dividends are distributed after approval at the annual general meeting. Payment follows the schedule set by the manager." }},
  { q: { fr: "Puis-je transferer mes actions ?", en: "Can I transfer my shares?" }, a: { fr: "Oui, sous conditions: notification prealable, droit de preemption des autres actionnaires, et accord du gerant conformement au pacte d'actionnaires.", en: "Yes, subject to conditions: prior notification, pre-emption rights of other shareholders, and manager approval per the shareholder agreement." }},
  { q: { fr: "Comment voter aux assemblees ?", en: "How do I vote at meetings?" }, a: { fr: "Un vote par action detenue. Les scrutins se font en assemblee generale annuelle ou extraordinaire sur convocation du gerant.", en: "One vote per share held. Voting occurs at annual or extraordinary general meetings called by the manager." }},
  { q: { fr: "Qui contacter en cas de question ?", en: "Who should I contact?" }, a: { fr: "Contactez le siege social de TSDFILS SARLU ou l'adresse email du gerant. Tous les documents legaux sont disponibles dans votre espace.", en: "Contact TSDFILS SARLU head office or the manager's email. All legal documents are available in your portal." }},
];

export default function ShareholderApp({ currentUser, darkMode, setDarkMode, lang, setLang, onLogout }: ShareholderAppProps) {
  const [screen, setScreen] = useState<string>('home');
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [shares, setShares] = useState<any[]>([]);
  const [dividends, setDividends] = useState<any[]>([]);
  const [agreements, setAgreements] = useState<any[]>([]);
  const [stats, setStats] = useState({ projects: 0, revenue: 0, employees: 0 });
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const C = {
    primary: '#1e40af', secondary: '#3b82f6', accent: '#D4AF37', success: '#10B981', danger: '#EF4444',
    warning: '#F59E0B', card: darkMode ? '#1e293b' : '#FFFFFF', bg: darkMode ? '#0f172a' : '#f8fafc',
    gray: darkMode ? '#0f172a' : '#f1f5f9', light: darkMode ? '#334155' : '#e2e8f0',
    text: darkMode ? '#f1f5f9' : '#0f172a', textSecondary: darkMode ? '#94a3b8' : '#64748b',
    border: darkMode ? '#334155' : '#cbd5e1',
  };

  const txt = i18n[lang as keyof typeof i18n] || i18n.fr;
  const l = lang as 'fr' | 'en';

  useEffect(() => {
    if (!currentUser?.id) return;
    (async () => {
      const [sharesRes, dividendsRes, agreementsRes] = await Promise.all([
        supabase.from('shareholder_shares').select('*').eq('user_id', currentUser.id),
        supabase.from('shareholder_dividends').select('*').eq('user_id', currentUser.id),
        supabase.from('shareholder_agreements').select('*').eq('user_id', currentUser.id),
      ]);
      setShares(sharesRes.data || []);
      setDividends(dividendsRes.data || []);
      setAgreements(agreementsRes.data || []);
      const [ch, inv, usr] = await Promise.all([
        supabase.from('chantiers').select('id', { count: 'exact', head: true }),
        supabase.from('invoices').select('amount'),
        supabase.from('app_users').select('id', { count: 'exact', head: true }),
      ]);
      setStats({ projects: ch.count || 0, revenue: (inv.data || []).reduce((s: number, i: any) => s + (i.amount || 0), 0), employees: usr.count || 0 });
    })();
  }, [currentUser?.id]);

  const signDoc = async (docKey: string) => {
    await supabase.from('shareholder_agreements').insert([{ user_id: currentUser.id, agreement_type: docKey, signed_at: new Date().toISOString(), signature_text: `${currentUser.email}-${Date.now()}`, ip_address: '0.0.0.0' }]);
    const res = await supabase.from('shareholder_agreements').select('*').eq('user_id', currentUser.id);
    setAgreements(res.data || []);
  };

  const navItems = [
    { k: 'home', i: '🏠', l: txt.home },
    { k: 'shares', i: '📊', l: txt.sharesTab },
    { k: 'dividends', i: '💰', l: txt.dividends },
    { k: 'documents', i: '📋', l: txt.documents },
    { k: 'profile', i: '👤', l: txt.profile },
  ];

  const Nav = () => (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.card, padding: '10px 8px 14px', display: 'flex', justifyContent: 'space-around', boxShadow: `0 -2px 20px ${darkMode ? 'rgba(0,0,0,0.6)' : 'rgba(30,64,175,0.08)'}`, borderRadius: '22px 22px 0 0', zIndex: 100, borderTop: `1px solid ${C.light}` }}>
      {navItems.map(x => (
        <button key={x.k} onClick={() => { setScreen(x.k); setSelectedDoc(null); }} style={{ background: screen === x.k ? `${C.primary}12` : 'transparent', border: 'none', cursor: 'pointer', padding: '8px 12px', borderRadius: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
          <span style={{ fontSize: '18px' }}>{x.i}</span>
          <span style={{ fontSize: '10px', fontWeight: screen === x.k ? 700 : 500, color: screen === x.k ? C.primary : C.textSecondary }}>{x.l}</span>
          {screen === x.k && <div style={{ width: '18px', height: '3px', borderRadius: '2px', background: C.primary, marginTop: '1px' }} />}
        </button>
      ))}
    </div>
  );

  // Document detail sub-screen
  if (selectedDoc) {
    const doc = legalDocs.find(d => d.key === selectedDoc);
    const signed = agreements.find(a => a.agreement_type === selectedDoc);
    const content = legalTexts[selectedDoc] || [];
    return (
      <div style={{ background: C.bg, minHeight: '100vh', color: C.text, paddingBottom: '100px' }}>
        <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: `1px solid ${C.light}` }}>
          <button onClick={() => setSelectedDoc(null)} style={{ background: 'none', border: 'none', color: C.primary, fontSize: '20px', cursor: 'pointer' }}>←</button>
          <span style={{ fontWeight: 600, fontSize: '15px' }}>{doc?.[l] || selectedDoc}</span>
        </div>
        <div style={{ padding: '16px' }}>
          <div style={{ background: C.card, padding: '16px', borderRadius: '12px', border: `1px solid ${C.border}`, marginBottom: '16px' }}>
            {content.map((point, i) => (
              <div key={i} style={{ marginBottom: i < content.length - 1 ? '12px' : 0, paddingBottom: i < content.length - 1 ? '12px' : 0, borderBottom: i < content.length - 1 ? `1px solid ${C.light}` : 'none' }}>
                <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.6', color: C.text }}>
                  <span style={{ color: C.accent, fontWeight: 'bold' }}>•</span> {point}
                </p>
              </div>
            ))}
          </div>
          {signed ? (
            <div style={{ background: `${C.success}15`, border: `1px solid ${C.success}`, padding: '14px', borderRadius: '10px', textAlign: 'center' }}>
              <span style={{ color: C.success, fontWeight: 600, fontSize: '14px' }}>✓ {txt.signedOn} {safeDate(signed.signed_at, lang)}</span>
            </div>
          ) : (
            <button onClick={() => signDoc(selectedDoc)} style={{ width: '100%', background: C.primary, color: '#fff', border: 'none', padding: '14px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
              {txt.sign}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Settings sub-screen
  if (screen === 'settings') {
    return (
      <div style={{ background: C.bg, minHeight: '100vh', color: C.text }}>
        <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: `1px solid ${C.light}` }}>
          <button onClick={() => setScreen('profile')} style={{ background: 'none', border: 'none', color: C.primary, fontSize: '20px', cursor: 'pointer' }}>←</button>
          <span style={{ fontWeight: 600, fontSize: '16px' }}>{txt.settings}</span>
        </div>
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ background: C.card, padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid ${C.border}` }}>
            <span style={{ fontSize: '14px', fontWeight: 500 }}>{darkMode ? '🌙' : '☀️'} {txt.darkMode}</span>
            <button onClick={() => setDarkMode(!darkMode)} style={{ width: '48px', height: '26px', borderRadius: '13px', background: darkMode ? C.secondary : C.light, border: 'none', cursor: 'pointer', position: 'relative' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#FFF', position: 'absolute', top: '3px', left: darkMode ? '25px' : '3px', transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
            </button>
          </div>
          <div style={{ background: C.card, padding: '16px', borderRadius: '12px', border: `1px solid ${C.border}` }}>
            <span style={{ fontSize: '14px', fontWeight: 500, display: 'block', marginBottom: '10px' }}>🌍 {txt.language}</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setLang('fr')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: lang === 'fr' ? C.primary : C.light, color: lang === 'fr' ? '#fff' : C.text, cursor: 'pointer', fontWeight: 600 }}>FR</button>
              <button onClick={() => setLang('en')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: lang === 'en' ? C.primary : C.light, color: lang === 'en' ? '#fff' : C.text, cursor: 'pointer', fontWeight: 600 }}>EN</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // FAQ sub-screen
  if (screen === 'faq') {
    return (
      <div style={{ background: C.bg, minHeight: '100vh', color: C.text }}>
        <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: `1px solid ${C.light}` }}>
          <button onClick={() => setScreen('profile')} style={{ background: 'none', border: 'none', color: C.primary, fontSize: '20px', cursor: 'pointer' }}>←</button>
          <span style={{ fontWeight: 600, fontSize: '16px' }}>{txt.faq}</span>
        </div>
        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {faqData.map((faq, i) => (
            <div key={i} style={{ background: C.card, borderRadius: '10px', overflow: 'hidden', border: `1px solid ${C.border}` }}>
              <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} style={{ width: '100%', background: 'none', border: 'none', padding: '14px', textAlign: 'left', color: C.text, fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{faq.q[l]}</span>
                <span>{faqOpen === i ? '−' : '+'}</span>
              </button>
              {faqOpen === i && (
                <div style={{ padding: '12px 14px', background: C.bg, borderTop: `1px solid ${C.light}`, fontSize: '13px', color: C.textSecondary, lineHeight: '1.6' }}>
                  {faq.a[l]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Main screens with bottom nav
  const totalShares = shares.reduce((s, x) => s + (x.num_shares || 0), 0);
  const totalDividends = dividends.reduce((s, x) => s + (x.amount || 0), 0);
  const portfolioValue = shares.reduce((s, x) => s + ((x.num_shares || 0) * (x.share_price || 0)), 0);
  const initials = (currentUser?.name || currentUser?.email || 'U').substring(0, 2).toUpperCase();

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text, paddingBottom: '100px' }}>
      {screen === 'home' && (
        <>
          <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #1e40af, #2563eb)', color: '#fff', padding: '24px 16px', textAlign: 'center', borderRadius: '0 0 20px 20px' }}>
            <div style={{ fontSize: '20px', fontWeight: 700 }}>{txt.company}</div>
            <div style={{ fontSize: '13px', marginTop: '4px', opacity: 0.9 }}>{txt.subtitle}</div>
          </div>
          <div style={{ padding: '16px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {[{ l: txt.totalShares, v: String(totalShares) }, { l: txt.totalDividends, v: safeLocale(totalDividends) + ' ' + txt.gnf }, { l: txt.portfolioValue, v: safeLocale(portfolioValue) + ' ' + txt.gnf }].map((s, i) => (
              <div key={i} style={{ background: C.card, padding: '14px 8px', borderRadius: '12px', border: `1px solid ${C.border}`, textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: C.textSecondary, marginBottom: '6px' }}>{s.l}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: C.accent }}>{s.v}</div>
              </div>
            ))}
          </div>
          <div style={{ background: C.card, margin: '8px 12px', padding: '16px', borderRadius: '12px', border: `1px solid ${C.border}` }}>
            <div style={{ fontWeight: 600, marginBottom: '12px', fontSize: '14px' }}>{txt.metrics}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {[{ l: txt.activeProjects, v: stats.projects }, { l: txt.totalRevenue, v: safeLocale(stats.revenue) }, { l: txt.employees, v: stats.employees }].map((m, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '10px', background: C.bg, borderRadius: '8px' }}>
                  <div style={{ fontSize: '10px', color: C.textSecondary, marginBottom: '4px' }}>{m.l}</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: C.primary }}>{m.v}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {screen === 'shares' && (
        <>
          <div style={{ padding: '16px', borderBottom: `1px solid ${C.light}`, fontWeight: 600, fontSize: '16px' }}>{txt.sharesTab}</div>
          {shares.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: C.textSecondary }}>{txt.noShares}</div>
          ) : (
            <div style={{ padding: '12px' }}>
              {shares.map((s, i) => (
                <div key={i} style={{ background: C.card, padding: '14px', marginBottom: '8px', borderRadius: '12px', border: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{s.certificate_number || '-'}</span>
                    <span style={{ fontSize: '14px', color: C.accent, fontWeight: 700 }}>{safeLocale((s.num_shares || 0) * (s.share_price || 0))} {txt.gnf}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px', color: C.textSecondary }}>
                    <div>{txt.qty}: {s.num_shares}</div>
                    <div>{txt.price}: {safeLocale(s.share_price)}</div>
                    <div>{txt.acquired}: {safeDate(s.acquired_at, lang)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {screen === 'dividends' && (
        <>
          <div style={{ padding: '16px', borderBottom: `1px solid ${C.light}`, fontWeight: 600, fontSize: '16px' }}>{txt.dividends}</div>
          {dividends.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: C.textSecondary }}>{txt.noDividends}</div>
          ) : (
            <div style={{ padding: '12px' }}>
              {dividends.map((d, i) => (
                <div key={i} style={{ background: C.card, padding: '14px', marginBottom: '8px', borderRadius: '12px', border: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{d.fiscal_year}</span>
                    <span style={{ background: d.status === 'paid' ? C.success : C.warning, color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>{d.status === 'paid' ? txt.paid : txt.pending}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: C.textSecondary }}>
                    <span>{safeLocale(d.amount)} {txt.gnf}</span>
                    <span>{safeDate(d.distributed_at, lang)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {screen === 'documents' && (
        <>
          <div style={{ padding: '16px', borderBottom: `1px solid ${C.light}`, fontWeight: 600, fontSize: '16px' }}>{txt.legalDocs}</div>
          <div style={{ padding: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {legalDocs.map(doc => {
              const isSigned = agreements.some(a => a.agreement_type === doc.key);
              return (
                <button key={doc.key} onClick={() => setSelectedDoc(doc.key)} style={{ background: C.card, border: `1px solid ${isSigned ? C.success : C.border}`, padding: '14px 10px', borderRadius: '12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
                  <span style={{ fontSize: '24px' }}>📄</span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: C.text, lineHeight: '1.3' }}>{doc[l]}</span>
                  {isSigned && <span style={{ fontSize: '10px', color: C.success, fontWeight: 600 }}>✓ {txt.signedOn}</span>}
                </button>
              );
            })}
          </div>
        </>
      )}

      {screen === 'profile' && (
        <>
          <div style={{ padding: '24px 16px', textAlign: 'center', background: C.card, borderBottom: `1px solid ${C.light}` }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontWeight: 700, fontSize: '22px' }}>{initials}</div>
            <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>{currentUser?.name || currentUser?.email}</div>
            <div style={{ fontSize: '13px', color: C.textSecondary }}>{txt.role}</div>
          </div>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { icon: '⚙️', label: txt.settings, action: () => setScreen('settings') },
              { icon: '📋', label: txt.legalDocs, action: () => setScreen('documents') },
              { icon: '❓', label: txt.faq, action: () => setScreen('faq') },
            ].map((item, i) => (
              <button key={i} onClick={item.action} style={{ background: C.card, border: `1px solid ${C.border}`, padding: '16px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
                <span style={{ fontSize: '20px' }}>{item.icon}</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: C.text }}>{item.label}</span>
              </button>
            ))}
            <button onClick={onLogout} style={{ background: '#FEE2E2', border: `2px solid ${C.danger}30`, padding: '16px', borderRadius: '12px', cursor: 'pointer', color: C.danger, fontWeight: 700, fontSize: '14px', marginTop: '8px' }}>
              🚪 {txt.logout}
            </button>
          </div>
        </>
      )}

      <Nav />
    </div>
  );
}
