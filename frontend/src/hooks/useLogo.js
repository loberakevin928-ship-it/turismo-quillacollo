import { useState, useEffect } from 'react';
import api from '../api/axios';

const useLogo = () => {
    const [logoSrc, setLogoSrc] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogo = async () => {
            try {
                const res = await api.get('/settings/logo');
if (res.data.logoUrl) {
                        const url = res.data.logoUrl.startsWith('http')
                            ? res.data.logoUrl
                            : `http://localhost:5000${res.data.logoUrl}`;
                        setLogoSrc(url);
                    } else {
                        setLogoSrc(null);
                    }
                } catch (error) {
                    console.error('Error cargando logo:', error);
                    setLogoSrc(null);
                } finally {
                setLoading(false);
            }
        };

        fetchLogo();
    }, []);

    return { logoSrc, loading };
};

export default useLogo;