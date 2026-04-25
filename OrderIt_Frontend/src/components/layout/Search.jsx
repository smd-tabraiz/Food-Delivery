import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Search = () => {
    const [keyword, setKeyword] = useState('');
    const navigate = useNavigate();

    const searchHandler = (e) => {
        e.preventDefault();

        if (keyword.trim()) {
            navigate(`/eats/stores/search/${keyword}`);
        } else {
            navigate('/');
        }
    };

    return (
        <form onSubmit={searchHandler} className="search-form w-100">
            <div className="input-group">
                <input
                    type="text"
                    id="search_field"
                    className="form-control"
                    placeholder="Search your favorite Food..."
                    onChange={(e) => setKeyword(e.target.value)}
                    value={keyword}
                />
                <div className="input-group-append">
                    <button id="search_btn" className="btn" type="submit">
                        <i className="fa fa-search" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
        </form>
    );
};

export default Search;
