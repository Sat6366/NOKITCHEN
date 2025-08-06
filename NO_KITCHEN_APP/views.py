from django.shortcuts import render

# Create your views here.
from django.shortcuts import render, redirect, get_object_or_404
from django.forms import inlineformset_factory
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.contrib import messages
from .forms import RegisterUserForm
from django.contrib.auth import login, logout, authenticate
from .models import Food, Cart, CartItem
from django.core.exceptions import ObjectDoesNotExist


# Create your views here.
def home(request):
    context = {}
    return render(request, 'pages/home.html', context)

from .models import NoKitchenMenu, NoKitchenCurries

def menu(request):
    items = NoKitchenMenu.objects.all().order_by('-created_at')
    veg_curries = NoKitchenCurries.objects.filter(curry_type='veg')
    nonveg_curries = NoKitchenCurries.objects.filter(curry_type='nonveg')
    all_items = NoKitchenMenu.objects.all()

    return render(request, 'pages/menu.html', {
        'items': items,
        'veg_curries': veg_curries,
        'nonveg_curries': nonveg_curries,
        'all_items': all_items,
    })

from django.shortcuts import render

def order_lunch_box(request):
    return render(request, 'pages/order_lunch.html')



from django.shortcuts import render
from .models import NoKitchenMenu

def menu_not_user(request):
    menu_items = NoKitchenMenu.objects.all()
    categories = [
        ('all', 'All'),
        ('breakfast', 'Breakfast'),
        ('lunch', 'Lunch'),
        ('dinner', 'Dinner'),
        ('snack', 'Snacks'),
        ('dessert', 'Desserts'),
        ('special', 'Special'),
    ]
    context = {
        'menu_items': menu_items,
        'categories': categories
    }
    return render(request, 'pages/menu!.html', context)



from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from datetime import datetime
from .models import WeeklyMealSelection, Wallet, SkippedMeal

@login_required
def account(request):
    from_date_str = request.GET.get('from_date')
    to_date_str = request.GET.get('to_date')

    from_date_obj, to_date_obj = None, None

    # Default to latest from/to date if not in GET
    if not from_date_str or not to_date_str:
        latest_entry = (
            WeeklyMealSelection.objects.filter(user=request.user)
            .exclude(from_date__isnull=True, to_date__isnull=True)
            .order_by('-from_date')
            .first()
        )
        if latest_entry:
            from_date_obj = latest_entry.from_date
            to_date_obj = latest_entry.to_date
    else:
        try:
            from_date_obj = datetime.strptime(from_date_str, "%Y-%m-%d").date()
            to_date_obj = datetime.strptime(to_date_str, "%Y-%m-%d").date()
        except ValueError:
            pass

    # Filter meals by user and date range
    meals_qs = WeeklyMealSelection.objects.filter(user=request.user)
    if from_date_obj and to_date_obj:
        meals_qs = meals_qs.filter(from_date=from_date_obj, to_date=to_date_obj)

    meals_qs = meals_qs.prefetch_related('selected_items')

    skipped_ids = list(
        SkippedMeal.objects.filter(
            user=request.user,
            meal_selection_id__in=meals_qs.values_list('id', flat=True)
        ).values_list('meal_selection_id', flat=True)
    )

    # Organize meal schedule
    meal_schedule = {}
    for meal in meals_qs:
        day = meal.get_day_display()
        meal_type = meal.get_meal_type_display()
        if day not in meal_schedule:
            meal_schedule[day] = {}
        meal_schedule[day][meal_type] = {
            'selection': meal,
            'items': list(meal.selected_items.all())
        }

    wallet = Wallet.objects.filter(user=request.user).first()
    wallet_balance = wallet.balance if wallet else 0.0

    return render(request, 'pages/account.html', {
        'meal_schedule': meal_schedule,
        'wallet_balance': wallet_balance,
        'skipped_ids': skipped_ids,
        'from_date': from_date_obj,
        'to_date': to_date_obj
    })



from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .models import WeeklyMealSelection, Wallet, SkippedMeal

@csrf_exempt
@login_required
def skip_meal(request):
    if request.method == 'POST':
        meal_id = request.POST.get('meal_id')

        try:
            meal_selection = WeeklyMealSelection.objects.get(id=meal_id, user=request.user)

            # 🔒 Only allow skipping meals within latest date range
            latest_from_date = (
                WeeklyMealSelection.objects
                .filter(user=request.user)
                .exclude(from_date__isnull=True)
                .order_by('-from_date')
                .values_list('from_date', flat=True)
                .first()
            )
            latest_to_date = (
                WeeklyMealSelection.objects
                .filter(user=request.user)
                .exclude(to_date__isnull=True)
                .order_by('-to_date')
                .values_list('to_date', flat=True)
                .first()
            )

            if not latest_from_date or not latest_to_date:
                return JsonResponse({'status': 'error', 'message': 'No active meal plan date range found.'})

            if (
                meal_selection.from_date != latest_from_date or
                meal_selection.to_date != latest_to_date
            ):
                return JsonResponse({
                    'status': 'error',
                    'message': 'Skipping is only allowed for the most recent meal plan.'
                })

            # ✅ Already skipped check
            if SkippedMeal.objects.filter(user=request.user, meal_selection=meal_selection).exists():
                return JsonResponse({'status': 'error', 'message': 'Meal already skipped.'})

            # ✅ Refund calculation
            total_price = sum(item.price for item in meal_selection.selected_items.all())

            wallet, _ = Wallet.objects.get_or_create(user=request.user)
            wallet.balance += total_price
            wallet.save()

            SkippedMeal.objects.create(
                user=request.user,
                meal_selection=meal_selection,
                refunded_amount=total_price
            )

            return JsonResponse({
                'status': 'success',
                'refunded': str(total_price),
                'new_balance': str(wallet.balance)
            })

        except WeeklyMealSelection.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Meal not found.'})

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import WeeklyMealSelection, NoKitchenMenu

@csrf_exempt
@login_required
def edit_meal(request):
    if request.method == 'POST':
        meal_id = request.POST.get('meal_id')
        items_text = request.POST.get('items', '')

        try:
            meal = WeeklyMealSelection.objects.get(id=meal_id, user=request.user)
            item_ids = [int(i.strip()) for i in items_text.split(',') if i.strip().isdigit()]

            meal.selected_items.clear()
            total_price = 0.0
            updated_items = []

            for item_id in item_ids:
                try:
                    item = NoKitchenMenu.objects.get(id=item_id, meal_type=meal.meal_type)
                    meal.selected_items.add(item)
                    total_price += float(item.price)
                    updated_items.append({
                        'name': item.item_name,
                        'price': str(item.price)
                    })
                except NoKitchenMenu.DoesNotExist:
                    continue

            meal.total_price = total_price
            meal.save()

            return JsonResponse({
                'status': 'success',
                'updated_items': updated_items
            })

        except WeeklyMealSelection.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Meal not found or unauthorized.'})

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})



# views.py
from django.http import JsonResponse
from .models import WeeklyMealSelection, NoKitchenMenu
from django.contrib.auth.decorators import login_required

@login_required
def get_items_by_meal_type(request):
    meal_id = request.GET.get('meal_id')

    try:
        meal = WeeklyMealSelection.objects.get(id=meal_id, user=request.user)
        selected_ids = meal.selected_items.values_list('id', flat=True)

        items = NoKitchenMenu.objects.filter(meal_type=meal.meal_type).order_by('item_name')

        data = []
        for item in items:
            data.append({
                'id': item.id,
                'name': item.item_name,
                'price': str(item.price),
                'selected': item.id in selected_ids
            })

        return JsonResponse({'status': 'success', 'items': data})

    except WeeklyMealSelection.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Meal not found'})


def orders(request):
    context = {}
    return render(request, 'pages/orders.html', context)

def loginPage(request):
    if request.user.is_authenticated:
        return redirect('home')

    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect('home')
        else:
            messages.info(request, 'Username (or) Password is incorrect')

    context = {}
    return render(request, 'pages/login.html', context)

def logoutUser(request):
    if not request.user.is_authenticated:
        return redirect('home')
    messages.success(request, f'{request.user} has been succesfully logged out.')
    logout(request)
    return redirect('login')


from django.shortcuts import redirect, render
from django.contrib import messages
from .forms import RegisterUserForm
from .models import Profile
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm

def registerPage(request):
    if request.user.is_authenticated:
        return redirect('home')
    
    form = RegisterUserForm()
    if request.method == "POST":
        form = RegisterUserForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)  # Save the user but don't commit yet
            user.save()  # Now save the user to commit to the database
            
            # Create or update the Profile
            profile, created = Profile.objects.update_or_create(
                user=user,
                defaults={
                    'mobile_number': form.cleaned_data['mobile_number'],
                    'address': form.cleaned_data['address'],
                    'pincode': form.cleaned_data['pincode']
                }
            )
            
            messages.success(request, f'Account was created for {user.username}')
            return redirect('login')
    
    context = {'form': form}
    return render(request, 'pages/register.html', context)


def breakfast(request):
    items = Food.objects.all().filter(meal_type ='breakfast')
    context = {'items': items}
    return render(request, 'pages/menu.html', context)

def lunch(request):
    items = Food.objects.all().filter(meal_type ='lunch')
    context = {'items': items}
    return render(request, 'pages/menu.html', context)

def dinner(request):
    items = Food.objects.all().filter(meal_type ='dinner')
    context = {'items': items}
    return render(request, 'pages/menu.html', context)

def nonvegetarian(request):
    items = Food.objects.all().filter(vegetarian=False)
    context = {'items': items}
    return render(request, 'pages/menu.html', context)

def search(request):
    items = Food.objects.filter(name__icontains=request.GET['name'])
    context = {'items': items}
    return render(request, 'pages/menu.html', context)



from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import NoKitchenMenu, NoKitchenCart, NoKitchenCartItem

def _cart_id(request):
    cart = request.session.session_key
    if not cart:
        cart = request.session.create()
    return cart

