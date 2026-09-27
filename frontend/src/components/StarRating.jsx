import { useState } from 'react';

const StarRating = ({ rating, onRatingChange, readOnly = false, size = 30 }) => {
    const [hover, setHover] = useState(0);

    const handleClick = (value) => {
        if (!readOnly && onRatingChange) {
            onRatingChange(value);
        }
    };

    return (
        <div style={{ display: 'flex', gap: '5px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    onClick={() => handleClick(star)}
                    onMouseEnter={() => !readOnly && setHover(star)}
                    onMouseLeave={() => !readOnly && setHover(0)}
                    style={{
                        fontSize: size,
                        cursor: readOnly ? 'default' : 'pointer',
                        color: star <= (hover || rating) ? '#38BDF8' : '#ddd',
                        transition: 'color 0.2s'
                    }}
                >
                    ★
                </span>
            ))}
        </div>
    );
};

export default StarRating;