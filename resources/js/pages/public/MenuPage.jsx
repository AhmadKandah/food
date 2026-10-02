import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import SuccessModal from '../../components/public/SuccessModal';
import { useCart } from '../../hooks/useCart';
import { menuService } from '../../services/public';
import { assetUrl } from '../../utils/assets';
import { formatCurrency } from '../../utils/currency';

const emptyMenuMessage = (
    <div className="container-empty">
        <i className="bx bxs-error-alt"></i>
        <div className="text">
            <span className="top">No items match your filters.</span>
            <span className="bottom">Try adjusting your search criteria or <a href="/menu">clear all filters</a>.</span>
        </div>
    </div>
);

export default function MenuPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [status, setStatus] = useState('loading');
    const [errorMessage, setErrorMessage] = useState('');
    const { addItem } = useCart();

    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const [searchInput, setSearchInput] = useState(search);

    useEffect(() => {
        setSearchInput(search);
    }, [search]);

    useEffect(() => {
        let active = true;

        setStatus('loading');
        setErrorMessage('');

        menuService.list({ search, category })
            .then((response) => {
                if (!active) return;

                if (!Array.isArray(response?.data) || !Array.isArray(response?.categories)) {
                    throw new Error('Menu API response is unavailable.');
                }

                setItems(response.data || []);
                setCategories(response.categories || []);
                setStatus('ready');
            })
            .catch((error) => {
                if (!active) return;
                setItems([]);
                setCategories([]);
                setErrorMessage(error.userMessage || 'Unable to load the menu. Please try again.');
                setStatus('error');
            });

        return () => {
            active = false;
        };
    }, [category, search]);

    const submitSearch = (event) => {
        event.preventDefault();
        const nextParams = new URLSearchParams(searchParams);

        if (searchInput.trim()) {
            nextParams.set('search', searchInput.trim());
        } else {
            nextParams.delete('search');
        }

        setSearchParams(nextParams);
    };

    const categoryUrl = (categoryId) => {
        const nextParams = new URLSearchParams();
        if (search) nextParams.set('search', search);
        if (categoryId) nextParams.set('category', categoryId);
        const query = nextParams.toString();
        return query ? `/menu?${query}` : '/menu';
    };

    return (
        <div className="menu-page">
            <div className="menu-hero-section">
                <div className="dish-of-day-badge">
                    <span>Dish of the Day</span>
                </div>
                <div className="hero-content">
                    <div className="hero-text">
                        <h1 className="hero-title">
                            <span className="title-line">Perfect Ambience &</span>
                            <span className="title-line">Best Quality Food</span>
                        </h1>
                        <p className="hero-description">
                            Satisfy your cravings by getting the best quality food from us and enjoy with your beloved ones. Customers satisfaction is our first priority. Come and have a best experience in our place.
                        </p>
                        <button
                            type="button"
                            className="hero-button add-to-cart-hero"
                            data-food-id="1"
                            data-food-image="/images/food-menu/1.png"
                            data-food-name="Special Dish of the Day"
                            data-food-price="25.99"
                            onClick={() => addItem({ id: 1, image: '/images/food-menu/1.png', name: 'Special Dish of the Day', price: 25.99 })}
                        >
                            <i className="bx bx-cart-add"></i>
                            <span>Add to Cart</span>
                        </button>
                    </div>
                    <div className="hero-image">
                        <img src="/images/food-menu/1.png" alt="Dish of the Day" className="hero-food-image" />
                    </div>
                </div>
            </div>

            <section>
                <main>
                    <div className="page" id="menu-content">
                        <div className="filter-section">
                            <div className="filter-header">
                                <h2><i className="bx bx-filter-alt"></i> Filter Menu</h2>
                            </div>

                            <form action="/menu" method="GET" className="search-form" onSubmit={submitSearch}>
                                <div className="search-filter">
                                    <input
                                        type="text"
                                        name="search"
                                        placeholder="Search for food..."
                                        value={searchInput}
                                        onChange={(event) => setSearchInput(event.target.value)}
                                    />
                                    <button type="submit" className="search-btn">
                                        <i className="bx bx-search"></i>
                                    </button>
                                </div>
                            </form>

                            <div className="category-filter-buttons">
                                <div className="category-buttons">
                                    <Link to={categoryUrl('')} className={`category-btn${category === '' ? ' active' : ''}`}>
                                        All Categories
                                    </Link>
                                    {categories.map((item) => (
                                        <Link
                                            to={categoryUrl(item.id)}
                                            className={`category-btn${String(item.id) === String(category) ? ' active' : ''}`}
                                            key={item.id}
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {status === 'loading' && (
                                <div className="container-empty"><div className="text"><span className="top">Loading menu...</span></div></div>
                            )}
                            {status === 'error' && (
                                <div className="container-empty"><div className="text"><span className="top">{errorMessage}</span></div></div>
                            )}
                            {status === 'ready' && items.length === 0 && emptyMenuMessage}
                            {status === 'ready' && items.length > 0 && (
                                <>
                                    <div className="category-banner"><h1>Menu</h1></div>
                                    <div className="food-item">
                                        {items.map((item) => (
                                            <div className="item" key={item.id}>
                                                <div className="image">
                                                    <img src={assetUrl(item.image)} alt="food-image" />
                                                    <div className="overlay">
                                                        <button
                                                            type="button"
                                                            className="add-to-cart"
                                                            data-food-id={item.id}
                                                            data-food-image={assetUrl(item.image)}
                                                            data-food-name={item.name}
                                                            data-food-price={item.price}
                                                            onClick={() => addItem({ ...item, image: assetUrl(item.image) })}
                                                        >
                                                            <i className="bx bx-plus"></i>
                                                            <span>Add to Cart</span>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="name-price">
                                                    <span className="food-name">{item.name}</span>
                                                    <span className="price">{formatCurrency(item.price)}</span>
                                                    {item.category && <span className="category-tag">{item.category.name}</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </main>
                <SuccessModal />
            </section>
        </div>
    );
}
