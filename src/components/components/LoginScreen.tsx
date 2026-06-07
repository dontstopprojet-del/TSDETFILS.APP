import { useState } from 'react';
import { supabase } from '../lib/supabase';

export interface LoginScreenProps {
  darkMode: boolean;
  lang: string;
  onLogin?: (user: any) => void;
  colors?: any;
  translations?: any;
  onLoginSuccess?: (user: any, role: string) => void;
  onLanguageChange?: () => void;
  onDarkModeToggle?: () => void;
  onBackToHome?: () => void;
  isPasswordRecovery?: boolean;
}

interface SignupData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone: string;
  role: string;
  dateOfBirth: string;
  maritalStatus: string;
  cityOfResidence?: string;
  contractSignatureDate?: string;
  echelon?: string;
  officePosition?: string;
  creationDate?: string;
  mad?: string;
  creationLocation?: string;
  district?: string;
  postalCode?: string;
  associateNumber?: string;
}

const translations = {
  en: {
    title: 'TSDFILS SARLU',
    login: 'Login',
    signup: 'Sign Up',
    toggleSignup: 'Need an account?',
    toggleLogin: 'Already have an account?',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    name: 'Full Name',
    phone: 'Phone (e.g., +212...)',
    role: 'Role',
    dateOfBirth: 'Date of Birth',
    maritalStatus: 'Marital Status',
    cityOfResidence: 'City of Residence',
    contractSignatureDate: 'Contract Signature Date',
    echelon: 'Echelon',
    officePosition: 'Office Position',
    creationDate: 'Creation Date',
    mad: 'MAD',
    creationLocation: 'Creation Location',
    district: 'District',
    postalCode: 'Postal Code',
    submit: 'Submit',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success! Check your email to verify your account.',
    invalidEmail: 'Invalid email format',
    passwordMismatch: 'Passwords do not match',
    phoneFormat: 'Phone must start with +',
    adminEmail: 'Admin email must be @tsdetfils.com',
  },
  fr: {
    title: 'TSDFILS SARLU',
    login: 'Connexion',
    signup: 'Inscription',
    toggleSignup: 'Besoin d\'un compte?',
    toggleLogin: 'Vous avez déjà un compte?',
    email: 'Email',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    name: 'Nom complet',
    phone: 'Téléphone (ex: +212...)',
    role: 'Rôle',
    dateOfBirth: 'Date de naissance',
    maritalStatus: 'État civil',
    cityOfResidence: 'Ville de résidence',
    contractSignatureDate: 'Date de signature du contrat',
    echelon: 'Échelon',
    officePosition: 'Poste au bureau',
    creationDate: 'Date de création',
    mad: 'MAD',
    creationLocation: 'Lieu de création',
    district: 'District',
    postalCode: 'Code postal',
    submit: 'Soumettre',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès! Vérifiez votre email pour confirmer votre compte.',
    invalidEmail: 'Format email invalide',
    passwordMismatch: 'Les mots de passe ne correspondent pas',
    phoneFormat: 'Le téléphone doit commencer par +',
    adminEmail: 'L\'email admin doit être @tsdetfils.com',
  },
};

const roleOptions = [
  { value: 'client', label: 'Client' },
  { value: 'tech', label: 'Technicien' },
  { value: 'office', label: 'Bureau' },
  { value: 'admin', label: 'Administrateur' },
  { value: 'shareholder', label: 'Actionnaire' },
  { value: 'partner', label: 'Partenaire' },
  { value: 'associate', label: 'Associe' },
];

const maritalStatusOptions = [
  'Celibataire',
  'Marié(e)',
  'Divorcé(e)',
  'Veuf(ve)',
];

const echelonOptions = ['Apprenti', 'Manoeuvre', 'Ouvrier', 'Chef d\'equipe', 'Conducteur de travaux'];
const officePositionOptions = ['Directeur', 'Responsable administratif & financier', 'Responsable RH', 'Secretaire / Assistante administrative', 'Comptable'];

