import React from 'react';
import SuccessModal from '../../components/public/SuccessModal';

export default function HomePage() {
    return (
        <div className="home-page">
            <main>
                <div className="page">
                    <div className="content">
                        <div className="title">
                            <h1>Welcome to Glaw Restaurant</h1>
                        </div>

                        <div className="description">
                            <span>Experience the finest dining with our exceptional menu and warm hospitality.</span>
                        </div>

                        <a href="/menu">
                            <span>View Our Menu</span>
                        </a>
                    </div>
                </div>
            </main>

            {/* Kept to mirror the existing home Blade DOM while that file remains the migration reference. */}
            <SuccessModal />
        </div>
    );
}
