import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { safeLocale, safeDate } from '../utils/safeFormat';

interface PartnerAppProps {
  currentUser: any;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  lang: string;
  setLang: (v: string) => void;
  onLogout: () => void;
}

const i18n = {
  fr: {
    home: 'Accueil', projects: 'Projets', revenue: 'Revenus', documents: 'Documents', profile: 'Profil',
    activePartners: 'Partenariats Actifs', totalRevenue: 'Revenus Totaux', statusActive: 'Statut Actif',
    ongoingProjects: 'Projets en cours', noProjects: 'Aucun projet en cours',
    projectName: 'Projet', sharePercent: 'Part', startDate: 'Debut', endDate: 'Fin',
    thisMonth: 'Ce mois', thisYear: 'Cette annee', perProject: 'Par Projet',
    settings: 'Parametres', legalDocs: 'Documents Legaux', faq: 'FAQ', logout: 'Deconnexion',
    darkMode: 'Mode Sombre', language: 'Langue', back: 'Retour', sign: 'Signer le document',
    signedOn: 'Signe le', company: 'TSDFILS SARLU', subtitle: 'Espace Partenaire', role: 'Partenaire',
    gnf: 'GNF', active: 'Actif', completed: 'Termine', inactive: 'Inactif',
  },
  en: {
    home: 'Home', projects: 'Projects', revenue: 'Revenue', documents: 'Documents', profile: 'Profile',
    activePartners: 'Active Partnerships', totalRevenue: 'Total Revenue', statusActive: 'Active Status',
    ongoingProjects: 'Ongoing Projects', noProjects: 'No active projects',
    projectName: 'Project', sharePercent: 'Share', startDate: 'Start', endDate: 'End',
    thisMonth: 'This Month', thisYear: 'This Year', perProject: 'Per Project',
    settings: 'Settings', legalDocs: 'Legal Documents', faq: 'FAQ', logout: 'Logout',
    darkMode: 'Dark Mode', language: 'Language', back: 'Back', sign: 'Sign document',
    signedOn: 'Signed on', company: 'TSDFILS SARLU', subtitle: 'Partner Portal', role: 'Partner',
    gnf: 'GNF', active: 'Active', completed: 'Completed', inactive: 'Inactive',
  }
};

const legalDocs = [
  { key: 'partnership', fr: 'Accord de Partenariat', en: 'Partnership Agreement' },
  { key: 'confidentiality', fr: 'Politique de Confidentialite', en: 'Confidentiality Policy' },
  { key: 'non_compete', fr: 'Clause de Non-Concurrence', en: 'Non-Compete Clause' },
  { key: 'data_protection', fr: 'Protection des Donnees Personnelles', en: 'Personal Data Protection' },
  { key: 'revenue_sharing', fr: 'Conditions de Partage des Revenus', en: 'Revenue Sharing Terms' },
  { key: 'liability', fr: 'Clause de Responsabilite', en: 'Liability Clause' },
  { key: 'termination', fr: 'Clause de Resiliation', en: 'Termination Clause' },
  { key: 'intellectual_property', fr: 'Propriete Intellectuelle', en: 'Intellectual Property' },
  { key: 'dispute_resolution', fr: 'Reglement des Litiges', en: 'Dispute Resolution' },
];

