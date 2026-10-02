# Test Menu Filtering System

## Overview
This document describes how to test the new menu filtering system that allows users to filter food items by category, price range, and search terms.

## Features to Test

### 1. Category Filtering
- [ ] Filter by "Malay Cuisine"
- [ ] Filter by "Western"
- [ ] Filter by "Dessert"
- [ ] Filter by "Beverages"
- [ ] Filter by "Meat Dishes"
- [ ] Filter by "Seafood"
- [ ] Filter by "Vegetarian"
- [ ] Filter by "Appetizers"
- [ ] Filter by "Soups"
- [ ] Filter by "Salads"

### 2. Price Range Filtering
- [ ] Filter by "Under $10.00" (low)
- [ ] Filter by "$10.01 - $25.00" (medium)
- [ ] Filter by "Over $25.00" (high)

### 3. Sorting Options
- [ ] Sort by "Name (A-Z)"
- [ ] Sort by "Name (Z-A)"
- [ ] Sort by "Price (Low to High)"
- [ ] Sort by "Price (High to Low)"

### 4. Search Functionality
- [ ] Search by food name
- [ ] Search by description
- [ ] Search by category name

### 5. Combined Filters
- [ ] Category + Price Range
- [ ] Category + Search
- [ ] Price Range + Search
- [ ] All filters combined

### 6. Filter State Management
- [ ] Selected filters are maintained when page reloads
- [ ] Active filters are displayed correctly
- [ ] Individual filters can be removed
- [ ] Clear all filters button works

### 7. Responsive Design
- [ ] Filters work on desktop
- [ ] Filters work on tablet
- [ ] Filters work on mobile

## Test Steps

1. Navigate to `/menu` route
2. Verify filter section is displayed
3. Test each filter individually
4. Test filter combinations
5. Test filter removal
6. Test responsive behavior

## Expected Results

- Filters should work correctly
- Results should update immediately
- Filter state should be maintained
- UI should be responsive
- No JavaScript errors in console
- All prices should display in USD ($)

## Notes

- Make sure FoodCategorySeeder has been run
- Ensure there are food items in different categories
- Verify currency helper is working correctly
- Check that all routes are accessible
