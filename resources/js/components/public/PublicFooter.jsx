import React from 'react';

export default function PublicFooter() {
    return (
        <div className="footer">
            <div className="container">
                <div className="more">
                    <a href="#">About us</a>
                    <a href="#">Ask question</a>
                    <a href="#">Contact us</a>
                </div>

                <div className="location">
                    <span>Location</span>
                </div>

                <div className="social-page">
                    <div className="social-media">
                        <a href="#"><i className="bx bxl-whatsapp"></i></a>
                        <a href="#"><i className="bx bxl-facebook-circle"></i></a>
                        <a href="#"><i className="bx bxl-twitter"></i></a>
                        <a href="#"><i className="bx bxl-instagram-alt"></i></a>
                    </div>
                    <div className="project">
                        <a href="https://github.com/HazmiHazim" target="_blank" rel="noreferrer"><i className="bx bxl-github"></i></a>
                        <a href="https://www.linkedin.com/in/hazmihazim/" target="_blank" rel="noreferrer">
                            <i className="bx bxl-linkedin-square"></i>
                        </a>
                    </div>
                </div>
            </div>

            <div className="copyright">
                <span>&copy; baker 2025 baker sado - ALL RIGHTS RESERVED</span>
            </div>
        </div>
    );
}