export default function LoginScreen({ darkMode, lang, onLogin, onLoginSuccess }: LoginScreenProps) {
  const t = translations[lang as keyof typeof translations] || translations.en;
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState<SignupData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    role: 'client',
    dateOfBirth: '',
    maritalStatus: 'Celibataire',
  });

  const generateContractNumber = (role: string, dob: string): string | null => {
    const today = new Date();
    const birthDate = new Date(dob);
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const birthDay = String(birthDate.getDate()).padStart(2, '0');
    const birthMonth = String(birthDate.getMonth() + 1).padStart(2, '0');
    const birthYear = birthDate.getFullYear();

    if (role === 'shareholder') return `ATSD-${day}-${birthMonth}-${year}-AMR6`;
    if (role === 'partner') return `PTSD-${birthDay}-${month}-${birthYear}-PMER6`;
    if (role === 'office') return `MBTSD-${month}-${year}-${birthDay}-${birthMonth}-MBTHNK`;
    return null;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });

      if (authError) throw authError;
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!signupForm.email.includes('@')) {
      setError(t.invalidEmail);
      return;
    }
    if (signupForm.password !== signupForm.confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }
    if (!signupForm.phone.startsWith('+')) {
      setError(t.phoneFormat);
      return;
    }
    if (signupForm.role === 'admin' && !signupForm.email.endsWith('@tsdetfils.com')) {
      setError(t.adminEmail);
      return;
    }
    if (signupForm.role === 'associate') {
      if (!signupForm.associateNumber) {
        setError(lang === 'fr' ? 'Le numero d\'associe est obligatoire' : 'Associate number is required');
        return;
      }
      if (!/^\d{2}\.\d{4}\.\d{2}\.\d{5}$/.test(signupForm.associateNumber)) {
        setError(lang === 'fr' ? 'Le numero d\'associe doit respecter le format JJ.AAAA.MM.XXXXX, exemple : 12.1997.06.12347' : 'Associate number must follow the format DD.YYYY.MM.XXXXX, example: 12.1997.06.12347');
        return;
      }
    }

    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: signupForm.email,
        password: signupForm.password,
      });

      if (authError) throw authError;

      const contractNumber = generateContractNumber(signupForm.role, signupForm.dateOfBirth);

      const { error: upsertError } = await supabase.from('app_users').upsert({
        id: data.user?.id,
        email: signupForm.email,
        name: signupForm.name,
        phone: signupForm.phone,
        role: signupForm.role,
        date_of_birth: signupForm.dateOfBirth || null,
        marital_status: signupForm.maritalStatus,
        contract_number: contractNumber,
        city: signupForm.cityOfResidence || null,
        contract_signature_date: signupForm.contractSignatureDate || null,
        echelon: signupForm.echelon || null,
        office_position: signupForm.officePosition || null,
        created_date: signupForm.creationDate || null,
        mad: signupForm.mad || null,
        creation_location: signupForm.creationLocation || null,
        district: signupForm.district || null,
        postal_code: signupForm.postalCode || null,
        associate_number: signupForm.associateNumber || null,
      });

      if (upsertError) throw upsertError;
      setMessage(t.success);
      setSignupForm({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        phone: '',
        role: 'client',
        dateOfBirth: '',
        maritalStatus: 'Celibataire',
      });
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f172a, #1e293b)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: '40px',
        maxWidth: '450px',
        width: '100%',
        color: '#fff',
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '24px', color: '#0EA5E9' }}>
          {t.title}
        </h1>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          <button
            onClick={() => setIsLogin(true)}
            style={{
              flex: 1,
              padding: '10px',
              background: isLogin ? '#0EA5E9' : 'transparent',
              color: isLogin ? '#0f172a' : '#fff',
              border: '1px solid #0EA5E9',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s',
            }}
          >
            {t.login}
          </button>
          <button
            onClick={() => setIsLogin(false)}
            style={{
              flex: 1,
              padding: '10px',
              background: !isLogin ? '#0EA5E9' : 'transparent',
              color: !isLogin ? '#0f172a' : '#fff',
              border: '1px solid #0EA5E9',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s',
            }}
          >
            {t.signup}
          </button>
        </div>

        {error && <div style={{ color: '#ff4444', marginBottom: '15px', fontSize: '14px' }}>{error}</div>}
        {message && <div style={{ color: '#4ade80', marginBottom: '15px', fontSize: '14px' }}>{message}</div>}

        {isLogin ? (
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder={t.email}
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '15px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid #0EA5E9',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '14px',
              }}
            />
            <input
              type="password"
              placeholder={t.password}
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '20px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid #0EA5E9',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '14px',
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: '#0EA5E9',
                color: '#0f172a',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? t.loading : t.login}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <input
              type="email"
              placeholder={t.email}
              value={signupForm.email}
              onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid #0EA5E9',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '13px',
              }}
            />
            <input
              type="text"
              placeholder={t.name}
              value={signupForm.name}
              onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid #0EA5E9',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '13px',
              }}
            />
            <input
              type="tel"
              placeholder={t.phone}
              value={signupForm.phone}
              onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid #0EA5E9',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '13px',
              }}
            />
            <input
              type="date"
              value={signupForm.dateOfBirth}
              onChange={(e) => setSignupForm({ ...signupForm, dateOfBirth: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid #0EA5E9',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '13px',
              }}
            />
            <select
              value={signupForm.maritalStatus}
              onChange={(e) => setSignupForm({ ...signupForm, maritalStatus: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid #0EA5E9',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '13px',
              }}
            >
              {maritalStatusOptions.map((s) => (
                <option key={s} value={s} style={{ background: '#0f172a' }}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={signupForm.role}
              onChange={(e) => setSignupForm({ ...signupForm, role: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid #0EA5E9',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '13px',
              }}
            >
              {roleOptions.map((r) => (
                <option key={r.value} value={r.value} style={{ background: '#0f172a' }}>
                  {r.label}
                </option>
              ))}
            </select>

            {signupForm.role === 'client' && (
              <input
                type="text"
                placeholder={t.cityOfResidence}
                value={signupForm.cityOfResidence || ''}
                onChange={(e) => setSignupForm({ ...signupForm, cityOfResidence: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginBottom: '10px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid #0EA5E9',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '13px',
                }}
              />
            )}

            {(signupForm.role === 'tech' || signupForm.role === 'office' || signupForm.role === 'shareholder' || signupForm.role === 'partner' || signupForm.role === 'associate') && (
              <input
                type="date"
                value={signupForm.contractSignatureDate || ''}
                onChange={(e) => setSignupForm({ ...signupForm, contractSignatureDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginBottom: '10px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid #0EA5E9',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '13px',
                }}
              />
            )}

            {signupForm.role === 'tech' && (
              <select
                value={signupForm.echelon || ''}
                onChange={(e) => setSignupForm({ ...signupForm, echelon: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginBottom: '10px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid #0EA5E9',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '13px',
                }}
              >
                <option value="" style={{ background: '#0f172a' }}>
                  {t.echelon}
                </option>
                {echelonOptions.map((e) => (
                  <option key={e} value={e} style={{ background: '#0f172a' }}>
                    {e}
                  </option>
                ))}
              </select>
            )}

            {signupForm.role === 'office' && (
              <select
                value={signupForm.officePosition || ''}
                onChange={(e) => setSignupForm({ ...signupForm, officePosition: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginBottom: '10px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid #0EA5E9',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '13px',
                }}
              >
                <option value="" style={{ background: '#0f172a' }}>
                  {t.officePosition}
                </option>
                {officePositionOptions.map((p) => (
                  <option key={p} value={p} style={{ background: '#0f172a' }}>
                    {p}
                  </option>
                ))}
              </select>
            )}

            {signupForm.role === 'associate' && (
              <input
                type="text"
                placeholder={lang === 'fr' ? 'Numero d\'associe (ex: 12.1997.06.12347)' : 'Associate number (e.g. 12.1997.06.12347)'}
                value={signupForm.associateNumber || ''}
                onChange={(e) => setSignupForm({ ...signupForm, associateNumber: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginBottom: '10px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid #0EA5E9',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '13px',
                }}
              />
            )}

            {signupForm.role === 'admin' && (
              <>
                <input
                  type="date"
                  value={signupForm.creationDate || ''}
                  onChange={(e) => setSignupForm({ ...signupForm, creationDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginBottom: '10px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid #0EA5E9',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '13px',
                  }}
                />
                <input
                  type="text"
                  placeholder={t.mad}
                  value={signupForm.mad || ''}
                  onChange={(e) => setSignupForm({ ...signupForm, mad: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginBottom: '10px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid #0EA5E9',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '13px',
                  }}
                />
                <input
                  type="text"
                  placeholder={t.creationLocation}
                  value={signupForm.creationLocation || ''}
                  onChange={(e) => setSignupForm({ ...signupForm, creationLocation: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginBottom: '10px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid #0EA5E9',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '13px',
                  }}
                />
                <input
                  type="text"
                  placeholder={t.district}
                  value={signupForm.district || ''}
                  onChange={(e) => setSignupForm({ ...signupForm, district: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginBottom: '10px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid #0EA5E9',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '13px',
                  }}
                />
                <input
                  type="text"
                  placeholder={t.postalCode}
                  value={signupForm.postalCode || ''}
                  onChange={(e) => setSignupForm({ ...signupForm, postalCode: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginBottom: '10px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid #0EA5E9',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '13px',
                  }}
                />
              </>
            )}

            <input
              type="password"
              placeholder={t.password}
              value={signupForm.password}
              onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid #0EA5E9',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '13px',
              }}
            />
            <input
              type="password"
              placeholder={t.confirmPassword}
              value={signupForm.confirmPassword}
              onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '15px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid #0EA5E9',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '13px',
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: '#0EA5E9',
                color: '#0f172a',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? t.loading : t.submit}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
