<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Application Currency Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains the currency configuration for the application.
    | You can change the currency symbol, code, and formatting here.
    |
    */

    'symbol' => env('CURRENCY_SYMBOL', '$'),
    'code' => env('CURRENCY_CODE', 'USD'),
    'name' => env('CURRENCY_NAME', 'US Dollar'),
    'position' => env('CURRENCY_POSITION', 'before'), // 'before' or 'after'
    'decimals' => env('CURRENCY_DECIMALS', 2),
    'thousands_separator' => env('CURRENCY_THOUSANDS_SEPARATOR', ','),
    'decimal_separator' => env('CURRENCY_DECIMAL_SEPARATOR', '.'),
];
