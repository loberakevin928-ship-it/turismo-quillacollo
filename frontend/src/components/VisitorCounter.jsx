import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import api from '../api/axios';

const VisitorCounter = () => {
    const [totalVisitors, setTotalVisitors] = useState(null);
    const [todayVisitors, setTodayVisitors] = useState(null);

    useEffect(() => {
        let active = true;
        const fetchSummary = async () => {
            try {
                const res = await api.get('/visits/summary');
                if (active) {
                    setTotalVisitors(res.data.totalVisitors || 0);
                    setTodayVisitors(res.data.todayVisitors || 0);
                }
            } catch (error) {
                if (active) {
                    setTotalVisitors(0);
                    setTodayVisitors(0);
                }
            }
        };
        fetchSummary();
        const interval = setInterval(fetchSummary, 30000);
        return () => {
            active = false;
            clearInterval(interval);
        };
    }, []);

    if (totalVisitors === null) return null;

    return (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-sky-400/30 bg-sky-400/10">
            <Eye size={15} className="text-sky-400" />
            <span className="text-gray-300 text-sm">
                <strong className="text-sky-300">{totalVisitors.toLocaleString('es-BO')}</strong>{' '}
                visitantes
                {todayVisitors !== null && (
                    <span className="text-gray-500 text-xs ml-1">
                        · {todayVisitors} hoy
                    </span>
                )}
            </span>
        </div>
    );
};

export default VisitorCounter;