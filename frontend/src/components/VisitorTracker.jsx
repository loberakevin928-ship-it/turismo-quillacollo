import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';

const VisitorTracker = () => {
    const location = useLocation();

    useEffect(() => {
        let visitorId = localStorage.getItem('visitor_id');
        if (!visitorId) {
            visitorId =
                (window.crypto && window.crypto.randomUUID && window.crypto.randomUUID()) ||
                `v-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
            localStorage.setItem('visitor_id', visitorId);
        }
        api.post('/visits/track', { visitorId }).catch(() => {});
    }, [location.pathname]);

    return null;
};

export default VisitorTracker;