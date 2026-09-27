import { Component } from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends Component {
    state = { hasError: false, message: '' };

    static getDerivedStateFromError(error) {
        return { hasError: true, message: error?.message || 'Error desconocido' };
    }

    componentDidCatch(error, info) {
        console.error('Error capturado:', error, info);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ maxWidth: '500px', margin: '60px auto', textAlign: 'center', fontFamily: 'Poppins, sans-serif' }}>
                    <div
                        style={{
                            width: '70px', height: '70px', margin: '0 auto 20px', borderRadius: '18px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '36px', background: '#0B0B0B', border: '3px solid #38BDF8'
                        }}
                    >
                        ⚠️
                    </div>
                    <h2 style={{ color: '#0B0B0B', marginBottom: '8px' }}>Algo salió mal</h2>
                    <p style={{ color: '#555', marginBottom: '12px' }}>
                        Ocurrió un error al mostrar esta página.
                    </p>
                    <p style={{ color: '#38BDF8', fontSize: '13px', background: '#F0F9FF', padding: '8px', borderRadius: '6px' }}>
                        {this.state.message}
                    </p>
                    <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button
                            onClick={this.handleReload}
                            style={{ padding: '10px 18px', background: '#0B0B0B', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                        >
                            Recargar página
                        </button>
                        <Link
                            to="/"
                            style={{ padding: '10px 18px', background: '#38BDF8', color: '#0B0B0B', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}
                        >
                            Ir al inicio
                        </Link>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;