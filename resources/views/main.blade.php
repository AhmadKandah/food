<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
    <link rel="stylesheet" href="{{ asset('css/style.css') }}?v={{ rand(1000,9999) }}">
    <link rel="stylesheet" href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css">
    <title>@yield('title', 'Home')</title>
</head>

<body>

    <div class="topbar">

        <div class="container">

            <div class="logo">
                <img src="{{ asset('images/logo.png') }}" alt="Hash Logo" width="8" height="0">
                <span class="logo-text-main">Glaw</span>
                <span class="logo-text-sub">Restaurant</span>
            </div>

            <!-- Mobile Menu Button -->
            <div class="mobile-menu-btn" id="mobile-menu-btn">
                <i class='bx bx-menu'></i>
            </div>

            <div class="nav-page" id="nav-page">

                <div class="{{ request()->routeIs(['home']) ? 'active' : '' }}">
                    <a href="{{ route('home') }}"><span>Home</span></a>
                </div>

                <div class="{{ request()->routeIs(['menu', 'search']) ? 'active' : '' }}">
                    <a href="{{ route('menu') }}"><span>Menu</span></a>
                </div>

                <div class="{{ request()->routeIs(['promotion']) ? 'active' : '' }}">
                    <a href="{{ route('promotion') }}"><span>Promotions</span></a>
                </div>

                <div class="{{ request()->routeIs(['reservation']) ? 'active' : '' }}">
                    <a href="{{ route('reservation') }}"><span>Reservation</span></a>
                </div>

            </div>

            <div class="manage">
                <div class="search">
                    <i class='bx bx-search' id="open-search"></i>
                    <div class="search-container">
                        <form action="{{ route('search') }}" method="GET" id="search-form">
                            <i class='bx bx-search' id="search-button"></i>
                            <input type="text" name="search" placeholder="Search..." value="{{ old('search') }}">
                        </form>
                    </div>
                </div>

                <div class="cart">
                    <i class='bx bx-cart'></i>
                    <span class="cart-quantity" id="cart-quantity">0</span>
                </div>

                <div class="company">
                    <a href="{{ route('login') }}"><i class='bx bx-buildings'></i></a>
                </div>
            </div>

        </div>

    </div>

    <div class="cart-section">
        <div class="header">
            <span>Confirm Order</span>
            <div class="close-cart">
                <i class='bx bx-x'></i>
            </div>
        </div>

        <div class="main-section-order">
            <span>Your Order</span>
            <div class="cart-total">
                <span id="cart-item-count">Total 0 item</span>
                <span id="cart-total-amount">{{ \App\Helpers\CurrencyHelper::format(0) }}</span>
            </div>
        </div>

        <div class="your-order">
            <ul class="cart-list">
                <li>
                    <span class="empty">No item in cart</span>
                </li>
            </ul>
        </div>

        <div class="table-number">
            <div class="table-section">
                <span>Table No.</span>
                <input type="text" name="table_number" placeholder="0" required>
                <div class="message"></div>
                <div id="success-response" class="success-message"></div>
                <div id="error-response" class="validation-error-message"></div>
            </div>

            <div class="contact-section">
                <span>Your Order Number</span>
                <input type="number" name="customer_contact" placeholder="Enter your order number (e.g. 1, 2, 3...)" required min="1">
            </div>
        </div>

        <div class="cart-button" style="margin-top: 20px; text-align: center; margin-bottom: 30px;">
            <button type="button" class="confirm-order" disabled><span>Confirm Order</span></button>
        </div>

    </div>

    @yield('content')

    <!-- Success Modal -->
    <div class="modal-success-message">
        <div class="wrapper">
            <div class="content">
                <i class='bx bxs-check-circle'></i>
                <h1>Success</h1>
                <span class="message">Your order has been submitted successfully!</span>
                <button type="button" class="close-modal"><span>OK</span></button>
            </div>
        </div>
    </div>

    <div class="footer">

        <div class="container">

            <div class="more">
                <a href="#">About us</a>
                <a href="#">Ask question</a>
                <a href="#">Contact us</a>
            </div>

            <div class="location">
                <span>Location</span>
            </div>

            <div class="social-page">
                <div class="social-media">
                    <a href="#"><i class='bx bxl-whatsapp'></i></a>
                    <a href="#"><i class='bx bxl-facebook-circle'></i></a>
                    <a href="#"><i class='bx bxl-twitter'></i></a>
                    <a href="#"><i class='bx bxl-instagram-alt'></i></a>
                </div>
                <div class="project">
                    <a href="https://github.com/HazmiHazim" target="_blank"><i class='bx bxl-github'></i></a>
                    <a href="https://www.linkedin.com/in/hazmihazim/" target="_blank"><i
                            class='bx bxl-linkedin-square'></i></a>
                </div>
            </div>
        </div>

        <div class="copyright">
            <span>&copy; baker 2025 baker sado - ALL RIGHTS RESERVED</span>
        </div>

    </div>

    <script>
        // Currency configuration for JavaScript
        window.currencyConfig = {
            symbol: '{{ \App\Helpers\CurrencyHelper::symbol() }}',
            code: '{{ \App\Helpers\CurrencyHelper::code() }}'
        };
    </script>
    {{-- Legacy public Blade reference only. React owns all user-facing behavior. --}}

    <script>
        // Mobile Navigation Toggle
        document.addEventListener('DOMContentLoaded', function() {
            const mobileMenuBtn = document.getElementById('mobile-menu-btn');
            const navPage = document.getElementById('nav-page');
            const topbar = document.querySelector('.topbar');

            mobileMenuBtn.addEventListener('click', function() {
                navPage.classList.toggle('active');
                mobileMenuBtn.classList.toggle('active');
                topbar.classList.toggle('nav-open');
            });

            // Close mobile menu when clicking outside
            document.addEventListener('click', function(e) {
                if (!topbar.contains(e.target)) {
                    navPage.classList.remove('active');
                    mobileMenuBtn.classList.remove('active');
                    topbar.classList.remove('nav-open');
                }
            });

            // Close mobile menu when window resizes
            window.addEventListener('resize', function() {
                if (window.innerWidth > 768) {
                    navPage.classList.remove('active');
                    mobileMenuBtn.classList.remove('active');
                    topbar.classList.remove('nav-open');
                }
            });


        });
    </script>

</body>

</html>
