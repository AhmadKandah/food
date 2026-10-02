<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Menu - Table {{ $table->code }}</title>
    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
    <style>
        .table-menu-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            font-family: Arial, sans-serif;
        }
        .table-header {
            text-align: center;
            background: linear-gradient(135deg, #ffffff 0%, #ffffff 100%);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .table-header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: bold;
        }
        .table-header p {
            margin: 10px 0 0 0;
            font-size: 1.2em;
            opacity: 0.9;
        }
        .menu-categories {
            display: grid;
            gap: 30px;
        }
        .category-section {
            background: white;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            border: 1px solid #e0e0e0;
        }
        .category-title {
            font-size: 1.8em;
            color: #333;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
            display: flex;
            align-items: center;
        }
        .category-title i {
            margin-right: 10px;
            color: #667eea;
        }
        .menu-items {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        .menu-item {
            display: flex;
            background: #f8f9fa;
            border-radius: 10px;
            padding: 15px;
            transition: all 0.3s ease;
            border: 2px solid transparent;
        }
        .menu-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            border-color: #667eea;
        }
        .menu-item-image {
            width: 80px;
            height: 80px;
            border-radius: 10px;
            background: #ddd;
            margin-right: 15px;
            overflow: hidden;
        }
        .menu-item-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .menu-item-details {
            flex: 1;
        }
        .menu-item-name {
            font-size: 1.2em;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }
        .menu-item-description {
            color: #666;
            font-size: 0.9em;
            margin-bottom: 10px;
            line-height: 1.4;
        }
        .menu-item-price {
            font-size: 1.3em;
            font-weight: bold;
            color: #667eea;
        }
        .add-to-cart-btn {
            background: #28a745;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.9em;
            margin-top: 10px;
            transition: background 0.3s ease;
        }
        .add-to-cart-btn:hover {
            background: #218838;
        }
        .cart-summary {
            position: static;
            margin: 30px auto 0;
            background: #667eea;
            color: white;
            padding: 15px 20px;
            border-radius: 50px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            cursor: pointer;
            display: none;
            text-align: center;
            max-width: 300px;
        }
        .cart-summary.show {
            display: block;
        }
        .no-items {
            text-align: center;
            color: #666;
            font-style: italic;
            padding: 20px;
        }
        @media (max-width: 768px) {
            .table-menu-container {
                padding: 10px;
            }
            .menu-items {
                grid-template-columns: 1fr;
            }
            .menu-item {
                flex-direction: column;
                text-align: center;
            }
            .menu-item-image {
                margin: 0 auto 15px auto;
            }
        }
    </style>
</head>
<body>
    <div class="table-menu-container">
        <!-- Table Header -->
        <div class="table-header">
            <h1><i class='bx bx-restaurant'></i> Welcome to Table {{ $table->code }}</h1>
            <p>Browse our delicious menu and place your order</p>
        </div>

        <!-- Menu Categories -->
        <div class="menu-categories">
            @if($categories->count() > 0)
                @foreach($categories as $category)
                    @if($category->foodMenus->count() > 0)
                        <div class="category-section">
                            <h2 class="category-title">
                                <i class='bx bx-food-menu'></i>
                                {{ $category->name }}
                            </h2>
                            <div class="menu-items">
                                @foreach($category->foodMenus as $item)
                                    <div class="menu-item">
                                        <div class="menu-item-image">
                                            @if($item->image)
                                                <img src="{{ asset('storage/' . $item->image) }}" alt="{{ $item->name }}">
                                            @else
                                                <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #e9ecef;">
                                                    <i class='bx bx-food-menu' style="font-size: 2em; color: #6c757d;"></i>
                                                </div>
                                            @endif
                                        </div>
                                        <div class="menu-item-details">
                                            <div class="menu-item-name">{{ $item->name }}</div>
                                            <div class="menu-item-description">{{ $item->description ?? 'Delicious food item' }}</div>
                                            <div class="menu-item-price">${{ number_format($item->price, 2) }}</div>
                                            <button class="add-to-cart-btn" onclick="addToCart({{ $item->id }}, '{{ $item->name }}', {{ $item->price }})">
                                                <i class='bx bx-cart-add'></i> Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                @endforeach
                            </div>
                        </div>
                    @endif
                @endforeach
            @else
                <!-- Fallback: Show all food items if no categories -->
                <div class="category-section">
                    <h2 class="category-title">
                        <i class='bx bx-food-menu'></i>
                        Our Menu
                    </h2>
                    @if($foodMenus->count() > 0)
                        <div class="menu-items">
                            @foreach($foodMenus as $item)
                                <div class="menu-item">
                                    <div class="menu-item-image">
                                        @if($item->food_image)
                                            <img src="{{ asset('images/food-menu/' . $item->food_image) }}" alt="{{ $item->food_name }}">
                                        @else
                                            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #e9ecef;">
                                                <i class='bx bx-food-menu' style="font-size: 2em; color: #6c757d;"></i>
                                            </div>
                                        @endif
                                    </div>
                                    <div class="menu-item-details">
                                        <div class="menu-item-name">{{ $item->food_name }}</div>
                                        <div class="menu-item-description">{{ $item->food_description ?? 'Delicious food item' }}</div>
                                        <div class="menu-item-price">{{ \App\Helpers\CurrencyHelper::format($item->food_price) }}</div>
                                        <button class="add-to-cart-btn" onclick="addToCart({{ $item->id }}, '{{ $item->food_name }}', {{ $item->food_price }})">
                                            <i class='bx bx-cart-add'></i> Add to Cart
                                        </button>
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    @else
                        <div class="no-items">
                            <i class='bx bx-info-circle' style="font-size: 3em; margin-bottom: 10px; display: block;"></i>
                            No menu items available at the moment.
                        </div>
                    @endif
                </div>
            @endif
        </div>
    </div>

    <!-- Cart Summary -->
    <div class="cart-summary" id="cartSummary" onclick="viewCart()">
        <i class='bx bx-cart'></i>
        <span id="cartCount">0</span> items - {{ \App\Helpers\CurrencyHelper::symbol() }}<span id="cartTotal">0.00</span>
    </div>

    <script>
        let cart = [];
        let cartTotal = 0;

        function addToCart(itemId, itemName, itemPrice) {
            // Check if item already exists in cart
            const existingItem = cart.find(item => item.id === itemId);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id: itemId,
                    name: itemName,
                    price: itemPrice,
                    quantity: 1
                });
            }

            updateCartSummary();

            // Show success message
            showMessage(itemName + ' added to cart!');
        }

        function updateCartSummary() {
            const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
            cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

            document.getElementById('cartCount').textContent = cartCount;
            document.getElementById('cartTotal').textContent = cartTotal.toFixed(2);

            const cartSummary = document.getElementById('cartSummary');
            if (cartCount > 0) {
                cartSummary.classList.add('show');
            } else {
                cartSummary.classList.remove('show');
            }
        }

        function viewCart() {
            if (cart.length === 0) {
                alert('Your cart is empty!');
                return;
            }

            let cartDetails = 'Your Order:\n\n';
            cart.forEach(item => {
                cartDetails += `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}\n`;
            });
            cartDetails += `\nTotal: $${cartTotal.toFixed(2)}`;
            cartDetails += '\n\nNote: This is a demo. In a real application, you would proceed to checkout.';

            alert(cartDetails);
        }

        function showMessage(message) {
            // Create temporary message element
            const messageEl = document.createElement('div');
            messageEl.textContent = message;
            messageEl.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #28a745;
                color: white;
                padding: 15px 20px;
                border-radius: 5px;
                z-index: 1000;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            `;

            document.body.appendChild(messageEl);

            // Remove message after 3 seconds
            setTimeout(() => {
                document.body.removeChild(messageEl);
            }, 3000);
        }
    </script>
</body>
</html>