@login_required
def add_to_cart(request, item_id):
    item = get_object_or_404(NoKitchenMenu, id=item_id)

    cart, created = NoKitchenCart.objects.get_or_create(
        cart_id=_cart_id(request),
        defaults={'user': request.user}
    )

    if not cart.user:
        cart.user = request.user
        cart.save()

    cart_item, created = NoKitchenCartItem.objects.get_or_create(
        item=item,
        cart=cart,
        user=request.user
    )

    if not created:
        if cart_item.quantity < item.stock:
            cart_item.quantity += 1
    cart_item.save()

    return redirect('cart')  # make sure 'cart' is the name of your cart view






@login_required
def cart(request):
    cart_id = _cart_id(request)
    cart = get_object_or_404(NoKitchenCart, cart_id=cart_id)

    cart_items = NoKitchenCartItem.objects.filter(cart=cart, user=request.user)

    total = sum(item.item.price * item.quantity for item in cart_items if item.item)

    context = {
        'cart_items': cart_items,
        'total': total,
    }

    return render(request, 'pages/cart.html', context)


from django.shortcuts import get_object_or_404, redirect
from .models import NoKitchenCart, NoKitchenCartItem, NoKitchenMenu

def _cart_id(request):
    cart_id = request.session.session_key
    if not cart_id:
        request.session.create()
    return cart_id

def cart_remove(request, product_id):
    cart = get_object_or_404(NoKitchenCart, cart_id=_cart_id(request))
    product = get_object_or_404(NoKitchenMenu, id=product_id)

    try:
        cart_item = NoKitchenCartItem.objects.get(item=product, cart=cart)
        if cart_item.quantity > 1:
            cart_item.quantity -= 1
            cart_item.save()
        else:
            cart_item.delete()
    except NoKitchenCartItem.DoesNotExist:
        pass

    return redirect('cart')


def cart_remove_product(request, product_id):
    cart = get_object_or_404(NoKitchenCart, cart_id=_cart_id(request))
    product = get_object_or_404(NoKitchenMenu, id=product_id)

    try:
        cart_item = NoKitchenCartItem.objects.get(item=product, cart=cart)
        cart_item.delete()
    except NoKitchenCartItem.DoesNotExist:
        pass

    return redirect('cart')



from django.shortcuts import render, get_object_or_404
from django.utils import timezone
from .models import NoKitchenCart, NoKitchenCartItem
from .views import _cart_id  # Make sure to import or define this if not present

# views.py
from django.shortcuts import render, get_object_or_404, redirect
from django.utils import timezone
from django.conf import settings
from django.contrib.auth.decorators import login_required
import razorpay
from .models import NoKitchenCart, NoKitchenCartItem, CustomMealPlan, DeliveryAddress
from .views import _cart_id


from django.shortcuts import render, get_object_or_404, redirect
from django.utils import timezone
from django.conf import settings
from django.contrib.auth.decorators import login_required
import razorpay
from .models import NoKitchenCart, NoKitchenCartItem, CustomMealPlan, DeliveryAddress
from .views import _cart_id  # Make sure this is defined

from django.shortcuts import render, get_object_or_404
from django.utils import timezone
from django.conf import settings
from django.contrib.auth.decorators import login_required
import razorpay
from .models import NoKitchenCart, NoKitchenCartItem, CustomMealPlan, DeliveryAddress
from .views import _cart_id


from .models import (
    NoKitchenCart, NoKitchenCartItem, CustomMealPlan, DeliveryAddress
)
from .views import _cart_id

from django.shortcuts import render, get_object_or_404
from django.utils import timezone
from django.conf import settings
from django.contrib.auth.decorators import login_required
from decimal import Decimal
from datetime import datetime
import razorpay

from .models import (
    NoKitchenCart, NoKitchenCartItem, CustomMealPlan, DeliveryAddress
)
from .views import _cart_id

from django.shortcuts import render, get_object_or_404
from django.utils import timezone
from django.conf import settings
from django.contrib.auth.decorators import login_required
from decimal import Decimal
from datetime import datetime
import razorpay

from .models import NoKitchenCart, NoKitchenCartItem, CustomMealPlan, DeliveryAddress
from .views import _cart_id

@login_required
def preorder(request):
    user = request.user
    cart_id = _cart_id(request)
    cart = get_object_or_404(NoKitchenCart, cart_id=cart_id)
    cart_items = NoKitchenCartItem.objects.filter(cart=cart, user=user)

    # Grouping items
    breakfast_items = [item for item in cart_items if item.item.meal_type == 'breakfast']
    lunch_items = [item for item in cart_items if item.item.meal_type == 'lunch']
    dinner_items = [item for item in cart_items if item.item.meal_type == 'dinner']

    # Initialize values for GET
    num_days = 1
    start_date = timezone.now().date()
    end_date = timezone.now().date()
    total = Decimal("0.00")
    show_razorpay = False

    if request.method == 'POST':
        # Extract date range
        start_date_str = request.POST.get('start_date')
        end_date_str = request.POST.get('end_date')

        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            num_days = max((end_date - start_date).days + 1, 1)
        except Exception:
            num_days = 1

        # Save delivery address
        DeliveryAddress.objects.create(
            user=user,
            flat_number=request.POST.get('flat_number'),
            street=request.POST.get('street'),
            landmark=request.POST.get('landmark'),
            alt_mobile=request.POST.get('alt_mobile'),
            breakfast_time=request.POST.get('breakfast_time'),
            lunch_time=request.POST.get('lunch_time'),
            dinner_time=request.POST.get('dinner_time'),
            breakfast_address_type=request.POST.get('breakfast_address_type'),
            lunch_address_type=request.POST.get('lunch_address_type'),
            dinner_address_type=request.POST.get('dinner_address_type'),
        )

        # Save meal plan items
        for item in cart_items:
            CustomMealPlan.objects.create(
                user=user,
                base_meal=item.item,
                start_date=start_date,
                end_date=end_date
            )

        # Calculate total
        for item in cart_items:
            total += Decimal(item.item.price) * item.quantity * num_days

        # Razorpay order creation
        if not request.session.get('razorpay_payment_id'):
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
            amount = int(total * 100)
            razorpay_order = client.order.create({
                'amount': amount,
                'currency': 'INR',
                'payment_capture': '1',
            })
            request.session['razorpay_payment_id'] = razorpay_order['id']
            request.session['meal_payment_total'] = float(total)
            show_razorpay = True

    # Context for rendering
    context = {
        'current_date': timezone.now(),
        'breakfast_items': breakfast_items,
        'lunch_items': lunch_items,
        'dinner_items': dinner_items,
        'total': total,
        'num_days': num_days,
        'start_date': start_date,
        'end_date': end_date,
        'show_razorpay': show_razorpay,
        'razorpay_key': settings.RAZORPAY_KEY_ID if show_razorpay else '',
        'order_id': request.session.get('razorpay_payment_id'),
        'amount': int(total * 100) if total > 0 else 0,
    }

    return render(request, 'pages/preorder.html', context)

import json
from decimal import Decimal
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import (
    CustomMealPlan,
    DeliveryAddress,
    FinalMealOrder,
    NoKitchenCartItem,
)
from .views import _cart_id  # Assuming this utility is defined in views

@login_required
def payment_success1(request):
    user = request.user
    payment_id = request.GET.get('payment_id') or request.session.get('razorpay_payment_id')
    total_amount = request.GET.get('total') or request.session.get('meal_payment_total')

    delivery = DeliveryAddress.objects.filter(user=user).order_by('-created_at').first()
    meal_plans = list(CustomMealPlan.objects.filter(user=user).order_by('-id')[:10])
    meal_plans.reverse()

    breakfast_items = [m.base_meal.item_name for m in meal_plans if m.base_meal.meal_type == 'breakfast']
    lunch_items = [m.base_meal.item_name for m in meal_plans if m.base_meal.meal_type == 'lunch']
    dinner_items = [m.base_meal.item_name for m in meal_plans if m.base_meal.meal_type == 'dinner']

    start_date = meal_plans[0].start_date if meal_plans else None
    end_date = meal_plans[-1].end_date if meal_plans else None

    final_order = FinalMealOrder.objects.filter(user=user, payment_id=payment_id).first()

    if not final_order and delivery and meal_plans:
        ordered_items = breakfast_items + lunch_items + dinner_items

        final_order = FinalMealOrder.objects.create(
            user=user,
            payment_id=payment_id,
            start_date=start_date,
            end_date=end_date,
            flat_number=delivery.flat_number,
            street=delivery.street,
            landmark=delivery.landmark,
            alt_mobile=delivery.alt_mobile,
            breakfast_time=delivery.breakfast_time,
            lunch_time=delivery.lunch_time,
            dinner_time=delivery.dinner_time,
            breakfast_address_type=delivery.breakfast_address_type,
            lunch_address_type=delivery.lunch_address_type,
            dinner_address_type=delivery.dinner_address_type,
            ordered_items=", ".join(ordered_items),
            total_amount=total_amount
        )

    context = {
        'payment_id': payment_id,
        'breakfast_items': breakfast_items,
        'lunch_items': lunch_items,
        'dinner_items': dinner_items,
        'start_date': start_date,
        'end_date': end_date,
        'total': total_amount,
        'delivery': delivery,
        'order_id': final_order.order_id if final_order else None,
    }

    # ✅ Clear session keys after payment
    request.session.pop('razorpay_payment_id', None)
    request.session.pop('meal_payment_total', None)

    # ✅ Clear the user's cart after successful payment
    cart_id = _cart_id(request)
    NoKitchenCartItem.objects.filter(cart__cart_id=cart_id, user=user).delete()

    return render(request, 'pages/payment_success1.html', context)

from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from .models import NoKitchenMenu, CustomMealPlan, CustomMealItem
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from .models import NoKitchenMenu, NoKitchenCurries, CustomMealPlan, CustomMealItem
from django.utils.dateparse import parse_date

from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from .models import NoKitchenMenu, NoKitchenCurries, CustomMealPlan, CustomMealItem, CustomCurryItem
from django.utils.dateparse import parse_date
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from .models import NoKitchenMenu, NoKitchenCurries, CustomMealPlan, CustomMealItem, CustomCurryItem
from django.utils.dateparse import parse_date

