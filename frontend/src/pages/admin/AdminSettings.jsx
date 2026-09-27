import { useState, useEffect } from 'react';
import api from '../../api/axios';
import LogoUpload from '../../components/LogoUpload';

const AdminSettings = () => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/admin/settings');
            setSettings(res.data);
        } catch (error) {
            console.error('Error cargando configuración:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            await api.put('/admin/settings', settings);
            setMessage('✅ Configuración guardada exitosamente');
        } catch (error) {
            setMessage('❌ Error al guardar la configuración');
            console.error(error);
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    if (loading) return <div>Cargando configuración...</div>;

    return (
        <div>
            <h1>Configuración del Sistema</h1>
            {message && <p style={{ padding: '10px', background: message.includes('✅') ? '#E0F4FF' : '#F0F0F0', borderRadius: '4px' }}>{message}</p>}

            <div style={{ marginBottom: '25px' }}>
                <h2 style={{ fontSize: '16px', marginBottom: '10px' }}>Logo del Municipio</h2>
                <LogoUpload />
            </div>

            <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
                <div style={{ marginBottom: '15px' }}>
                    <label>Nombre del sitio</label>
                    <input
                        type="text"
                        name="site_name"
                        value={settings.site_name || ''}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Descripción</label>
                    <textarea
                        name="site_description"
                        value={settings.site_description || ''}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Email de contacto</label>
                    <input
                        type="email"
                        name="contact_email"
                        value={settings.contact_email || ''}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Teléfono</label>
                    <input
                        type="text"
                        name="contact_phone"
                        value={settings.contact_phone || ''}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Dirección</label>
                    <input
                        type="text"
                        name="address"
                        value={settings.address || ''}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Facebook</label>
                    <input
                        type="url"
                        name="social_facebook"
                        value={settings.social_facebook || ''}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Instagram</label>
                    <input
                        type="url"
                        name="social_instagram"
                        value={settings.social_instagram || ''}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Twitter</label>
                    <input
                        type="url"
                        name="social_twitter"
                        value={settings.social_twitter || ''}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                </div>
                <button
                    type="submit"
                    disabled={saving}
                    style={{ padding: '12px 30px', background: '#0B0B0B', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    {saving ? 'Guardando...' : 'Guardar Configuración'}
                </button>
            </form>
        </div>
    );
};

export default AdminSettings;