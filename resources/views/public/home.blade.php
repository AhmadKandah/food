@extends('main')

@section('title', 'Home')

@section('content')

    <div class="home-page">

        <main>
            <div class="page">
                <div class="content">
                    <div class="title">
                        <h1>Welcome to Glaw Restaurant</h1>
                    </div>
                    
                    <div class="description">
                        <span>Experience the finest dining with our exceptional menu and warm hospitality.</span>
                    </div>
                    
                    <a href="{{ route('menu') }}">
                        <span>View Our Menu</span>
                    </a>
                </div>
            </div>
        </main>

        @include('public.modal.success-message');

    </div>

@endsection