const legalTexts: Record<string, string[]> = {
  partnership: [
    "Cet accord etablit les termes et conditions de la relation commerciale entre TSDFILS SARLU et le partenaire.",
    "Le partenaire accepte de respecter tous les droits de propriete intellectuelle de TSDFILS SARLU.",
    "Duree du partenariat: reconductible annuellement par accord mutuel des deux parties.",
    "Obligations mutuelles de bonne foi et de cooperation dans l'execution du contrat.",
    "Clause de revision annuelle des termes et conditions du partenariat.",
    "Engagements reciproques en matiere de qualite des prestations fournies.",
  ],
  confidentiality: [
    "Confidentialite stricte de toutes les informations echangees dans le cadre du partenariat.",
    "Interdiction de divulgation a des tiers sans accord prealable ecrit de TSDFILS SARLU.",
    "Duree de l'obligation de confidentialite: 5 ans apres la fin du partenariat.",
    "Protection speciale des donnees commerciales, techniques et financieres.",
    "Sanctions contractuelles en cas de manquement a l'obligation de confidentialite.",
    "Restitution obligatoire de tous les documents confidentiels a la fin du contrat.",
  ],
  non_compete: [
    "Interdiction d'exercer une activite concurrente pendant la duree du partenariat.",
    "Restriction geographique: territoire de la Republique de Guinee et pays limitrophes.",
    "Duree post-contrat: 18 mois apres cessation du partenariat.",
    "Definition precise des activites concurrentes interdites au partenaire.",
    "Clause de non-sollicitation des clients de TSDFILS SARLU pendant 2 ans.",
    "Indemnite compensatrice en cas de restriction excessive de liberte commerciale.",
  ],
  data_protection: [
    "Respect des normes de protection des donnees personnelles en vigueur.",
    "Traitement des donnees personnelles limite aux finalites du partenariat.",
    "Securisation des donnees par des mesures techniques et organisationnelles.",
    "Notification sous 48h en cas de violation de donnees personnelles.",
    "Droit d'acces, de rectification et de suppression pour les personnes concernees.",
    "Sous-traitance du traitement des donnees interdite sans accord prealable.",
  ],
  revenue_sharing: [
    "Repartition des revenus selon le pourcentage contractuel defini par projet.",
    "Versement des parts de revenus dans un delai de 30 jours apres facturation.",
    "Transparence totale sur les revenus generes par chaque projet commun.",
    "Audit annuel des comptes relatifs au partage des revenus sur demande.",
    "Revision du pourcentage possible par accord mutuel tous les 12 mois.",
    "Modalites de calcul clairement definies et opposables aux deux parties.",
  ],
  liability: [
    "Responsabilite de chaque partie limitee aux dommages directs et previsibles.",
    "Plafond de responsabilite fixe au montant des revenus des 12 derniers mois.",
    "Exclusion de responsabilite en cas de force majeure dument constatee.",
    "Obligation d'assurance responsabilite civile professionnelle pour les deux parties.",
    "Notification sous 5 jours de tout evenement pouvant engager la responsabilite.",
    "Clause d'indemnisation reciproque en cas de manquement contractuel prouve.",
  ],
  termination: [
    "Resiliation possible par chaque partie avec un preavis de 3 mois.",
    "Resiliation immediate en cas de faute grave ou de manquement contractuel.",
    "Fautes graves: non-paiement pendant 60 jours, violation de confidentialite, concurrence.",
    "Effets de la resiliation: cessation des obligations futures, maintien des clauses survivantes.",
    "Restitution des biens et documents dans un delai de 15 jours apres resiliation.",
    "Reglement final des comptes dans les 30 jours suivant la date effective.",
  ],
  intellectual_property: [
    "Chaque partie conserve la propriete de ses droits intellectuels preexistants.",
    "Les creations conjointes appartiennent aux deux parties selon contribution.",
    "Licence d'utilisation reciproque pendant la duree du partenariat uniquement.",
    "Interdiction de depot de brevet ou marque sur les creations de l'autre partie.",
    "Protection des secrets de fabrication et du savoir-faire technique.",
    "Clause de retrocession des droits en cas de fin de partenariat.",
  ],
  dispute_resolution: [
    "Tentative de resolution amiable obligatoire pendant 30 jours avant toute action.",
    "Mediation par un mediateur agree en cas d'echec de la negociation directe.",
    "Arbitrage selon les regles OHADA en cas d'echec de la mediation.",
    "Tribunal competent: juridiction commerciale de Conakry, Republique de Guinee.",
    "Loi applicable: droit commercial guineen et dispositions de l'OHADA.",
    "Frais de procedure partages egalement entre les parties en premiere instance.",
  ],
};