@login_required
def customize_meal(request, meal_id):
    base_meal = get_object_or_404(NoKitchenMenu, id=meal_id)
    all_items = NoKitchenMenu.objects.exclude(id=meal_id)
    veg_curries = NoKitchenCurries.objects.filter(curry_type='veg')
    nonveg_curries = NoKitchenCurries.objects.filter(curry_type='nonveg')

    if request.method == 'POST':
        selected_ids = request.POST.getlist('custom_items')
        notes = request.POST.get('notes', '')
        start_date = parse_date(request.POST.get('start_date', ''))
        end_date = parse_date(request.POST.get('end_date', ''))
        total_price = float(base_meal.price)

        plan = CustomMealPlan.objects.create(
            user=request.user,
            base_meal=base_meal,
            notes=notes,
            updated_price=0,
            start_date=start_date,
            end_date=end_date,
        )

        for raw_id in selected_ids:
            if raw_id.startswith('item_'):
                item_id = raw_id.replace('item_', '')
                qty = int(request.POST.get(f'quantities_item_{item_id}', 1))
                menu_item = get_object_or_404(NoKitchenMenu, id=item_id)
                CustomMealItem.objects.create(plan=plan, item=menu_item, quantity=qty)
                total_price += qty * float(menu_item.price)

            elif raw_id.startswith('curry_'):
                curry_id = raw_id.replace('curry_', '')
                qty = int(request.POST.get(f'quantities_curry_{curry_id}', 1))
                curry_item = get_object_or_404(NoKitchenCurries, id=curry_id)
                CustomCurryItem.objects.create(plan=plan, curry=curry_item, quantity=qty)
                total_price += qty * float(curry_item.price)

        plan.updated_price = total_price
        plan.save()
        return redirect('my_custom_plans')

    return render(request, 'pages/customize_meal.html', {
        'base_meal': base_meal,
        'all_items': all_items,
        'veg_curries': veg_curries,
        'nonveg_curries': nonveg_curries,
    })



from django.shortcuts import get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import CustomMealPlan

from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.conf import settings
import razorpay
from .models import CustomMealPlan

from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import CustomMealPlan
from datetime import timedelta

@login_required
def my_custom_plans(request):
    plans = CustomMealPlan.objects.filter(user=request.user)

    # Adjust updated_price per plan to account for number of days
    for plan in plans:
        if plan.start_date and plan.end_date:
            num_days = (plan.end_date - plan.start_date).days + 1
            plan.updated_price *= num_days

    grand_total = sum(plan.updated_price for plan in plans)

    return render(request, 'pages/my_custom_plans.html', {
        'plans': plans,
        'grand_total': grand_total
    })




# views.py
from django.conf import settings
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
import razorpay
from .models import CustomMealPlan

from django.http import JsonResponse


from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.conf import settings
import razorpay
from .models import CustomMealPlan, DeliveryAddress
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.conf import settings
from django.http import JsonResponse
import razorpay
from .models import CustomMealPlan, DeliveryAddress
from django.core.exceptions import MultipleObjectsReturned

@login_required
def initiate_custom_plan_payment(request):
    user = request.user

    if request.method == 'POST':
        # Step 1: Extract and validate delivery address data
        flat = request.POST.get('flat_number', '').strip()
        street = request.POST.get('street', '').strip()
        landmark = request.POST.get('landmark', '').strip()
        alt_mobile = request.POST.get('alt_mobile', '').strip()
        breakfast_time = request.POST.get('breakfast_time')
        breakfast_address_type = request.POST.get('breakfast_address_type')
        lunch_time = request.POST.get('lunch_time')
        lunch_address_type = request.POST.get('lunch_address_type')
        dinner_time = request.POST.get('dinner_time')
        dinner_address_type = request.POST.get('dinner_address_type')

        required_fields = {
            "Flat / Apartment Number": flat,
            "Street": street,
            "Landmark": landmark,
            "Breakfast Time": breakfast_time,
            "Lunch Time": lunch_time,
            "Dinner Time": dinner_time
        }

        for field_name, value in required_fields.items():
            if not value:
                return JsonResponse({'error': f"{field_name} is required."}, status=400)

        try:
            DeliveryAddress.objects.update_or_create(
                user=user,
                flat_number=flat,
                street=street,
                landmark=landmark,
                defaults={
                    'alt_mobile': alt_mobile,
                    'breakfast_time': breakfast_time,
                    'breakfast_address_type': breakfast_address_type,
                    'lunch_time': lunch_time,
                    'lunch_address_type': lunch_address_type,
                    'dinner_time': dinner_time,
                    'dinner_address_type': dinner_address_type,
                }
            )
        except MultipleObjectsReturned:
            return JsonResponse({'error': 'Multiple addresses found. Please resolve or contact support.'}, status=400)

        # Step 2: Fetch unpaid plans
        unpaid_plans = CustomMealPlan.objects.filter(user=user, is_paid=False)

        if not unpaid_plans.exists():
            return JsonResponse({'error': 'No unpaid plans available.'}, status=400)

        # Step 3: Calculate total amount
        total_amount = 0
        for plan in unpaid_plans:
            if plan.start_date and plan.end_date:
                num_days = (plan.end_date - plan.start_date).days + 1
                total_amount += plan.updated_price * num_days
            else:
                total_amount += plan.updated_price

        amount_in_paise = int(total_amount * 100)

        try:
            # Step 4: Create Razorpay order
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
            order = client.order.create({
                'amount': amount_in_paise,
                'currency': 'INR',
                'payment_capture': 1
            })

            # Step 5: Attach Razorpay order ID and generate unique custom_order_id
            for plan in unpaid_plans:
                plan.razorpay_order_id = order['id']
                if not plan.custom_order_id:
                    # This is optional if handled in model.save()
                    from .utils import generate_order_id  # adjust path if needed
                    plan.custom_order_id = generate_order_id()
                plan.save()  # Triggers model.save() with ID logic

            return JsonResponse({
                'order_id': order['id'],
                'amount': amount_in_paise,
                'currency': 'INR',
                'key_id': settings.RAZORPAY_KEY_ID
            })

        except Exception as e:
            return JsonResponse({'error': f'Payment initiation failed. {str(e)}'}, status=500)

    # GET request
    return render(request, 'pages/custom_plan_checkout.html', {
        'razorpay_key_id': settings.RAZORPAY_KEY_ID,
        'user_name': user.get_full_name(),
        'user_email': user.email,
    })




from .models import CustomMealPlan, DeliveryAddress
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from datetime import timedelta

from .models import CustomMealPlan, DeliveryAddress
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .models import CustomMealPlan, DeliveryAddress

@login_required
def custom_plan_payment_success(request):
    order_id = request.GET.get('order_id')
    payment_id = request.GET.get('payment_id')

    if not order_id or not payment_id:
        return redirect('/')

    # ✅ Update all unpaid plans for this order as paid
    CustomMealPlan.objects.filter(user=request.user, razorpay_order_id=order_id).update(
        is_paid=True,
        transaction_id=payment_id
    )

    # ✅ Fetch paid plans for the user and this order
    paid_plans = CustomMealPlan.objects.filter(
        user=request.user,
        razorpay_order_id=order_id,
        is_paid=True
    )

    # ✅ Fetch the latest delivery address (optional)
    address = DeliveryAddress.objects.filter(user=request.user).order_by('-id').first()

    total_amount = 0
    updated_plans = []

    for plan in paid_plans:
        days = (plan.end_date - plan.start_date).days + 1 if plan.start_date and plan.end_date else 1

        cost = 0
        if plan.breakfast:
            cost += days * (plan.breakfast_price or 0)
        if plan.lunch:
            cost += days * (plan.lunch_price or 0)
        if plan.dinner:
            cost += days * (plan.dinner_price or 0)

        plan.base_price = cost
        plan.save(update_fields=['base_price'])

        total_amount += cost
        updated_plans.append(plan)

    return render(request, 'pages/custom_plan_success.html', {
        'payment_id': payment_id,
        'user': request.user,
        'plans': updated_plans,
        'address': address,
        'total_amount': round(total_amount, 2)
    })


@login_required
def delete_custom_plan(request, plan_id):
    plan = get_object_or_404(CustomMealPlan, id=plan_id, user=request.user)
    plan.delete()
    return redirect('my_custom_plans')


# views.py

 # Make sure this includes a field for food items
import sys
sys.setrecursionlimit(1566666500)  # Increase as needed
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from .forms import SubscriptionForm
from .models import Subscription
from datetime import datetime
from django.shortcuts import render
from .models import WeeklyMenuPlan


from django.shortcuts import render, redirect
from datetime import datetime
from django.contrib import messages
from .models import NoKitchenMenu, WeeklyMenuPlan, WeeklyMealSelection

def create_subscription(request):
    today_str = datetime.today().strftime('%A').lower()  # e.g. "monday"

    # Try to fetch today's menu
    try:
        today_menu = WeeklyMenuPlan.objects.get(day=today_str, rotation_number=1)
        breakfast = today_menu.breakfast_items.all()
        lunch = today_menu.lunch_items.all()
        dinner = today_menu.dinner_items.all()
    except WeeklyMenuPlan.DoesNotExist:
        breakfast = lunch = dinner = []

    # Weekdays
    days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

    # Meal Items for each meal type
    meal_items = {
        'breakfast': NoKitchenMenu.objects.filter(meal_type='breakfast'),
        'lunch': NoKitchenMenu.objects.filter(meal_type='lunch'),
        'dinner': NoKitchenMenu.objects.filter(meal_type='dinner'),
    }

    # Handle POST submission (saving WeeklyMealSelection)
    if request.method == 'POST':
        for day in days:
            for meal in ['breakfast', 'lunch', 'dinner']:
                key = f'{day}_{meal}[]'
                selected_ids = request.POST.getlist(key)
                if selected_ids:
                    WeeklyMealSelection.objects.filter(day=day, meal_type=meal).delete()
                    selection = WeeklyMealSelection.objects.create(day=day, meal_type=meal)
                    selection.selected_items.set(NoKitchenMenu.objects.filter(id__in=selected_ids))
        messages.success(request, "✅ Weekly selections saved successfully!")
        return redirect('create_subscription')

    # Get all plans for current rotation
    weekly_data = WeeklyMenuPlan.objects.filter(rotation_number=1)

    # Calculate total price for the week
    total_price = 0
    for plan in weekly_data:
        total_price += sum(item.price for item in plan.breakfast_items.all())
        total_price += sum(item.price for item in plan.lunch_items.all())
        total_price += sum(item.price for item in plan.dinner_items.all())

    # Send everything to template
    return render(request, 'pages/create_subscription.html', {
        'day': today_str.title(),
        'days': days,
        'breakfast_items': breakfast,
        'lunch_items': lunch,
        'dinner_items': dinner,
        'weekly_data': weekly_data,
        'meal_items': meal_items,
        'weekly_total_price': total_price
    })


