import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <div style={{ padding: '20px' }}>
            <h1>Panel de Administración</h1>
            <p>Bienvenido, {user?.full_name || user?.username}</p>
            <p>Rol: {user?.role}</p>
            <a href="/">Volver al mapa</a>
        </div>
    );
};

export default Dashboard;