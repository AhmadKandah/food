<?php

namespace App\Helpers;

class CurrencyHelper
{
    /**
     * Format a price value with the configured currency
     *
     * @param float $amount
     * @param bool $showSymbol
     * @return string
     */
    public static function format($amount, $showSymbol = true)
    {
        $symbol = config('currency.symbol', '$');
        $decimals = config('currency.decimals', 2);
        $thousandsSeparator = config('currency.thousands_separator', ',');
        $decimalSeparator = config('currency.decimal_separator', '.');
        $position = config('currency.position', 'before');

        $formattedAmount = number_format($amount, $decimals, $decimalSeparator, $thousandsSeparator);

        if (!$showSymbol) {
            return $formattedAmount;
        }

        if ($position === 'before') {
            return $symbol . $formattedAmount;
        }

        return $formattedAmount . $symbol;
    }

    /**
     * Get just the currency symbol
     *
     * @return string
     */
    public static function symbol()
    {
        return config('currency.symbol', '$');
    }

    /**
     * Get the currency code
     *
     * @return string
     */
    public static function code()
    {
        return config('currency.code', 'USD');
    }
}