from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
import json
from datetime import datetime
from .models import WeeklyMealSelection, NoKitchenMenu

@csrf_exempt
@login_required
def save_weekly_meal(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user = request.user

            from_date_str = data.get('from_date')
            to_date_str = data.get('to_date')
            day = data.get('day')
            meal_plan = data.get('meal_plan', {})

            from_date = datetime.strptime(from_date_str, "%Y-%m-%d").date() if from_date_str else None
            to_date = datetime.strptime(to_date_str, "%Y-%m-%d").date() if to_date_str else None

            if not day or day not in meal_plan:
                return JsonResponse({'status': 'error', 'message': 'Day data missing or invalid.'})

            meals = meal_plan[day]
            for meal_type, item_ids in meals.items():
                item_ids = list(map(int, item_ids))  # Ensure item IDs are integers

                if not item_ids:
                    continue

                selection, _ = WeeklyMealSelection.objects.get_or_create(
                    user=user,
                    day=day,
                    meal_type=meal_type,
                    from_date=from_date,
                    to_date=to_date,
                )

                selection.selected_items.set(item_ids)
                total_price = sum(item.price for item in NoKitchenMenu.objects.filter(id__in=item_ids))
                selection.total_price = total_price
                selection.save()

            return JsonResponse({
                'status': 'success',
                'message': f'{day.title()} meals saved successfully.'
            })

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})

    return JsonResponse({'status': 'error', 'message': 'Invalid request'})



from django.shortcuts import render
from .models import Subscription

from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import WeeklyMealSelection, WeeklyMenuPlan, CustomMealPlan, FinalMealOrder

@login_required
def view_subscriptions(request):
    user = request.user

    # Fetch only subscriptions that belong to this user
    weekly_selections = WeeklyMealSelection.objects.filter(user=user)
    weekly_plans = WeeklyMenuPlan.objects.filter(user=user)
    custom_plans = CustomMealPlan.objects.filter(user=user)
    final_orders = FinalMealOrder.objects.filter(user=user)

    # Only pass if data exists
    context = {
        'username': user.username,
        'weekly_selections': weekly_selections if weekly_selections.exists() else None,
        'weekly_plans': weekly_plans if weekly_plans.exists() else None,
        'custom_plans': custom_plans if custom_plans.exists() else None,
        'final_orders': final_orders if final_orders.exists() else None,
    }

    return render(request, 'pages/view_subscriptions.html', context)

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Subscription, Payment
from .forms import PaymentForm

@login_required
def process_payment(request, subscription_id):
    # Fetch the subscription for the logged-in user
    subscription = get_object_or_404(Subscription, id=subscription_id, user=request.user)

    if request.method == 'POST':
        form = PaymentForm(request.POST)
        if form.is_valid():
            # Create a payment instance without saving it to the database yet
            payment = form.save(commit=False)

            # Assign the necessary attributes
            payment.user = request.user
            payment.subscription = subscription  # Assign the subscription

            # Now you can safely access subscription.amount
            payment.amount = subscription.amount  # This is now valid
            payment.status = 'completed'  # Assume successful payment for now

            # Save the payment instance to the database
            payment.save()

            # Display success message and redirect
            messages.success(request, 'Payment successful! Your subscription is now active.')
            return redirect('view_subscriptions')
        else:
            # Handle form errors and re-render the form with error messages
            messages.error(request, 'There was an error with your payment. Please check your details and try again.')
    else:
        form = PaymentForm()

    return render(request, 'pages/payment_form.html', {
        'form': form,
        'subscription': subscription,
    })

from django.shortcuts import render, redirect
from django.contrib import messages
from .models import Cart, Subscription  # Adjust according to your models
from django.shortcuts import render, redirect
from django.contrib import messages
from .models import Cart, CartPayment, CartItem, Subscription  # Ensure to import your models
from .forms import CartPaymentForm  # Ensure to import your form

from django.shortcuts import render, redirect
from django.contrib import messages
from .forms import CartPaymentForm
from .models import Cart, CartItem, CartPayment
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.shortcuts import redirect, render
from django.contrib.auth.decorators import login_required
from .models import Cart, CartItem, CartPayment ,Profile # Ensure you import your models
from .forms import CartPaymentForm  # Ensure you import your payment form

@login_required

def complete_payment(request):
    user=request.user
    if request.method == 'POST':
        form = CartPaymentForm(request.POST)

        if form.is_valid():
            # Create a CartPayment instance but do not save it yet
            cart_payment = form.save(commit=False)
            cart_payment.user = request.user  # Set the user from the request

            try:
                # Fetch the user's carts
                cart_queryset = Cart.objects.filter(user=request.user)

                if not cart_queryset.exists():
                    messages.error(request, "Your cart does not exist.")
                    return redirect('cart')  # Redirect to the cart view if no cart exists

                # Select the first cart for simplicity
                cart = cart_queryset.first()
                cart_payment.cart = cart  # Associate the cart with the payment

                # Fetch active cart items
                cart_items = CartItem.objects.filter(cart=cart, active=True)

                if cart_items.exists():
                    # Calculate total amount (add your actual calculation logic)
                    total_amount = sum(item.price for item in cart_items)
                    cart_payment.total_amount = total_amount  # Set the total amount
                    cart_payment.save()  # Save the payment information

                    # Associate cart items with the CartPayment instance
                    cart_payment.cart_items.add(*cart_items)  # Add cart items in bulk

                    # Save the many-to-many relationships
                    form.save_m2m()

                    # Mark the cart as completed
                    cart.is_completed = True  # Assuming you have a field in Cart to mark it completed
                    cart.save()

                    # Mark all cart items as inactive (or delete them to clear the cart)
                    cart_items.update(active=False)  # Mark all cart items as inactive

                    # Clear the cart in session if you're using sessions
                    if 'cart_items' in request.session:
                        del request.session['cart_items']  # Empty the session cart

                    messages.success(request, 'Payment completed successfully! Your cart is now empty.')
                    return redirect('user_cart_orders')  # Redirect to order history or a success page
                else:
                    messages.warning(request, "Your cart is empty.")
                    return redirect('cart')  # Redirect back to cart if there are no items

            except Exception as e:
                messages.error(request, f"An error occurred: {str(e)}")
                return redirect('cart')  # Redirect to the cart view on error

        else:
            messages.error(request, "There was an error with your payment form.")
    else:
        # Handle GET request to prepopulate the form with the user's address from Profile
        try:
            profile = Profile.objects.get(user=request.user)  # Get the user's profile
            initial_data = {
                'address': profile.address  # Prepopulate the address from the user's profile
            }
        except Profile.DoesNotExist:
            initial_data = {}  # If profile doesn't exist, leave the address field blank

        form = CartPaymentForm(initial=initial_data)

    # Render the cart page with the form
    return render(request, 'pages/cart.html', {'form': form})

# USER ORDERS
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import CartPayment


@login_required

def user_cart_orders(request):
    # Fetch all payments for the logged-in user
    payments = CartPayment.objects.filter(user=request.user).order_by('-created_at')

    # Fetch all related cart items and subscriptions for each payment
    payment_data = []
    for payment in payments:
        # Fetch CartItems through the Many-to-Many relationship on CartPayment
        cart_items = payment.cart_items.all()  # Assuming cart_items is a ManyToManyField

        # Fetch Subscription items associated with the user
        subscriptions = Subscription.objects.filter(user=request.user)

        # Collect data for each payment, cart items, and subscriptions
        payment_data.append({
            'payment': payment,
            'cart_items': cart_items,  # Cart items directly from the Many-to-Many field
            'subscriptions': subscriptions,  # All subscriptions for the user
            'cart_payment_id': payment.id
        })

    # Render the data to the template
    return render(request, 'pages/user_cart_orders.html', {'payment_data': payment_data})


# Contact_us

from django.shortcuts import render, redirect
from django.contrib import messages
from .forms import ContactForm

def contact_us(request):
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            contact = form.save(commit=False)
            contact.user = request.user
            contact.save()
            messages.success(request, 'Your message has been sent successfully!')
            return redirect('menu')
    else:
        form = ContactForm()
    return render(request, 'pages/contact_us.html', {'form': form,'user':request.user})


# ADDRESS UPDATE FORM

from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .models import Profile
from .forms import AddressUpdateForm

@login_required
def update_address(request):
    profile = Profile.objects.get(user=request.user)  # Get the current user's profile
    if request.method == 'POST':
        form = AddressUpdateForm(request.POST, instance=profile)
        if form.is_valid():
            form.save()  # Save the updated address
            return redirect('cart')  # Redirect to a success page or another view
    else:
        form = AddressUpdateForm(instance=profile)  # Populate the form with the current address

    return render(request, 'pages/update_address.html', {'form': form})




from django.shortcuts import render, redirect
from .models import WeeklyMenuPlan, WeeklyMealSelection, DeliveryAddress
from django.db.models import Sum
from django.contrib.auth.decorators import login_required
from django.utils.dateformat import DateFormat
import json
import razorpay
import string
import random
from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.utils.dateformat import DateFormat
from django.db.models import Sum


# Unique ID Generator (same as model-level one)
def generate_order_id():
    chars = string.ascii_uppercase + string.digits
    while True:
        code = ''.join(random.choices(chars, k=6))
        if not WeeklyMealSelection.objects.filter(custom_order_id=code).exists():
            return code

