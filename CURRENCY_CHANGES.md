# Currency Changes Documentation

## Overview
This document describes the changes made to convert the application's currency display from Malaysian Ringgit (RM) to US Dollar ($).

## Files Modified

### 1. Configuration Files
- **`config/currency.php`** - New currency configuration file
- **`app/Helpers/CurrencyHelper.php`** - New helper class for currency formatting

### 2. View Files
- **`resources/views/main.blade.php`** - Updated cart total display and added currency config for JavaScript
- **`resources/views/partials/table1.blade.php`** - Updated price display in admin tables
- **`resources/views/public/menu.blade.php`** - Updated menu item prices
- **`resources/views/public/promotion.blade.php`** - Updated promotion prices
- **`resources/views/public/table-menu.blade.php`** - Updated table menu prices and cart summary

### 3. React Files
- **`resources/js/utils/currency.js`** - Formats values from the shared currency configuration

## Currency Configuration

The application now uses a centralized currency configuration system. You can modify the currency settings by updating the following environment variables in your `.env` file:

```env
# Currency Configuration
CURRENCY_SYMBOL=$
CURRENCY_CODE=USD
CURRENCY_NAME="US Dollar"
CURRENCY_POSITION=before
CURRENCY_DECIMALS=2
CURRENCY_THOUSANDS_SEPARATOR=,
CURRENCY_DECIMAL_SEPARATOR=.
```

### Configuration Options

- **`CURRENCY_SYMBOL`** - The currency symbol (e.g., $, €, £)
- **`CURRENCY_CODE`** - The ISO currency code (e.g., USD, EUR, GBP)
- **`CURRENCY_NAME`** - The full currency name
- **`CURRENCY_POSITION`** - Position of symbol relative to amount ('before' or 'after')
- **`CURRENCY_DECIMALS`** - Number of decimal places to display
- **`CURRENCY_THOUSANDS_SEPARATOR`** - Character to separate thousands
- **`CURRENCY_DECIMAL_SEPARATOR`** - Character to separate decimal places

## Usage

### In Blade Templates
```php
{{ \App\Helpers\CurrencyHelper::format($price) }}
{{ \App\Helpers\CurrencyHelper::symbol() }}
{{ \App\Helpers\CurrencyHelper::code() }}
```

### In JavaScript
```javascript
// Currency symbol is available globally
window.currencyConfig.symbol
window.currencyConfig.code
```

## Benefits

1. **Centralized Configuration** - All currency settings are in one place
2. **Easy to Change** - Switch currencies by updating environment variables
3. **Consistent Formatting** - All prices use the same formatting rules
4. **Maintainable** - No need to search and replace currency symbols throughout the codebase
5. **Flexible** - Support for different currency positions and formatting options

## Migration Notes

- All hardcoded "RM" references have been replaced with dynamic currency formatting
- The application now defaults to US Dollar ($) instead of Malaysian Ringgit (RM)
- JavaScript cart functionality has been updated to use dynamic currency symbols
- Admin tables and public views now display prices with the configured currency

## Future Enhancements

- Add support for multiple currencies
- Implement currency conversion rates
- Add locale-specific formatting
- Support for different currency display formats per region