const faqData = [
  { q: { fr: "Comment fonctionne le partage des revenus ?", en: "How does revenue sharing work?" }, a: { fr: "Les revenus sont partages selon le pourcentage defini dans votre contrat de partenariat. Le versement est effectue dans les 30 jours suivant la facturation de chaque projet.", en: "Revenue is shared according to the percentage defined in your partnership contract. Payment is made within 30 days of each project's invoicing." }},
  { q: { fr: "Comment sont attribues les projets ?", en: "How are projects assigned?" }, a: { fr: "Les projets sont attribues en fonction des competences, de la disponibilite et des termes de votre accord de partenariat avec TSDFILS SARLU.", en: "Projects are assigned based on skills, availability, and the terms of your partnership agreement with TSDFILS SARLU." }},
  { q: { fr: "Quelles sont mes responsabilites ?", en: "What are my responsibilities?" }, a: { fr: "Vous etes responsable de la qualite des prestations, du respect des delais, de la confidentialite et du respect des clauses de votre contrat.", en: "You are responsible for service quality, meeting deadlines, confidentiality, and compliance with your contract clauses." }},
  { q: { fr: "Comment resilier le partenariat ?", en: "How do I terminate the partnership?" }, a: { fr: "La resiliation est possible avec un preavis de 3 mois. En cas de faute grave, la resiliation peut etre immediate. Consultez la clause de resiliation.", en: "Termination is possible with 3 months notice. In case of serious breach, immediate termination applies. See the termination clause." }},
  { q: { fr: "Qui contacter en cas de probleme ?", en: "Who do I contact for issues?" }, a: { fr: "Contactez directement le siege social de TSDFILS SARLU ou votre referent partenariat. Tous les documents sont accessibles dans votre espace.", en: "Contact TSDFILS SARLU headquarters or your partnership representative. All documents are accessible in your portal." }},
];