@login_required
def pay_now(request):
    user = request.user
    data_type = request.GET.get('type', 'plan')  # 'plan' or 'selection'
    plans = []
    total_price = 0
    date_range = ""

    # ✅ Always calculate both prices
    menuplan_price = WeeklyMenuPlan.objects.filter(user=user).aggregate(total=Sum('total_price'))['total'] or 0
    selection_price = WeeklyMealSelection.objects.filter(user=user).aggregate(total=Sum('total_price'))['total'] or 0

    if data_type == 'plan':
        records = WeeklyMenuPlan.objects.filter(user=user)
        if records.exists():
            from_date = records.first().from_date
            to_date = records.first().to_date
            total_price = menuplan_price

            for day in ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']:
                record = records.filter(day=day).first()
                if record:
                    plans.append({
                        'day': day.capitalize(),
                        'breakfast': ', '.join([item.item_name for item in record.breakfast_items.all()]),
                        'lunch': ', '.join([item.item_name for item in record.lunch_items.all()]),
                        'dinner': ', '.join([item.item_name for item in record.dinner_items.all()]),
                    })
            if from_date and to_date:
                date_range = f"{DateFormat(from_date).format('d M Y')} – {DateFormat(to_date).format('d M Y')}"

    elif data_type == 'selection':
        records = WeeklyMealSelection.objects.filter(user=user)
        if records.exists():
            from_date = records.first().from_date
            to_date = records.first().to_date
            total_price = selection_price

            days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            meal_types = ['breakfast', 'lunch', 'dinner']
            plan_dict = {day: {meal: '' for meal in meal_types} for day in days}

            for sel in records:
                items = ', '.join([i.item_name for i in sel.selected_items.all()])
                plan_dict[sel.day][sel.meal_type] = items

            for day in days:
                plans.append({
                    'day': day.capitalize(),
                    'breakfast': plan_dict[day]['breakfast'] or 'No items selected',
                    'lunch': plan_dict[day]['lunch'] or 'No items selected',
                    'dinner': plan_dict[day]['dinner'] or 'No items selected',
                })
            if from_date and to_date:
                date_range = f"{DateFormat(from_date).format('d M Y')} – {DateFormat(to_date).format('d M Y')}"

    # Handle address submission
    if request.method == "POST":
        DeliveryAddress.objects.create(
            user=user,
            flat_number=request.POST.get('flat_number'),
            street=request.POST.get('street'),
            landmark=request.POST.get('landmark'),
            address_type=request.POST.get('address_type', 'Home'),
            preferred_time=request.POST.get('delivery_time'),
            alt_mobile=request.POST.get('alt_mobile')
        )
        return redirect('pages/payment_success')

    return render(request, 'pages/pay_now.html', {
        'plans': plans,
        'total_price': total_price,  # context-sensitive price
        'menuplan_price': menuplan_price,  # always available
        'selection_price': selection_price,  # always available
        'date_range': date_range,
        'data_type': data_type
    })


from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import DeliveryAddress

@csrf_exempt
@login_required
def save_delivery_address(request):
    if request.method == "POST":
        try:
            DeliveryAddress.objects.create(
                user=request.user,
                flat_number=request.POST.get('flat_number', '').strip(),
                street=request.POST.get('street', '').strip(),
                landmark=request.POST.get('landmark', '').strip(),
                alt_mobile=request.POST.get('alt_mobile', '').strip(),

                breakfast_time=request.POST.get('breakfast_time') or None,
                breakfast_address_type=request.POST.get('breakfast_address_type') or 'Home',

                lunch_time=request.POST.get('lunch_time') or None,
                lunch_address_type=request.POST.get('lunch_address_type') or 'Home',

                dinner_time=request.POST.get('dinner_time') or None,
                dinner_address_type=request.POST.get('dinner_address_type') or 'Home',
            )
            return JsonResponse({"status": "success"})
        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": f"Failed to save address: {str(e)}"
            })

    return JsonResponse({"status": "error", "message": "Invalid request method"})


# views.py

import razorpay
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from .models import WeeklyMenuPlan, WeeklyMealSelection
from django.db.models import Sum

@csrf_exempt
@login_required
def create_razorpay_order(request):
    if request.method == "POST":
        data_type = request.POST.get('type')  # 'plan' or 'selection'
        user = request.user

        # Get total price based on type
        if data_type == 'plan':
            amount = WeeklyMenuPlan.objects.filter(user=user).aggregate(total=Sum('total_price'))['total'] or 0
        elif data_type == 'selection':
            amount = WeeklyMealSelection.objects.filter(user=user).aggregate(total=Sum('total_price'))['total'] or 0
        else:
            return JsonResponse({'status': 'error', 'message': 'Invalid type selected'}, status=400)

        if amount <= 0:
            return JsonResponse({'status': 'error', 'message': 'Amount must be greater than zero'}, status=400)

        # Convert amount to paise (Razorpay accepts in paise)
        amount_in_paise = int(float(amount) * 100)

        # Initialize Razorpay client
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

        # Create order
        payment = client.order.create({
            'amount': amount_in_paise,
            'currency': 'INR',
            'payment_capture': 1
        })

        return JsonResponse({
            'status': 'success',
            'order_id': payment['id'],
            'amount': amount_in_paise,
            'currency': 'INR',
            'key_id': settings.RAZORPAY_KEY_ID
        })
    else:
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)



import json
import razorpay
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.conf import settings
from .models import RazorpayTransaction, WeeklyMealSelection
from .models import generate_order_id  # Import the order ID generator
from .models import RazorpayTransaction, WeeklyMealSelection, WeeklyMenuPlan, generate_order_id, generate_plan_order_id

@csrf_exempt
def razorpay_success(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            # Verify Razorpay signature
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
            client.utility.verify_payment_signature({
                'razorpay_order_id': data['razorpay_order_id'],
                'razorpay_payment_id': data['razorpay_payment_id'],
                'razorpay_signature': data['razorpay_signature']
            })

            # Save transaction and assign custom_order_id
            if request.user.is_authenticated:
                RazorpayTransaction.objects.create(
                    user=request.user,
                    transaction_id=data['razorpay_payment_id'],
                    order_id=data['razorpay_order_id'],
                    payment_id=data['razorpay_payment_id'],
                    signature=data['razorpay_signature']
                )

                # ✅ Assign custom_order_id to user's meal selections
                selections = WeeklyMealSelection.objects.filter(user=request.user, custom_order_id__isnull=True)
                for selection in selections:
                    selection.custom_order_id = generate_order_id()
                    selection.save()

                plans = WeeklyMenuPlan.objects.filter(user=request.user, plan_order_id__isnull=True)
                for plan in plans:
                    plan.plan_order_id = generate_plan_order_id()
                    plan.save()

            return JsonResponse({'status': 'success'})

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)


from django.shortcuts import render, redirect
from .models import DeliveryAddress, RazorpayTransaction  # use your actual transaction model if different
from django.shortcuts import render, redirect
from .models import DeliveryAddress, RazorpayTransaction, WeeklyMealSelection




from django.db.models import Sum

def thank_you(request):
    user = request.user

    if not user.is_authenticated:
        return redirect('login')

    try:
        address = DeliveryAddress.objects.filter(user=user).latest('id')
    except DeliveryAddress.DoesNotExist:
        address = None

    try:
        transaction = RazorpayTransaction.objects.filter(user=user).latest('id')
        transaction_id = transaction.transaction_id
    except RazorpayTransaction.DoesNotExist:
        transaction_id = 'Not Available'

    # Check if user paid for Meal Plan
    try:
        latest_plan = WeeklyMenuPlan.objects.filter(user=user).exclude(plan_order_id__isnull=True).latest('id')
        plan_order_id = latest_plan.plan_order_id
        menuplan_price = WeeklyMenuPlan.objects.filter(user=user).aggregate(total=Sum('total_price'))['total'] or 0

        show_plan = True
        show_selection = False
    except WeeklyMenuPlan.DoesNotExist:
        plan_order_id = 'Not Available'
        menuplan_price = 0
        show_plan = False

        # Check if it's a WeeklyMealSelection payment instead
        try:
            latest_order = WeeklyMealSelection.objects.filter(user=user).exclude(custom_order_id__isnull=True).latest('id')
            custom_order_id = latest_order.custom_order_id
            selection_total = WeeklyMealSelection.objects.filter(user=user).aggregate(total=Sum('total_price'))['total'] or 0

            show_selection = True
        except WeeklyMealSelection.DoesNotExist:
            custom_order_id = 'Not Available'
            selection_total = 0
            show_selection = False

    context = {
        'address': address,
        'transaction_id': transaction_id,
        'plan_order_id': plan_order_id,
        'menuplan_price': menuplan_price,
        'custom_order_id': custom_order_id if show_selection else None,
        'selection_total': selection_total if show_selection else None,
        'show_plan': show_plan,
        'show_selection': show_selection,
    }

    return render(request, 'pages/thank_you.html', context)






from django.shortcuts import render, redirect
from django.contrib import messages
from .models import Profile, StoreAdmin

def adminhome(request):
    profiles = Profile.objects.select_related('user').all()
    return render(request, 'pages/adminhome.html', {'profiles': profiles})

