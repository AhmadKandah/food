@extends('main')

@section('title', 'Menu')

@section('content')

    <div class="menu-page">

        <!-- Hero Section - Dish of the Day -->
        <div class="menu-hero-section">
            <div class="dish-of-day-badge">
                <span>Dish of the Day</span>
            </div>
            <div class="hero-content">
                <div class="hero-text">
                    <h1 class="hero-title">
                        <span class="title-line">Perfect Ambience &</span>
                        <span class="title-line">Best Quality Food</span>
                    </h1>
                    <p class="hero-description">
                        Satisfy your cravings by getting the best quality food from us and enjoy with your beloved ones. Customers satisfaction is our first priority. Come and have a best experience in our place.
                    </p>
                    <button class="hero-button add-to-cart-hero" data-food-id="1" data-food-image="{{ asset('images/food-menu/1.png') }}" data-food-name="Special Dish of the Day" data-food-price="25.99">
                        <i class='bx bx-cart-add'></i>
                        <span>Add to Cart</span>
                    </button>
                </div>
                <div class="hero-image">
                    <img src="{{ asset('images/food-menu/1.png') }}" alt="Dish of the Day" class="hero-food-image">
                </div>
            </div>
        </div>

        <section>

            <main>

                <div class="page" id="menu-content">

                    <!-- Filter Section -->
                    <div class="filter-section">
                        <div class="filter-header">
                            <h2><i class='bx bx-filter-alt'></i> Filter Menu</h2>
                        </div>
                        
                        <!-- Search Bar -->
                        <form action="{{ route('menu') }}" method="GET" class="search-form">
                            <div class="search-filter">
                                <input type="text" name="search" placeholder="Search for food..." value="{{ $searchKeyword ?? '' }}">
                                <button type="submit" class="search-btn">
                                    <i class='bx bx-search'></i>
                                </button>
                            </div>
                        </form>
                        
                        <!-- Category Filter Buttons -->
                        <div class="category-filter-buttons">
                            <div class="category-buttons">
                                <a href="{{ route('menu') }}" class="category-btn {{ ($selectedCategory ?? '') == '' ? 'active' : '' }}">
                                    All Categories
                                </a>
                                @foreach($categories as $category)
                                    <a href="{{ route('menu', ['category' => $category->id]) }}" 
                                       class="category-btn {{ ($selectedCategory ?? '') == $category->id ? 'active' : '' }}">
                                        {{ $category->name }}
                                    </a>
                                @endforeach
                            </div>
                        </div>
                        

                        


                    @if ($menu->isEmpty())
                        <div class="container-empty">
                            <i class='bx bxs-error-alt'></i>
                            <div class="text">
                                <span class="top">No items match your filters.</span>
                                <span class="bottom">Try adjusting your search criteria or <a href="{{ route('menu') }}">clear all filters</a>.</span>
                            </div>
                        </div>
                    @else
                        <div class="category-banner">
                            <h1>Menu</h1>
                        </div>
                        <div class="food-item">
                            @foreach ($menu as $menuItem)
                                <div class="item">
                                    <div class="image">
                                        <img src="{{ $menuItem->image }}" alt="food-image">
                                        <div class="overlay">
                                            <button type="button" class="add-to-cart" data-food-id="{{ $menuItem->id }}"
                                                data-food-image="{{ $menuItem->image }}" data-food-name="{{ $menuItem->name }}"
                                                data-food-price="{{ $menuItem->price }}">
                                                <i class='bx bx-plus'></i>
                                                <span>Add to Cart</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="name-price">
                                        <span class="food-name">{{ $menuItem->name }}</span>
                                        <span class="price">{{ \App\Helpers\CurrencyHelper::format($menuItem->price) }}</span>
                                        @if($menuItem->foodCategory)
                                            <span class="category-tag">{{ $menuItem->foodCategory->name }}</span>
                                        @endif
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    @endif

                </div>

            </main>

            @include('public.modal.success-message');

        </section>

    </div>



@endsection
