import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface CreateAccountFormProps {
  onClose: () => void;
  onSuccess: () => void;
  darkMode: boolean;
  colors: any;
  lang: string;
}

const CreateAccountForm = ({
  onClose,
  onSuccess,
  darkMode,
  _colors,
  lang,
}: CreateAccountFormProps) => {
  const t = {
    required:
      lang === 'fr'
        ? 'Veuillez remplir tous les champs obligatoires'
        : 'Please fill all required fields',
    error: lang === 'fr' ? 'Erreur' : 'Error',
  };

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'client',
    contract_number: '',
    echelon: '',
    status: '',
    office_position: '',
    date_of_birth: '',
    contract_signature_date: '',
    marital_status: '',
    city: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const needsContractDate = formData.role !== 'admin';

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.date_of_birth ||
      !formData.marital_status ||
      (needsContractDate && !formData.contract_signature_date)
    ) {
      setMessage(t.required);
      return;
    }

    if (formData.role === 'client' && !formData.city.trim()) {
      setMessage(
        lang === 'fr'
          ? 'La ville de résidence est obligatoire pour les clients'
          : 'City of residence is required for clients'
      );
      return;
    }

    if (formData.role === 'tech' && !formData.echelon) {
      setMessage(
        lang === 'fr'
          ? "L'échelon est obligatoire pour les techniciens"
          : 'Rank is required for technicians'
      );
      return;
    }

    if (formData.role === 'office' && !formData.office_position) {
      setMessage(
        lang === 'fr'
          ? 'Le poste est obligatoire pour les employés de bureau'
          : 'Position is required for office employees'
      );
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { data: authData, error: authError } =
        await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}`,
            data: {
              name: formData.name,
              role: formData.role,
            },
          },
        });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('app_users')
          .upsert(
            {
              id: authData.user.id,
              email: formData.email,
              name: formData.name,
              phone: formData.phone,
              role: formData.role,
              contract_number: formData.contract_number || null,
              echelon: formData.echelon || null,
              status: formData.status || null,
              office_position: formData.office_position || null,
              date_of_birth: formData.date_of_birth,
              contract_signature_date:
                formData.contract_signature_date,
              marital_status: formData.marital_status,
              city: formData.city || null,
              contract_date:
                formData.contract_signature_date ||
                new Date().toISOString().split('T')[0],
            },
            { onConflict: 'id' }
          );

        if (profileError) {
          console.error(
            '[CreateAccount] app_users upsert failed:',
            profileError
          );

          if (
            profileError?.message?.includes(
              'app_users_email_key'
            ) ||
            profileError?.message?.includes('duplicate key')
          ) {
            setMessage(
              'Un compte existe déjà avec cette adresse email.'
            );
            return;
          }

          throw profileError;
        }

        await fetch(
          'https://wwzenpgopftcqhhczmni.supabase.co/functions/v1/send-welcome-email',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: formData.email,
              name: formData.name,
            }),
          }
        );

        const emailMsg =
          lang === 'fr'
            ? 'Compte créé ! Un email de vérification a été envoyé.'
            : 'Account created! A verification email has been sent.';

        setMessage(emailMsg);

        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2500);
      }
    } catch (error: any) {
      if (
        error?.message?.includes('duplicate key') ||
        error?.message?.includes('app_users_email_key')
      ) {
        setMessage(
          'Un compte existe déjà avec cette adresse email.'
        );
        return;
      }

      setMessage(`${t.error}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: darkMode ? '#111827' : '#ffffff',
        borderRadius: '20px',
        padding: '25px',
        width: '100%',
        maxWidth: '500px',
        margin: '0 auto',
      }}
    >
      <h2
        style={{
          color: darkMode ? '#ffffff' : '#111827',
          marginBottom: '20px',
          textAlign: 'center',
        }}
      >
        {lang === 'fr' ? 'Créer un compte' : 'Create account'}
      </h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder={lang === 'fr' ? 'Nom complet' : 'Full name'}
          value={formData.name}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <input
          type="password"
          name="password"
          placeholder={lang === 'fr' ? 'Mot de passe' : 'Password'}
          value={formData.password}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <input
          type="text"
          name="phone"
          placeholder={lang === 'fr' ? 'Téléphone' : 'Phone'}
          value={formData.phone}
          onChange={handleChange}
          style={inputStyle}
        />

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          style={inputStyle}
        >
          <option value="client">Client</option>
          <option value="tech">Technicien</option>
          <option value="office">Bureau</option>
          <option value="admin">Admin</option>
        </select>

        <input
          type="date"
          name="date_of_birth"
          value={formData.date_of_birth}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <input
          type="date"
          name="contract_signature_date"
          value={formData.contract_signature_date}
          onChange={handleChange}
          style={inputStyle}
        />

        <select
          name="marital_status"
          value={formData.marital_status}
          onChange={handleChange}
          required
          style={inputStyle}
        >
          <option value="">
            {lang === 'fr'
              ? 'État civil'
              : 'Marital status'}
          </option>
          <option value="single">
            {lang === 'fr' ? 'Célibataire' : 'Single'}
          </option>
          <option value="married">
            {lang === 'fr' ? 'Marié(e)' : 'Married'}
          </option>
        </select>

        <input
          type="text"
          name="city"
          placeholder={
            lang === 'fr'
              ? 'Ville de résidence'
              : 'City'
          }
          value={formData.city}
          onChange={handleChange}
          style={inputStyle}
        />

        <input
          type="text"
          name="contract_number"
          placeholder={
            lang === 'fr'
              ? 'Numéro de contrat'
              : 'Contract number'
          }
          value={formData.contract_number}
          onChange={handleChange}
          style={inputStyle}
        />

        {formData.role === 'tech' && (
          <input
            type="text"
            name="echelon"
            placeholder="Échelon"
            value={formData.echelon}
            onChange={handleChange}
            style={inputStyle}
          />
        )}

        {formData.role === 'office' && (
          <input
            type="text"
            name="office_position"
            placeholder={
              lang === 'fr'
                ? 'Poste de bureau'
                : 'Office position'
            }
            value={formData.office_position}
            onChange={handleChange}
            style={inputStyle}
          />
        )}

        {message && (
          <div
            style={{
              marginTop: '15px',
              padding: '12px',
              borderRadius: '10px',
              background: message.includes('créé')
                ? '#DCFCE7'
                : '#FEE2E2',
              color: message.includes('créé')
                ? '#166534'
                : '#DC2626',
              textAlign: 'center',
              fontWeight: 500,
            }}
          >
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            marginTop: '20px',
            padding: '14px',
            border: 'none',
            borderRadius: '12px',
            background:
              'linear-gradient(to right, #06b6d4, #2563eb)',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          {loading
            ? lang === 'fr'
              ? 'Chargement...'
              : 'Loading...'
            : lang === 'fr'
            ? "S'inscrire"
            : 'Sign up'}
        </button>
      </form>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '14px',
  marginTop: '12px',
  borderRadius: '12px',
  border: '1px solid #d1d5db',
  fontSize: '15px',
};

export default CreateAccountForm;