def add_storeadmin_backend(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        mobile = request.POST.get('mobile')
        email = request.POST.get('email')

        # Check for duplicates
        if StoreAdmin.objects.filter(email=email).exists():
            messages.error(request, "Email already exists.")
        elif StoreAdmin.objects.filter(mobile=mobile).exists():
            messages.error(request, "Mobile number already exists.")
        else:
            StoreAdmin.objects.create(name=name, mobile=mobile, email=email)
            messages.success(request, "Store Admin added successfully!")

    return redirect('adminhome')



def storeadmin_list(request):
    store_admins = StoreAdmin.objects.all()
    return render(request, 'pages/storeadmin_list.html', {'store_admins': store_admins})

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.views.decorators.http import require_POST
from .models import StoreAdmin

@require_POST
def approve_storeadmin(request, pk):
    admin = get_object_or_404(StoreAdmin, pk=pk)
    admin.is_approved = True
    admin.is_active = True
    admin.save()
    messages.success(request, f"Store admin '{admin.name}' approved successfully.")
    return redirect('storeadmin_list')


@require_POST
def deactivate_storeadmin(request, pk):
    admin = get_object_or_404(StoreAdmin, pk=pk)
    admin.is_active = False
    admin.save()
    messages.warning(request, f"Store admin '{admin.name}' has been deactivated.")
    return redirect('storeadmin_list')


@require_POST
def remove_storeadmin(request, pk):
    admin = get_object_or_404(StoreAdmin, pk=pk)
    admin.delete()
    messages.error(request, f"Store admin '{admin.name}' has been removed.")
    return redirect('storeadmin_list')


from django.shortcuts import render
from .models import Payment

def admin_cartpayments(request):
    payments = Payment.objects.select_related('user', 'subscription').all()
    return render(request, 'pages/admin_cartpayments.html', {'payments': payments})




from django.shortcuts import render, redirect
from .models import Food
from .forms import FoodForm

def add_food(request):
    if request.method == 'POST':
        form = FoodForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('add_food')  # Redirect to same page after successful save
    else:
        form = FoodForm()

    return render(request, 'pages/add_food.html', {'form': form})


from django.shortcuts import render
from .models import Subscription

def all_subscriptions(request):
    subscriptions = Subscription.objects.all()
    return render(request, 'all_subscriptions.html', {'subscriptions': subscriptions})




from django.shortcuts import render
from .models import CartPayment

def admin_payment(request):
    payments = CartPayment.objects.all().order_by('-created_at')  # Latest first
    return render(request, 'pages/admin_payment.html', {'payments': payments})


# views.py
from django.shortcuts import render
from .models import Contact

def admin_contact(request):
    contacts = Contact.objects.all().order_by('-created_at')  # latest first
    return render(request, 'pages/admin_contact.html', {'contacts': contacts})


from django.http import HttpResponse
from django.template.loader import get_template
from xhtml2pdf import pisa
from django.utils.timezone import now
from .models import Profile

def download_users_pdf(request):
    profiles = Profile.objects.select_related('user').all()
    template_path = 'pages/users_pdf_template.html'
    context = {
        'profiles': profiles,
        'now': now(),
    }

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="registered_users_report.pdf"'

    template = get_template(template_path)
    html = template.render(context)

    pisa_status = pisa.CreatePDF(html, dest=response)

    if pisa_status.err:
        return HttpResponse('Error generating PDF', status=500)

    return response




from django.http import HttpResponse
from django.template.loader import get_template
from xhtml2pdf import pisa
from .models import CartPayment

def cart_payment_pdf(request):
    # Only use related fields you actually have
    payments = CartPayment.objects.select_related('user', 'cart').all().prefetch_related('subscription_items')

    template_path = 'pages/cart_payment_pdf.html'
    template = get_template(template_path)

    context = {'payments': payments}

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="cart_payment_report.pdf"'

    html = template.render(context)
    pisa_status = pisa.CreatePDF(html, dest=response)

    if pisa_status.err:
        return HttpResponse('Error generating PDF', status=500)
    return response



from django.http import HttpResponse
from django.template.loader import get_template
from xhtml2pdf import pisa
from .models import Subscription
from django.http import HttpResponse
from django.template.loader import get_template
from xhtml2pdf import pisa
from .models import Subscription

def subscription_report_pdf(request):
    subscriptions = Subscription.objects.select_related('user').all()
    template_path = 'pages/subscription_report_pdf.html'
    context = {'subscriptions': subscriptions}

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="subscriptions_report.pdf"'

    template = get_template(template_path)
    html = template.render(context)
    pisa_status = pisa.CreatePDF(html, dest=response)

    if pisa_status.err:
        return HttpResponse('Error generating PDF', status=500)
    return response


from django.http import HttpResponse
from django.template.loader import get_template
from xhtml2pdf import pisa
from .models import CartPayment

def cartpayments_report_pdf(request):
    payments = CartPayment.objects.select_related('user').all()
    template_path = 'pages/cartpayments_report_pdf.html'
    context = {'payments': payments}

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="cartpayments_report.pdf"'

    template = get_template(template_path)
    html = template.render(context)
    pisa_status = pisa.CreatePDF(html, dest=response)

    if pisa_status.err:
        return HttpResponse('Error generating PDF', status=500)
    return response




from django.http import HttpResponse
from django.template.loader import get_template
from xhtml2pdf import pisa
from .models import Contact

def contact_report_pdf(request):
    contacts = Contact.objects.select_related('user').all()
    template_path = 'pages/contact_report_pdf.html'
    context = {'contacts': contacts}

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="contact_report.pdf"'

    template = get_template(template_path)
    html = template.render(context)
    pisa_status = pisa.CreatePDF(html, dest=response)

    if pisa_status.err:
        return HttpResponse('Error generating PDF', status=500)
    return response



from django.shortcuts import render, redirect
from django.contrib import messages

# Step 1: Admin login view with hardcoded credentials
def admin_login(request):
    ADMIN_USERNAME = 'admin'
    ADMIN_PASSWORD = 'admin@1234'

    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            request.session['is_admin'] = True  # Set session flag
            return redirect('adminhome')
        else:
            messages.error(request, 'Invalid admin credentials.')
            return redirect('adminlogin')

    return render(request, 'pages/admin_login.html')






from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth.hashers import make_password

def forgot_password_view(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        try:
            user = User.objects.get(email=email)
            return redirect('reset_password', user_id=user.id)
        except User.DoesNotExist:
            messages.error(request, 'Email not found.')
            return redirect('forgot_password')
    return render(request, 'pages/forgot_password.html')


def reset_password_view(request, user_id):
    user = get_object_or_404(User, id=user_id)
    if request.method == 'POST':
        new_password = request.POST.get('new_password')
        confirm_password = request.POST.get('confirm_password')
        if new_password != confirm_password:
            messages.error(request, "Passwords do not match.")
            return redirect('reset_password', user_id=user.id)
        user.password = make_password(new_password)
        user.save()
        messages.success(request, "Password reset successfully. Please login.")
        return redirect('login')  # or your login page name
    return render(request, 'pages/reset_password.html', {'user': user})














# Resturent S

import requests
from django.shortcuts import render, redirect
from django.http import JsonResponse
from .models import StoreAdmin, NoKitchenMenu, NoKitchenCurries

API_KEY = "5a1df62d-601e-11f0-a562-0200cd936042"  # Your 2Factor API key

# Login Page
def add_restaurant(request):
    return render(request, 'pages/add_restaurant.html')

# Send OTP
def send_otp(request):
    if request.method == "POST":
        mobile = request.POST.get("mobile")
        try:
            admin = StoreAdmin.objects.get(mobile=mobile)
            if not admin.is_approved:
                return JsonResponse({'status': 'error', 'message': 'Admin not approved yet'})
            if not admin.is_active:
                return JsonResponse({'status': 'error', 'message': 'Admin is deactivated'})

            response = requests.get(f"https://2factor.in/API/V1/{API_KEY}/SMS/+91{mobile}/AUTOGEN")
            data = response.json()
            if data["Status"] == "Success":
                request.session['mobile'] = mobile
                request.session['session_id'] = data["Details"]
                return JsonResponse({'status': 'success'})
            else:
                return JsonResponse({'status': 'error', 'message': 'Failed to send OTP'})
        except StoreAdmin.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Mobile not registered'})
    return JsonResponse({'status': 'error', 'message': 'Invalid request'})

# Verify OTP
def verify_otp(request):
    if request.method == "POST":
        mobile = request.session.get("mobile")
        session_id = request.session.get("session_id")
        otp = request.POST.get("otp")

        if not (mobile and session_id and otp):
            return JsonResponse({'status': 'error', 'message': 'Session expired or missing data'})

        verify_url = f"https://2factor.in/API/V1/{API_KEY}/SMS/VERIFY/{session_id}/{otp}"
        response = requests.get(verify_url)
        data = response.json()

        if data["Status"] == "Success":
            admin = StoreAdmin.objects.get(mobile=mobile)
            request.session['store_admin_id'] = admin.id
            return JsonResponse({'status': 'success', 'redirect_url': '/nokitchen/restaurant_home/'})
        else:
            return JsonResponse({'status': 'error', 'message': 'Invalid OTP'})
    return JsonResponse({'status': 'error', 'message': 'Invalid request'})

# Restaurant Dashboard
def restaurant_home(request):
    if 'store_admin_id' not in request.session:
        return redirect('add_restaurant')

    day_labels = {
        'sunday': 'Sunday',
        'monday': 'Monday',
        'tuesday': 'Tuesday',
        'wednesday': 'Wednesday',
        'thursday': 'Thursday',
        'friday': 'Friday',
        'saturday': 'Saturday',
    }

    meal_types = ['breakfast', 'lunch', 'dinner']
    menu_items = NoKitchenMenu.objects.all().prefetch_related('curries')
    menu_with_curries = [{'item': item, 'curries': item.curries.all()} for item in menu_items]
    all_curries = NoKitchenCurries.objects.all()

    return render(request, 'pages/restaurant_home.html', {
        'day_labels': day_labels,
        'meal_types': meal_types,
        'menu_with_curries': menu_with_curries,
        'all_curries': all_curries,
        'menu_items': menu_items, 
    })

from django.http import JsonResponse
from .models import WeeklyMenuPlan, NoKitchenMenu
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.utils.dateparse import parse_date
from decimal import Decimal

@csrf_exempt
@login_required
def save_weekly_menu(request):
    if request.method == "POST":
        try:
            day = request.POST.get("day")
            from_date = parse_date(request.POST.get("from_date"))
            to_date = parse_date(request.POST.get("to_date"))
            rotation_number = int(request.POST.get("rotation_number", 1))

            if not (day and from_date and to_date):
                return JsonResponse({"status": "error", "message": "Required data missing."})

            # Delete existing plan if present
            WeeklyMenuPlan.objects.filter(
                day=day, rotation_number=rotation_number,
                user=request.user, from_date=from_date, to_date=to_date
            ).delete()

            # Create new plan (initially without total price)
            plan = WeeklyMenuPlan.objects.create(
                user=request.user,
                day=day,
                rotation_number=rotation_number,
                from_date=from_date,
                to_date=to_date
            )

            total_price = Decimal(0)

            for meal_type in ['breakfast', 'lunch', 'dinner']:
                selected_ids = request.POST.getlist(f"{day}_{meal_type}[]")
                items = NoKitchenMenu.objects.filter(id__in=selected_ids, meal_type=meal_type)

                # Add items to the respective field
                if meal_type == 'breakfast':
                    plan.breakfast_items.set(items)
                elif meal_type == 'lunch':
                    plan.lunch_items.set(items)
                elif meal_type == 'dinner':
                    plan.dinner_items.set(items)

                # Sum up price
                for item in items:
                    total_price += item.price  # Assuming NoKitchenMenu has a `price` field

            # Update total_price field
            plan.total_price = total_price
            plan.save()

            return JsonResponse({"status": "success", "message": f"{day.title()} menu saved!", "total_price": float(total_price)})

        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)})

    return JsonResponse({"status": "error", "message": "Invalid request."})