export default function PartnerApp({ currentUser, darkMode, setDarkMode, lang, setLang, onLogout }: PartnerAppProps) {
  const [screen, setScreen] = useState<string>('home');
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [agreements, setAgreements] = useState<any[]>([]);
  const [projectCount, setProjectCount] = useState(0);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const C = {
    primary: '#0891B2', secondary: '#06B6D4', accent: '#14B8A6', success: '#10B981', danger: '#EF4444',
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
      const [projRes, agrRes, chRes] = await Promise.all([
        supabase.from('partner_projects').select('*').eq('partner_id', currentUser.id),
        supabase.from('partner_agreements').select('*').eq('user_id', currentUser.id),
        supabase.from('chantiers').select('id', { count: 'exact', head: true }),
      ]);
      setProjects(projRes.data || []);
      setAgreements(agrRes.data || []);
      setProjectCount(chRes.count || 0);
    })();
  }, [currentUser?.id]);

  const signDoc = async (docKey: string) => {
    await supabase.from('partner_agreements').insert([{ user_id: currentUser.id, agreement_type: docKey, signed_at: new Date().toISOString(), signature_text: `${currentUser.email}-${Date.now()}`, ip_address: '0.0.0.0' }]);
    const res = await supabase.from('partner_agreements').select('*').eq('user_id', currentUser.id);
    setAgreements(res.data || []);
  };

  const getStatusColor = (s: string) => s === 'active' ? C.success : s === 'completed' ? C.secondary : C.textSecondary;
  const getStatusLabel = (s: string) => s === 'active' ? txt.active : s === 'completed' ? txt.completed : txt.inactive;

  const navItems = [
    { k: 'home', i: '🏠', l: txt.home },
    { k: 'projects', i: '📁', l: txt.projects },
    { k: 'revenue', i: '💹', l: txt.revenue },
    { k: 'documents', i: '📋', l: txt.documents },
    { k: 'profile', i: '👤', l: txt.profile },
  ];

  const Nav = () => (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.card, padding: '10px 8px 14px', display: 'flex', justifyContent: 'space-around', boxShadow: `0 -2px 20px ${darkMode ? 'rgba(0,0,0,0.6)' : 'rgba(8,145,178,0.08)'}`, borderRadius: '22px 22px 0 0', zIndex: 100, borderTop: `1px solid ${C.light}` }}>
      {navItems.map(x => (
        <button key={x.k} onClick={() => { setScreen(x.k); setSelectedDoc(null); }} style={{ background: screen === x.k ? `${C.primary}12` : 'transparent', border: 'none', cursor: 'pointer', padding: '8px 12px', borderRadius: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
          <span style={{ fontSize: '18px' }}>{x.i}</span>
          <span style={{ fontSize: '10px', fontWeight: screen === x.k ? 700 : 500, color: screen === x.k ? C.primary : C.textSecondary }}>{x.l}</span>
          {screen === x.k && <div style={{ width: '18px', height: '3px', borderRadius: '2px', background: C.primary, marginTop: '1px' }} />}
        </button>
      ))}
    </div>
  );

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
                  <span style={{ color: C.primary, fontWeight: 'bold' }}>•</span> {point}
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

  const activeProjects = projects.filter(p => p.status === 'active').length;
  const totalRevenue = projects.reduce((s, p) => s + Math.floor(2500000 * ((p.revenue_share_pct || 0) / 100)), 0);
  const initials = (currentUser?.name || currentUser?.email || 'U').substring(0, 2).toUpperCase();

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text, paddingBottom: '100px' }}>
      {screen === 'home' && (
        <>
          <div style={{ background: 'linear-gradient(135deg, #065F7C, #0891B2, #06B6D4)', color: '#fff', padding: '24px 16px', textAlign: 'center', borderRadius: '0 0 20px 20px' }}>
            <div style={{ fontSize: '20px', fontWeight: 700 }}>{txt.company}</div>
            <div style={{ fontSize: '13px', marginTop: '4px', opacity: 0.9 }}>{txt.subtitle}</div>
          </div>
          <div style={{ padding: '16px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {[{ l: txt.activePartners, v: String(activeProjects) }, { l: txt.totalRevenue, v: safeLocale(totalRevenue) + ' ' + txt.gnf }, { l: txt.statusActive, v: txt.active }].map((s, i) => (
              <div key={i} style={{ background: C.card, padding: '14px 8px', borderRadius: '12px', border: `1px solid ${C.border}`, textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: C.textSecondary, marginBottom: '6px' }}>{s.l}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: C.accent }}>{s.v}</div>
              </div>
            ))}
          </div>
          <div style={{ background: C.card, margin: '8px 12px', padding: '16px', borderRadius: '12px', border: `1px solid ${C.border}` }}>
            <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>{txt.ongoingProjects}</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: C.primary }}>{projectCount}</div>
          </div>
        </>
      )}

      {screen === 'projects' && (
        <>
          <div style={{ padding: '16px', borderBottom: `1px solid ${C.light}`, fontWeight: 600, fontSize: '16px' }}>{txt.projects}</div>
          {projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: C.textSecondary }}>{txt.noProjects}</div>
          ) : (
            <div style={{ padding: '12px' }}>
              {projects.map((p, i) => (
                <div key={i} style={{ background: C.card, padding: '14px', marginBottom: '10px', borderRadius: '12px', border: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{p.project_name}</span>
                    <span style={{ background: getStatusColor(p.status), color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 600 }}>{getStatusLabel(p.status)}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: C.textSecondary, marginBottom: '6px' }}>
                    {safeDate(p.start_date, lang)} - {safeDate(p.end_date, lang)}
                  </div>
                  {p.description && <div style={{ fontSize: '12px', color: C.textSecondary, marginBottom: '8px' }}>{p.description}</div>}
                  <div style={{ borderTop: `1px solid ${C.light}`, paddingTop: '8px', fontSize: '13px', color: C.accent, fontWeight: 700 }}>
                    {txt.sharePercent}: {p.revenue_share_pct}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {screen === 'revenue' && (
        <>
          <div style={{ padding: '16px', borderBottom: `1px solid ${C.light}`, fontWeight: 600, fontSize: '16px' }}>{txt.revenue}</div>
          <div style={{ padding: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: C.card, padding: '14px', borderRadius: '12px', border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: '11px', color: C.textSecondary, marginBottom: '6px' }}>{txt.thisMonth}</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: C.primary }}>185K {txt.gnf}</div>
              </div>
              <div style={{ background: C.card, padding: '14px', borderRadius: '12px', border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: '11px', color: C.textSecondary, marginBottom: '6px' }}>{txt.thisYear}</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: C.secondary }}>2.1M {txt.gnf}</div>
              </div>
            </div>
            <div style={{ background: C.card, padding: '14px', borderRadius: '12px', border: `1px solid ${C.border}` }}>
              <div style={{ fontWeight: 600, marginBottom: '10px', fontSize: '14px' }}>{txt.perProject}</div>
              {projects.map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < projects.length - 1 ? `1px solid ${C.light}` : 'none', fontSize: '13px' }}>
                  <span style={{ color: C.text }}>{p.project_name}</span>
                  <span style={{ color: C.accent, fontWeight: 700 }}>{safeLocale(Math.floor(2500000 * ((p.revenue_share_pct || 0) / 100)))} {txt.gnf}</span>
                </div>
              ))}
              {projects.length === 0 && <div style={{ color: C.textSecondary, fontSize: '13px' }}>{txt.noProjects}</div>}
            </div>
          </div>
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
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #065F7C, #0891B2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontWeight: 700, fontSize: '22px' }}>{initials}</div>
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
