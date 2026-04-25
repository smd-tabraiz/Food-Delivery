import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ to, label = "Back" }) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (to) {
            navigate(to);
        } else {
            navigate(-1); // browser history back
        }
    };

    return (
        <button
            className="back-btn"
            onClick={handleBack}
            aria-label="Go back"
        >
            <i className="fa fa-arrow-left"></i>
            <span>{label}</span>
        </button>
    );
};

export default BackButton;