from django.contrib import messages
from django.shortcuts import redirect

def add_curry(request):
    if request.method == 'POST':
        curry_name = request.POST.get('curry_name')
        price = request.POST.get('price')
        quantity = request.POST.get('quantity')
        curry_type = request.POST.get('curry_type')
        image = request.FILES.get('image')

        # ✅ Create curry without linking to any menu item
        NoKitchenCurries.objects.create(
            curry_name=curry_name,
            price=price,
            quantity=quantity,
            curry_type=curry_type,
            image=image
        )

        messages.success(request, "✅ Curry added successfully!")
        return redirect('restaurant_menu')  # Replace with your actual view name



from django.shortcuts import redirect, get_object_or_404
from .models import NoKitchenCurries

def delete_curry_item(request, curry_id):
    curry = get_object_or_404(NoKitchenCurries, id=curry_id)
    curry.delete()
    return redirect('restaurant_home')

from django.shortcuts import render

def restaurant_update_profile(request):
    return render(request, 'pages/restaurant_update_profile.html')



from django.shortcuts import render
from django.http import JsonResponse
from .models import NoKitchenMenu
from django.views.decorators.csrf import csrf_exempt

from .models import NoKitchenMenu, NoKitchenCurries
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
from django.http import JsonResponse

@csrf_exempt
def restaurant_menu(request):
    if request.method == 'POST':
        # Handle Curry submission
        if request.POST.get('curry_name'):
            curry_name = request.POST.get('curry_name')
            curry_price = request.POST.get('curry_price')
            curry_type = request.POST.get('curry_type')

            # You can link to the latest created menu item or use a default
            latest_menu = NoKitchenMenu.objects.order_by('-created_at').first()

            if latest_menu:
                NoKitchenCurries.objects.create(
                    menu_item=latest_menu,
                    curry_type=curry_type,
                    curry_name=curry_name,
                    price=curry_price
                )
                return JsonResponse({'status': 'curry_saved'})
            else:
                return JsonResponse({'status': 'no_menu_item_found'})

        # Handle Menu item submission (existing code)
        meal_type = request.POST.get('meal_type')
        item_name = request.POST.get('item_name')
        price = request.POST.get('price')
        quantity = request.POST.get('quantity')
        description = request.POST.get('description')
        image = request.FILES.get('image')

        item = NoKitchenMenu.objects.create(
            meal_type=meal_type,
            item_name=item_name,
            price=price,
            quantity=quantity,
            description=description,
            image=image
        )

        return JsonResponse({'status': 'success'})

    return render(request, 'pages/restaurant_menu.html')


from django.shortcuts import get_object_or_404, redirect
from django.contrib import messages
from .models import NoKitchenMenu

def delete_menu_item(request, item_id):
    item = get_object_or_404(NoKitchenMenu, id=item_id)
    item.delete()
    messages.success(request, f"'{item.item_name}' deleted successfully.")
    return redirect('restaurant_home')  # Use your actual menu listing view name





from django.shortcuts import render
from .models import (
    WeeklyMenuPlan, WeeklyMealSelection, CustomMealPlan, 
    CustomMealItem, SkippedMeal, FinalMealOrder
)
from django.contrib.auth.decorators import login_required

from django.shortcuts import render, get_object_or_404
from .models import WeeklyMenuPlan, WeeklyMealSelection, CustomMealPlan, FinalMealOrder
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import FinalMealOrder, WeeklyMenuPlan, WeeklyMealSelection, CustomMealPlan

@login_required
def resturent_track_order(request):
    final_orders = FinalMealOrder.objects.select_related('user').order_by('-created_at')
    order_map = {order.user_id: order.order_id for order in final_orders}

    weekly_menus = WeeklyMenuPlan.objects.select_related('user').all()
    meal_selections = WeeklyMealSelection.objects.select_related('user').all()
    custom_plans = CustomMealPlan.objects.select_related('user', 'base_meal').all()

    for wm in weekly_menus:
        wm.order_id = order_map.get(wm.user_id)

    for ms in meal_selections:
        ms.order_id = order_map.get(ms.user_id)

    for cp in custom_plans:
        cp.order_id = order_map.get(cp.user_id)

    context = {
        'final_orders': final_orders,
        'weekly_menus': weekly_menus,
        'meal_selections': meal_selections,
        'custom_plans': custom_plans,
    }
    return render(request, 'pages/resturent_track_order.html', context)



from django.shortcuts import get_object_or_404, render
from django.contrib.auth.decorators import login_required
from .models import FinalMealOrder, WeeklyMenuPlan, CustomMealPlan, WeeklyMealSelection, DeliveryAddress
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import FinalMealOrder, WeeklyMenuPlan, CustomMealPlan, WeeklyMealSelection
from django.http import HttpResponseBadRequest

@login_required
def view_order_details(request, order_type, order_id):
    user = request.user

    order = None
    weekly_menus = []
    custom_plans = []
    meal_selections = []

    # Delivery info for final orders
    flat_number = street = landmark = None
    alt_mobile = breakfast_time = lunch_time = dinner_time = None
    breakfast_address_type = lunch_address_type = dinner_address_type = None

    if order_type == 'final':
        order = get_object_or_404(FinalMealOrder, order_id=order_id, user=user)
        weekly_menus = WeeklyMenuPlan.objects.filter(user=user, plan_order_id=order_id)
        custom_plans = CustomMealPlan.objects.filter(user=user, custom_order_id=order_id)
        meal_selections = WeeklyMealSelection.objects.filter(user=user, custom_order_id=order_id)

        flat_number = order.flat_number
        street = order.street
        landmark = order.landmark
        alt_mobile = order.alt_mobile
        breakfast_time = order.breakfast_time
        lunch_time = order.lunch_time
        dinner_time = order.dinner_time
        breakfast_address_type = order.breakfast_address_type
        lunch_address_type = order.lunch_address_type
        dinner_address_type = order.dinner_address_type

    elif order_type == 'meal':
        order = get_object_or_404(WeeklyMenuPlan, plan_order_id=order_id, user=user)
        weekly_menus = [order]

    elif order_type == 'custom':
        order = get_object_or_404(CustomMealPlan, custom_order_id=order_id, user=user)
        custom_plans = [order]

    elif order_type == 'selection':
        order = get_object_or_404(WeeklyMealSelection, custom_selection_id=order_id, user=user)
        meal_selections = [order]

    else:
        return HttpResponseBadRequest("Invalid order type.")

    context = {
        'order_type': order_type,
        'order': order,
        'weekly_menus': weekly_menus,
        'custom_plans': custom_plans,
        'meal_selections': meal_selections,

        'flat_number': flat_number,
        'street': street,
        'landmark': landmark,
        'alt_mobile': alt_mobile,
        'breakfast_time': breakfast_time,
        'lunch_time': lunch_time,
        'dinner_time': dinner_time,
        'breakfast_address_type': breakfast_address_type,
        'lunch_address_type': lunch_address_type,
        'dinner_address_type': dinner_address_type,
    }

    return render(request, 'pages/order_details.html', context)



# kitchen_app/views.py
# views.py
# views.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from datetime import date
from .models import WeeklyMealSelection, WeeklyMenuPlan, CustomMealPlan, FinalMealOrder

from rest_framework.decorators import api_view
from rest_framework.response import Response
from datetime import date
from rest_framework.decorators import api_view
from rest_framework.response import Response
from datetime import date
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.contenttypes.models import ContentType
from datetime import date

from .models import (
    WeeklyMealSelection, WeeklyMenuPlan, CustomMealPlan, FinalMealOrder,
    PreparationStatus, DeliveryAddress
)

@api_view(['GET'])
def today_meals_api(request):
    today = date.today()
    today_day = today.strftime('%A').lower()
    meal_types = ['breakfast', 'lunch', 'dinner']
    data = {meal: [] for meal in meal_types}

    def get_delivery_info(user, meal_type):
        try:
            delivery = DeliveryAddress.objects.filter(user=user).latest('id')
            time = getattr(delivery, f"{meal_type}_time", None)
            address = f"{delivery.flat_number}, {delivery.street}"
            return (str(time) if time else 'N/A', address)
        except DeliveryAddress.DoesNotExist:
            return ('N/A', 'N/A')

    def get_order_status(model_name, obj_id, meal_type):
        try:
            content_type = ContentType.objects.get(model=model_name.lower())
            status_obj = PreparationStatus.objects.get(
                content_type=content_type,
                object_id=obj_id,
                meal_type=meal_type,
                date=today
            )
            return status_obj.status
        except PreparationStatus.DoesNotExist:
            return "queued"

    selections = WeeklyMealSelection.objects.filter(from_date__lte=today, to_date__gte=today, day=today_day)
    for sel in selections:
        selected_items = ', '.join([item.item_name for item in sel.selected_items.all()])
        time, address = get_delivery_info(sel.user, sel.meal_type)
        data[sel.meal_type].append({
            'user': sel.user.username if sel.user else '',
            'order_id': sel.custom_order_id,
            'source': 'WeeklyMealSelection',
            'day': sel.day,
            'meal_description': selected_items or 'N/A',
            'items_count': sel.selected_items.count(),
            'delivery_time': time,
            'address': address,
            'price': float(sel.total_price),
            'status': get_order_status('WeeklyMealSelection', sel.id, sel.meal_type),
        })

    plans = WeeklyMenuPlan.objects.filter(from_date__lte=today, to_date__gte=today, day=today_day)
    for plan in plans:
        for meal_type in meal_types:
            items = getattr(plan, f"{meal_type}_items").all()
            if items.exists():
                time, address = get_delivery_info(plan.user, meal_type)
                item_names = ', '.join([item.item_name for item in items])
                data[meal_type].append({
                    'user': plan.user.username if plan.user else '',
                    'order_id': plan.plan_order_id,
                    'source': 'WeeklyMenuPlan',
                    'day': plan.day,
                    'meal_description': item_names or 'N/A',
                    'items_count': items.count(),
                    'delivery_time': time,
                    'address': address,
                    'price': float(plan.total_price or 0),
                    'status': get_order_status('WeeklyMenuPlan', plan.id, meal_type),
                })

    customs = CustomMealPlan.objects.filter(start_date__lte=today, end_date__gte=today)
    for custom in customs:
        for meal_type in meal_types:
            meal_content = getattr(custom, meal_type, None)
            if meal_content and today_day in meal_content.lower():
                time, address = get_delivery_info(custom.user, meal_type)
                data[meal_type].append({
                    'user': custom.user.username,
                    'order_id': custom.custom_order_id,
                    'source': 'CustomMealPlan',
                    'day': today_day,
                    'meal_description': meal_content or 'N/A',
                    'items_count': 1,
                    'delivery_time': time,
                    'address': address,
                    'price': float(custom.total_price),
                    'status': get_order_status('CustomMealPlan', custom.id, meal_type),
                })

    finals = FinalMealOrder.objects.filter(start_date__lte=today, end_date__gte=today)
    for order in finals:
        for meal_type in meal_types:
            delivery_time = getattr(order, f"{meal_type}_time", None)
            try:
                delivery = DeliveryAddress.objects.filter(user=order.user).latest('id')
                address = f"{delivery.flat_number}, {delivery.street}"
            except DeliveryAddress.DoesNotExist:
                address = 'N/A'
            data[meal_type].append({
                'user': order.user.username,
                'order_id': order.order_id,
                'source': 'FinalMealOrder',
                'day': today_day,
                'meal_description': order.ordered_items,
                'items_count': len(order.ordered_items.split(',')) if order.ordered_items else 0,
                'delivery_time': str(delivery_time) if delivery_time else 'N/A',
                'address': address,
                'price': float(order.total_amount),
                'status': get_order_status('FinalMealOrder', order.id, meal_type),
            })

    return Response(data)


