import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        full_name: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    console.log('🔍 Register component renderizado');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        console.log('📝 Campo cambiado:', e.target.name, e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('🚀 handleSubmit ejecutado');
        console.log('📤 Datos del formulario:', form);
        setError('');
        setLoading(true);
        try {
            console.log('⏳ Llamando a register...');
            const result = await register(form.username, form.email, form.password, form.full_name);
            console.log('✅ Respuesta del servidor:', result);
            navigate('/login');
        } catch (err) {
            console.error('❌ Error capturado:', err);
            console.error('❌ Detalles del error:', err.response?.data);
            setError(err.response?.data?.error || 'Error al registrarse');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h2>Registro</h2>
            {error && <p style={{ color: '#38BDF8' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label>Nombre de usuario</label>
                    <input
                        type="text"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                        required
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                        required
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Contraseña</label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                        required
                        minLength="6"
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Nombre completo (opcional)</label>
                    <input
                        type="text"
                        name="full_name"
                        value={form.full_name}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#38BDF8', color: '#fff', border: 'none', borderRadius: '4px' }}
                >
                    {loading ? 'Cargando...' : 'Registrarse'}
                </button>
            </form>
            <p style={{ marginTop: '15px' }}>
                ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
            </p>
        </div>
    );
};

export default Register;