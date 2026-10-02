import React, { useEffect, useState } from 'react';

import { promotionService } from '../../services/public';
import { assetUrl } from '../../utils/assets';
import { formatCurrency } from '../../utils/currency';

export default function PromotionPage() {
    const [events, setEvents] = useState([]);
    const [status, setStatus] = useState('loading');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let active = true;

        promotionService.list()
            .then((response) => {
                if (!active) return;

                if (!Array.isArray(response?.data)) {
                    throw new Error('Promotion API response is unavailable.');
                }

                setEvents(response.data || []);
                setStatus('ready');
            })
            .catch((error) => {
                if (!active) return;
                setErrorMessage(error.userMessage || 'Unable to load promotions. Please try again.');
                setStatus('error');
            });

        return () => {
            active = false;
        };
    }, []);

    return (
        <div className="promotion-page">
            <section>
                <main>
                    <div className="page">
                        {status === 'loading' && (
                            <div className="container-empty"><div className="text"><span className="top">Loading promotions...</span></div></div>
                        )}
                        {status === 'error' && (
                            <div className="container-empty"><div className="text"><span className="top">{errorMessage}</span></div></div>
                        )}
                        {status === 'ready' && events.length === 0 && (
                            <div className="container-empty">
                                <i className="bx bxs-offer"></i>
                                <div className="text">
                                    <span className="top">Sorry, there is currently no offers available.</span>
                                    <span className="bottom">Please check back soon for new offers!</span>
                                </div>
                            </div>
                        )}
                        {status === 'ready' && events.length > 0 && (
                            <div className="event">
                                {events.map((event) => (
                                    <div className="container-event" key={event.id}>
                                        <img src={assetUrl(event.event_image)} alt="Promotion Image" className="promotion-image" />
                                        <div className="promotion-item">
                                            <span>Offers &amp; Discounts</span>
                                            <div className="item">
                                                {(event.offers || []).map((offer) => (
                                                    <div className="container" key={`${event.id}-${offer.id}`}>
                                                        <div className="image">
                                                            <img src={assetUrl(offer.image)} alt="Food Offer" />
                                                        </div>
                                                        <div className="description">
                                                            <span className="food-name">{offer.name}</span>
                                                            <div className="offer-price">
                                                                {(event.coupons || []).map((coupon, couponIndex) => (
                                                                    <React.Fragment key={`${offer.id}-${couponIndex}`}>
                                                                        <span>{formatCurrency(Number(offer.price) - (Number(offer.price) * Number(coupon.discount)))}</span>
                                                                        <span className="cut"><s>{formatCurrency(offer.price)}</s></span>
                                                                    </React.Fragment>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </section>
        </div>
    );
}