# Template view
from django.shortcuts import render

def today_orders_api_template(request):
    return render(request, 'pages/today_orders_api.html')


from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.contenttypes.models import ContentType
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.contenttypes.models import ContentType
from datetime import date, datetime
from .models import (
    WeeklyMealSelection, WeeklyMenuPlan, CustomMealPlan, FinalMealOrder,
    PreparationStatus
)

@api_view(['POST'])
def update_order_status(request):
    data = request.data
    model_name = data.get('source')
    order_id = data.get('order_id')
    meal_type = data.get('meal_type')
    status = data.get('status')

    print("🟡 Received data:", data)

    try:
        if not all([model_name, order_id, meal_type, status]):
            return Response({'success': False, 'error': 'Missing data'})

        # Get the object based on model name
        if model_name == 'WeeklyMealSelection':
            obj = WeeklyMealSelection.objects.get(custom_order_id=order_id)
        elif model_name == 'WeeklyMenuPlan':
            obj = WeeklyMenuPlan.objects.get(plan_order_id=order_id)
        elif model_name == 'CustomMealPlan':
            obj = CustomMealPlan.objects.get(custom_order_id=order_id)
        elif model_name == 'FinalMealOrder':
            obj = FinalMealOrder.objects.get(order_id=order_id)
        else:
            return Response({'success': False, 'error': 'Invalid model name'})

        content_type = ContentType.objects.get_for_model(obj.__class__)

        # ✅ Now add 'time' explicitly to satisfy model constraint
        PreparationStatus.objects.update_or_create(
            content_type=content_type,
            object_id=obj.id,
            meal_type=meal_type,
            date=date.today(),
            defaults={
                'status': status,
                'time': datetime.now().time(),  # ✅ FIX: time is required
            }
        )

        print("✅ Status updated successfully.")
        return Response({'success': True, 'message': 'Status updated'})

    except Exception as e:
        print("❌ Backend exception:", str(e))
        return Response({'success': False, 'error': str(e)})



@api_view(['GET'])
def live_summary(request):
    today = date.today()
    statuses = PreparationStatus.objects.filter(date=today)
    summary = {
        'total_orders': statuses.count(),
        'preparing': statuses.filter(status='preparing').count(),
        'ready': statuses.filter(status='ready').count(),
        'dispatched': statuses.filter(status='dispatched').count(),
    }
    return Response(summary)


def restaurant_earnings(request):
    return render(request, 'pages/restaurant_earnings.html')




# views.py
from django.shortcuts import render

def landing_page(request):
    return render(request, 'pages/landing_page.html')




# delviery person

from django.shortcuts import render, redirect

def delivery_register(request):
    if request.method == 'POST':
        # Save Step 1 data to session
        request.session['delivery_data'] = {
            'first_name': request.POST.get('first_name'),
            'last_name': request.POST.get('last_name'),
            'email': request.POST.get('email'),
            'mobile': request.POST.get('mobile')
        }
        return redirect('delivery_agentstep1')
    
    return render(request, 'pages/delivery_register.html')


# views.py
from django.shortcuts import render

from django.core.files.storage import FileSystemStorage
from .models import DeliveryPartner
from django.shortcuts import render, redirect
from .models import DeliveryPartner

def delivery_agentstep1(request):
    if request.method == 'POST':
        data = request.session.get('delivery_data')
        if not data:
            return redirect('delivery_register')

        pan_card_image = request.FILES.get('pan_card_image')
        aadhar_file = request.FILES.get('aadhar_card_image')
        selfie = request.FILES.get('selfie_image')

        DeliveryPartner.objects.create(
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'],
            mobile=data['mobile'],
            pan_number=request.POST.get('pan_number'),
            pan_card_image=pan_card_image,
            aadhar_number=request.POST.get('aadhar_number'),
            aadhar_file=aadhar_file,
            location=request.POST.get('location'),
            selfie=selfie
        )

        request.session.pop('delivery_data', None)

        # ✅ Redirect to step 2 page
        return redirect('delivery_agentstep2')

    return render(request, 'pages/delivery_agentstep1.html')


from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings
from django.core.cache import cache
import requests

from .models import DeliveryPartner

def delivery_agentstep2(request):
    return render(request, 'pages/delivery_agentstep2.html')




# views.py
import requests
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.core.cache import cache  # ✅ add this at top if not already imported

@csrf_exempt
def send_otp(request):
    if request.method == "POST":
        data = json.loads(request.body)
        mobile = data.get("mobile")

        if not mobile:
            return JsonResponse({"success": False, "message": "Mobile number is required."})

        if not DeliveryPartner.objects.filter(mobile=mobile).exists():
            return JsonResponse({"success": False, "message": "Mobile number not registered."})

        api_key = settings.TWO_FACTOR_API_KEY
        url = f"https://2factor.in/API/V1/{api_key}/SMS/{mobile}/AUTOGEN"

        try:
            response = requests.get(url)
            result = response.json()

            if result.get("Status") == "Success":
                session_id = result.get("Details")

                # ✅ Store mobile number in cache against session_id for 5 mins
                cache.set(session_id, mobile, timeout=300)  # 5 minutes

                return JsonResponse({"success": True, "session_id": session_id})
            else:
                return JsonResponse({"success": False, "message": result.get("Details", "Failed to send OTP")})
        except Exception as e:
            return JsonResponse({"success": False, "message": str(e)})


@csrf_exempt
def verify_otp(request):
    if request.method == "POST":
        data = json.loads(request.body)
        session_id = data.get("session_id")
        otp_entered = data.get("otp")

        if not session_id or not otp_entered:
            return JsonResponse({"success": False, "message": "Session ID and OTP are required."})

        api_key = settings.TWO_FACTOR_API_KEY
        url = f"https://2factor.in/API/V1/{api_key}/SMS/VERIFY/{session_id}/{otp_entered}"

        try:
            response = requests.get(url)
            result = response.json()

            if result.get("Status") == "Success":
                # ✅ Save delivery partner in session
                mobile = cache.get(session_id)
                if not mobile:
                    return JsonResponse({"success": False, "message": "Session expired."})

                try:
                    partner = DeliveryPartner.objects.get(mobile=mobile)
                    request.session['delivery_partner_id'] = partner.id
                    return JsonResponse({"success": True, "message": "OTP verified and login successful!"})
                except DeliveryPartner.DoesNotExist:
                    return JsonResponse({"success": False, "message": "Partner not found."})

            return JsonResponse({"success": False, "message": "Invalid OTP"})
        except Exception as e:
            return JsonResponse({"success": False, "message": str(e)})




# views.py
from django.shortcuts import render, redirect
from .models import DeliveryPartner

def delivery_dashboard(request):
    partner_id = request.session.get('delivery_partner_id')

    if not partner_id:
        return redirect('delivery_agentstep2')  # or your login page

    try:
        partner = DeliveryPartner.objects.get(id=partner_id)
    except DeliveryPartner.DoesNotExist:
        return redirect('delivery_agentstep2')

    return render(request, 'pages/delivery_dashboard.html', {
        'partner': partner
    })


from django.shortcuts import render



def delivery_myearnings(request):
    return render(request, 'pages/delivery_myearnings.html')

def delivery_myorders(request):
    return render(request, 'pages/delivery_myorders.html')

def delivery_profile(request):
    return render(request, 'pages/delivery_profile.html')







#Store add details in feature like open and close
# views.py
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .models import StoreLocation

@login_required
def manage_stores(request):
    locations = StoreLocation.objects.all().order_by('-created_at')
    return render(request, 'pages/manage_stores.html', {'locations': locations})


@login_required
def add_store_location(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        latitude = request.POST.get('latitude')
        longitude = request.POST.get('longitude')
        is_active = request.POST.get('is_active') == 'on'

        if name and latitude and longitude:
            StoreLocation.objects.create(
                name=name,
                latitude=latitude,
                longitude=longitude,
                is_active=is_active
            )
            messages.success(request, "Store location added successfully.")
        else:
            messages.error(request, "All fields are required.")

    return redirect('manage_stores')


@login_required
def edit_store_location(request, store_id):
    location = get_object_or_404(StoreLocation, id=store_id)

    if request.method == 'POST':
        location.name = request.POST.get('name')
        location.latitude = request.POST.get('latitude')
        location.longitude = request.POST.get('longitude')
        is_active = request.POST.get('is_active')
        location.is_active = True if is_active == 'True' else False

        location.save()
        messages.success(request, "Store location updated successfully.")
    
    return redirect('manage_stores')


@login_required
def delete_store_location(request, store_id):
    location = get_object_or_404(StoreLocation, id=store_id)
    location.delete()
    messages.success(request, "Store location deleted.")
    return redirect('manage_stores')
