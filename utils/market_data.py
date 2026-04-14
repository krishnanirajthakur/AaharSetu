THANE_APMC_PRICES = {
    'season': 'Summer 2024',
    'vegetables': {
        'palak': 40,  # ₹/kg
        'bhindi': 55,
        'tomato': 25,
        'onion': 35,
        'methi': 60,
        'jowar': 30,  # grains for bhakri
        'bajra': 28,
        'poha': 65
    },
    'avg_meal_budget': 150
}

def is_budget_friendly(ingredients: list[str], total_cost: float) -> bool:
    """Check if meal under avg budget using prices."""
    cost = sum(THANE_APMC_PRICES['vegetables'].get(ing, 50) * 0.2 for ing in ingredients)  # Estimate
    return total_cost < 0.8 * THANE_APMC_PRICES['avg_meal_budget']

def get_budget_tag(meal_name: str) -> str:
    """Budget tag for Maharashtrian meals."""
    low_cost = ['poha', 'bhakri', 'misal without farsan']
    if any(low in meal_name.lower() for low in low_cost):
        return '💰 Budget-Friendly (<₹100)'
    return ''
