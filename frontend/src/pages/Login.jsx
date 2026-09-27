import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-900 p-4">
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/20">
                {/* Lado izquierdo - Formulario */}
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <div className="text-center lg:text-left">
                        <h1 className="text-3xl font-bold text-white">Sistema Turístico</h1>
                        <p className="text-sky-200 mt-1">Gobierno Autónomo Municipal de Quillacollo</p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                        {error && (
                            <div className="bg-neutral-700/20 border border-neutral-600 text-sky-100 px-4 py-2 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-sky-100">Correo electrónico</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full mt-1 px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
                                placeholder="admin@quillacollo.gob"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-sky-100">Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full mt-1 px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-neutral-900 font-bold rounded-lg transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                        >
                            {loading ? 'Ingresando...' : 'Ingresar'}
                        </button>
                    </form>
                </div>

                {/* Lado derecho - Imagen */}
                <div className="hidden lg:flex items-center justify-center p-8 relative">
                    <div className="text-center text-white">
                        <img src="/logo-quillacollo.svg" alt="Logo Quillacollo" className="w-20 h-20 mb-4 mx-auto" />
                        <h2 className="text-2xl font-bold">Descubre Quillacollo</h2>
                        <p className="text-sky-200 mt-2">Tierra de fe, cultura y tradición</p>
                        <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                                <span className="block font-semibold">+50</span>
                                <span className="text-sky-200">Atractivos</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                                <span className="block font-semibold">+20</span>
                                <span className="text-sky-200">Eventos anuales</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;