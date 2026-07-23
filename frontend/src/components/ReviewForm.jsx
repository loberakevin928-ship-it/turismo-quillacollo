import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import StarRating from './StarRating';

const ReviewForm = ({ placeId, onReviewSubmitted }) => {
    const { user } = useAuth();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!user) {
        return (
            <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
                <p>Debes <a href="/login">iniciar sesión</a> para dejar una reseña.</p>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Por favor, selecciona una calificación');
            return;
        }
        if (comment.length < 10) {
            setError('El comentario debe tener al menos 10 caracteres');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.post('/reviews', {
                placeId,
                rating,
                comment
            });
            setRating(0);
            setComment('');
            if (onReviewSubmitted) onReviewSubmitted();
            alert('¡Reseña publicada exitosamente!');
        } catch (err) {
            setError(err.response?.data?.error || 'Error al publicar reseña');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h4>Deja tu reseña</h4>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div style={{ marginBottom: '15px' }}>
                <label>Calificación:</label>
                <StarRating rating={rating} onRatingChange={setRating} />
            </div>
            <div style={{ marginBottom: '15px' }}>
                <label>Comentario:</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    style={{ width: '100%', padding: '10px', minHeight: '80px', borderRadius: '4px', border: '1px solid #ddd' }}
                    placeholder="Cuéntanos tu experiencia..."
                    required
                />
            </div>
            <button
                type="submit"
                disabled={loading}
                style={{ padding: '10px 20px', background: '#D4A017', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
                {loading ? 'Publicando...' : 'Publicar Reseña'}
            </button>
        </form>
    );
};

export default ReviewForm;