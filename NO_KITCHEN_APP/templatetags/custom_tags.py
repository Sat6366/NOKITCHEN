# your_app/templatetags/custom_tags.py
from django import template
from decimal import Decimal,InvalidOperation

register = template.Library()

@register.filter(name="multiply")
def multiply(value, arg):
    """
    Multiply two numbers safely inside Django templates.
    Works with int, float or Decimal.
    """
    try:
        return float(Decimal(value) * Decimal(arg))
    except (TypeError, ValueError, InvalidOperation):
        return ""
