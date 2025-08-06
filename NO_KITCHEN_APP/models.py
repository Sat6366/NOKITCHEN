from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.validators import RegexValidator

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    
    mobile_number = models.CharField(
        max_length=10,
        validators=[RegexValidator(regex=r'^\d{10}$', message="Mobile number must be 10 digits.")]
    )
    address = models.CharField(max_length=255, blank=True, null=True)
    pincode = models.CharField(max_length=6, blank=True, null=True)

    def __str__(self):
        return self.user.username

# Signal Handlers
@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
    else:
        instance.profile.save()









# Create your models here.
from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator 
from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator

class Food(models.Model):
    cat_choice = (
        ("Chinese", "Chinese"),
        ("Indian", "Indian"),
        ("Desserts", "Desserts"),
        ("Japanese", "Japanese"),
        ("Chat", "Chat"),
        ("Drinks", "Drinks"),
        ("Fast Food", "Fast Food"),
    )
    
    MEAL_TYPE_CHOICES = (
        ('breakfast', 'Breakfast'),
        ('lunch', 'Lunch'),
        ('dinner', 'Dinner'),
    )
    
    ORDER_TYPE_CHOICES = (
        ('online', 'Online'),
        ('offline', 'Offline'),
    )

    name = models.CharField(max_length=255, default='_')  # Changed to CharField
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    stock = models.IntegerField(default=0)
    image = models.ImageField(upload_to='food_images/') 
    description = models.TextField(default='-')
    healthy = models.BooleanField(default=False)
    vegetarian = models.BooleanField(default=True)
    category = models.CharField(max_length=20, choices=cat_choice)
    meal_type = models.CharField(max_length=20, choices=MEAL_TYPE_CHOICES)
    order_type = models.CharField(max_length=20, choices=ORDER_TYPE_CHOICES, default='online')
   

    def __str__(self):
        return self.name

    @property
    def imageURL(self):
        try:
            url = self.image.url
        except:
            url=''
        return url

# SUBSCRIPTION MODEL

from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from dateutil.relativedelta import relativedelta
from django.db.models.signals import m2m_changed
from django.dispatch import receiver
from decimal import Decimal



class Subscription(models.Model):
    DURATION_CHOICES = (
        ('1_day', '1 Day'),
        ('1_week', '1 Week'),
        ('1_month', '1 Month'),
        ('3_months', '3 Months'),
        ('6_months', '6 Months'),
        ('1_year', '1 Year'),
    )

    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.CASCADE)
    duration = models.CharField(max_length=100, choices=DURATION_CHOICES)
    start_date = models.DateField(auto_now_add=True)
    end_date = models.DateField(null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    breakfast_items = models.ManyToManyField(Food, related_name='breakfast_subscriptions', blank=True)
    lunch_items = models.ManyToManyField(Food, related_name='lunch_subscriptions', blank=True)
    dinner_items = models.ManyToManyField(Food, related_name='dinner_subscriptions', blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'Subscription'
        ordering = ['start_date']

  
    def save(self, *args, **kwargs):
    # Ensure start_date is set if not already provided
        if not self.start_date:
            self.start_date = timezone.now().date()

        # Calculate end date based on the duration
        self.calculate_end_date()

        # Set the active status based on the end date
        if self.end_date and timezone.now().date() > self.end_date:
            self.is_active = False
        else:
            self.is_active = True

        # First save the instance without calculating the total amount
        super().save(*args, **kwargs)

        # After the instance is saved (so it has an ID), calculate the total amount
        self.calculate_total_amount()

        # Save again to update the total amount
        super().save(*args, **kwargs)


    def calculate_end_date(self):
        if self.duration == '1_day':
            self.end_date = self.start_date + timedelta(days=1)
        elif self.duration == '1_week':
            self.end_date = self.start_date + timedelta(weeks=1)
        elif self.duration == '1_month':
            self.end_date = self.start_date + relativedelta(months=1)
        elif self.duration == '3_months':
            self.end_date = self.start_date + relativedelta(months=3)
        elif self.duration == '6_months':
            self.end_date = self.start_date + relativedelta(months=6)
        elif self.duration == '1_year':
            self.end_date = self.start_date + relativedelta(years=1)

    def calculate_total_amount(self):
        # Calculate total cost of selected food items for each meal type
        total_item_cost = (
            sum(item.price for item in self.breakfast_items.all()) +
            sum(item.price for item in self.lunch_items.all()) +
            sum(item.price for item in self.dinner_items.all())
        )
        
        total_days = self.get_total_days()
        total_cost = total_item_cost * Decimal(total_days)

        # Apply a discount (if any)
        discount = total_cost * Decimal('0.10')  # 10% discount
        self.amount = total_cost - discount

        print(f"Calculated amount for subscription: {self.amount}")

    def get_total_days(self):
        duration_map = {
            '1_day': 1,
            '1_week': 7,
            '1_month': 30,
            '3_months': 90,
            '6_months': 180,
            '1_year': 365
        }
        return duration_map.get(self.duration, 0)

    def __str__(self):
        return f"Subscription ({self.get_duration_display()}) - {self.amount} RS"


@receiver(m2m_changed, sender=Subscription.breakfast_items.through)
@receiver(m2m_changed, sender=Subscription.lunch_items.through)
@receiver(m2m_changed, sender=Subscription.dinner_items.through)
def update_subscription_amount(sender, instance, action, **kwargs):
    if action in ['post_add', 'post_remove', 'post_clear']:
        # Calculate the total amount whenever items change
        instance.calculate_total_amount()
        # Save the instance to update the amount in the database
        instance.save()


# You can add a helper method to check if the subscription's amount has changed
def has_changed(self):
    previous_instance = Subscription.objects.get(id=self.id)
    return previous_instance.amount != self.amount



from django.db import models
from django.contrib.auth.models import User
class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)  # Allow null for anonymous users
    cart_id = models.CharField(max_length=250, blank=True)
    date_added = models.DateField(auto_now_add=True)

    class Meta:
        db_table = 'Cart'
        ordering = ['date_added']

    def __str__(self):
        return self.cart_id  # Corrected to return cart_id


from django.db import models
from django.utils import timezone
class CartItem(models.Model):
    user=models.ForeignKey(User,null=True,blank=True,on_delete=models.CASCADE)
    subscription = models.ForeignKey(Subscription, null=True, blank=True, on_delete=models.CASCADE)  # New field
   
    id = models.AutoField(primary_key=True)
    item = models.ForeignKey(Food, null=True, blank=True, on_delete=models.CASCADE)  # Allow null for subscription items
    price = models.DecimalField(decimal_places=2, max_digits=10, default=0) # Add the price field

    cart = models.ForeignKey(Cart, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)  # This tracks when the item was added

    class Meta:
        db_table = 'CartItem'

    @property
    def sub_total(self):
        if self.item:
            return self.item.price * self.quantity  # Uses item.price
        return 0  # Return 0 if item is None
     # Corrected to return item name
    def __str__(self):
        if self.item:
            return f'{self.quantity} of {self.item.name}'
        elif self.subscription:
            return f'{self.quantity} of {self.subscription.id}'
        else:
            return 'Empty Cart Item'





# PAYMENT MODEL
from django.db import models
from django.contrib.auth.models import User
from .models import Subscription  # Ensure you import the Subscription model
from django.core.validators import MinLengthValidator
from datetime import date

class Payment(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2, editable=False)  # Amount taken from subscription
    payment_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')

    # Card details
    card_number = models.CharField(
        max_length=16,
        validators=[MinLengthValidator(16)],  # Ensure card number is exactly 16 digits
    )
    cvv = models.CharField(
        max_length=4,
        validators=[MinLengthValidator(3)],  # CVV should be 3 or 4 digits
    )
    

    class Meta:
        db_table = 'Payment'
        ordering = ['-payment_date']  # Order by latest payment first

    def save(self, *args, **kwargs):
        # Automatically set the amount from the associated subscription
        if not self.amount:
            self.amount = self.subscription.amount

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Payment of {self.amount} RS by {self.user.username} for {self.subscription.get_duration_display()}"

    



# CART PAYMENT MODEL


from django.db import models
from django.contrib.auth.models import User
from .models import CartItem,Subscription

import uuid
from django.db import models
from django.contrib.auth.models import User

class CartPayment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    cart = models.ForeignKey('Cart', on_delete=models.CASCADE, null=True) 
    cart_items = models.ManyToManyField('CartItem', blank=True)
    subscription_items = models.ManyToManyField('Subscription', related_name='cart_payments', blank=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(max_length=20, default='Completed')
    created_at = models.DateTimeField(auto_now_add=True)
    address = models.CharField(max_length=550)
    mobile_number = models.CharField(null=True, blank=True, max_length=50)
    # New fields
    card_number = models.CharField(max_length=16)  # Store card number
    cvv = models.CharField(max_length=4)           # Store CVV
    order_type = models.CharField(max_length=10, choices=[('online', 'Online'), ('offline', 'Offline')])  # Store order type
    unique_cart_id = models.CharField(max_length=100,  editable=False)  # Unique cart ID (renamed field)

    def __str__(self):
        return f'Payment by {self.user.username} - Cart ID: {self.unique_cart_id} - Total: {self.total_amount}'

    def save(self, *args, **kwargs):
        # Generate a unique cart ID if it doesn't exist
        if not self.unique_cart_id:
            self.unique_cart_id = str(uuid.uuid4())  # Generate a new unique cart ID
         # Fetch the user's profile
        profile = Profile.objects.filter(user=self.user).first()
        if profile:
            # Assign the profile's address to the CartPayment address
            self.address = profile.address
            self.mobile_number = profile.mobile_number
        # Check if there is an existing cart for the user
        if not self.cart or not Cart.objects.filter(user=self.user, id=self.cart.id).exists():
            # Create a new cart
            new_cart = Cart.objects.create(user=self.user)
            self.cart = new_cart
            
        # Save the CartPayment instance first
        super(CartPayment, self).save(*args, **kwargs)

    def save(self, *args, **kwargs):
    # First save the CartPayment object itself to get an ID
        super(CartPayment, self).save(*args, **kwargs)

        # Ensure the CartPayment has an ID now
        if not self.pk:
            raise ValueError("CartPayment object must be saved before assigning CartItems.")
        
        # Fetch the actual CartItems from the ManyRelatedManager
        for item in self.cart_items.all():  # Use .all() to retrieve the actual cart items
            
            # Clean up the item dictionary to exclude non-field attributes like _state and id
            item_data = {
                field: value for field, value in item.__dict__.items() 
                if field in [f.name for f in CartItem._meta.fields] and field != 'id'
            }
            
            # Create a new CartItem without reusing the id
            CartItem.objects.create(cart=self.cart, **item_data)




# CONTACT US MODEL
from django.db import models

class Contact(models.Model):
    user=models.ForeignKey(User,  on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name + ' - ' + self.email




from django.db import models

class NoKitchenMenu(models.Model):
    MEAL_CHOICES = [
        ('breakfast', 'Breakfast'),
        ('lunch', 'Lunch'),
        ('dinner', 'Dinner'),
        ('snack', 'Snacks'),
        ('dessert', 'Desserts'),
        ('special', 'Special Package / Event'),
    ]

    meal_type = models.CharField(max_length=20, choices=MEAL_CHOICES)
    item_name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    quantity = models.CharField(max_length=50)
    image = models.ImageField(upload_to='menu_images/', blank=True, null=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.item_name} ({self.get_meal_type_display()})"



from django.db import models
from django.contrib.auth.models import User

class NoKitchenMenu(models.Model):
    MEAL_CHOICES = [
        ('breakfast', 'Breakfast'),
        ('lunch', 'Lunch'),
        ('dinner', 'Dinner'),
        ('snack', 'Snacks'),
        ('dessert', 'Desserts'),
        ('special', 'Special Package / Event'),
    ]
    meal_type = models.CharField(max_length=20, choices=MEAL_CHOICES)
    item_name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    quantity = models.CharField(max_length=50)
    image = models.ImageField(upload_to='menu_images/', blank=True, null=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    stock = models.PositiveIntegerField(default=100)

    def __str__(self):
        return f"{self.item_name} ({self.get_meal_type_display()})"



# models.py
# models.py
class NoKitchenCurries(models.Model):
    CURRY_TYPE_CHOICES = [
        ('veg', 'Vegetarian'),
        ('nonveg', 'Non-Vegetarian'),
    ]

    menu_item = models.ForeignKey(
        NoKitchenMenu, on_delete=models.CASCADE, related_name='curries',
        blank=True, null=True  # ✅ Now optional
    )
    curry_type = models.CharField(max_length=10, choices=CURRY_TYPE_CHOICES)
    curry_name = models.CharField(max_length=100)
    quantity = models.CharField(max_length=50, default='1 Bowl')  # ✅ Add quantity field
    price = models.DecimalField(max_digits=6, decimal_places=2)
    image = models.ImageField(upload_to='curry_images/', blank=True, null=True)  # ✅ optional image
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.curry_name} ({self.get_curry_type_display()})"


class NoKitchenCart(models.Model):
    cart_id = models.CharField(max_length=250, blank=True)
    date_added = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.cart_id
class NoKitchenCartItem(models.Model):
    item = models.ForeignKey(NoKitchenMenu, on_delete=models.CASCADE)
    cart = models.ForeignKey(NoKitchenCart, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)

    @property
    def sub_total(self):
        return self.item.price * self.quantity

    def __str__(self):
        return self.item.item_name



# models.py
class NoKitchenSubscription(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    selected_items = models.ManyToManyField(NoKitchenMenu)
    total_amount = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)

    def calculate_total_amount(self):
        total = sum(item.price for item in self.selected_items.all())
        self.total_amount = total
        self.save()

    def __str__(self):
        return f"Subscription #{self.id} by {self.user.username}"



from django.db import models
from django.contrib.auth.models import User
import string
import random

def generate_plan_order_id():
    chars = string.ascii_uppercase + string.digits
    return 'PLAN-' + ''.join(random.choices(chars, k=6))


class WeeklyMenuPlan(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)

    DAY_CHOICES = [
        ('sunday', 'Sunday'),
        ('monday', 'Monday'),
        ('tuesday', 'Tuesday'),
        ('wednesday', 'Wednesday'),
        ('thursday', 'Thursday'),
        ('friday', 'Friday'),
        ('saturday', 'Saturday'),
    ]

    day = models.CharField(max_length=10, choices=DAY_CHOICES)
    rotation_number = models.PositiveSmallIntegerField(default=1, help_text="1, 2 or 3 to allow 3 sets of menus")

    breakfast_items = models.ManyToManyField(
        'NoKitchenMenu',
        related_name='breakfast_rotations',
        limit_choices_to={'meal_type': 'breakfast'}
    )
    lunch_items = models.ManyToManyField(
        'NoKitchenMenu',
        related_name='lunch_rotations',
        limit_choices_to={'meal_type': 'lunch'}
    )
    dinner_items = models.ManyToManyField(
        'NoKitchenMenu',
        related_name='dinner_rotations',
        limit_choices_to={'meal_type': 'dinner'}
    )

    from_date = models.DateField(null=True, blank=True)
    to_date = models.DateField(null=True, blank=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    # ✅ New Field: Custom Order ID
    plan_order_id = models.CharField(max_length=20, unique=True, editable=False, blank=True, null=True)

    class Meta:
        unique_together = ('day', 'rotation_number')  # Allow max 3 per day

    def save(self, *args, **kwargs):
        if not self.plan_order_id:
            while True:
                new_id = generate_plan_order_id()
                if not WeeklyMenuPlan.objects.filter(plan_order_id=new_id).exists():
                    self.plan_order_id = new_id
                    break
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.get_day_display()} - Rotation {self.rotation_number}"




from django.contrib.auth.models import User
from django.db import models
import string
import random

def generate_order_id():
    chars = string.ascii_uppercase + string.digits
    while True:
        code = ''.join(random.choices(chars, k=6))
        if not WeeklyMealSelection.objects.filter(custom_order_id=code).exists():
            return code

class WeeklyMealSelection(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    
    DAY_CHOICES = [
        ('monday', 'Monday'),
        ('tuesday', 'Tuesday'),
        ('wednesday', 'Wednesday'),
        ('thursday', 'Thursday'),
        ('friday', 'Friday'),
        ('saturday', 'Saturday'),
        ('sunday', 'Sunday'),
    ]

    MEAL_TYPE_CHOICES = [
        ('breakfast', 'Breakfast'),
        ('lunch', 'Lunch'),
        ('dinner', 'Dinner'),
    ]

    day = models.CharField(max_length=10, choices=DAY_CHOICES)
    meal_type = models.CharField(max_length=10, choices=MEAL_TYPE_CHOICES)
    selected_items = models.ManyToManyField('NoKitchenMenu')

    from_date = models.DateField(null=True, blank=True)
    to_date = models.DateField(null=True, blank=True)
    total_price = models.DecimalField(max_digits=8, decimal_places=2, default=0.0)

    # ✅ Minimal Addition — Only This Line Added
    custom_order_id = models.CharField(max_length=10, unique=True, null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.get_day_display()} - {self.get_meal_type_display()}"





from django.db import models
from django.contrib.auth.models import User
import string
import random
from .models import NoKitchenMenu  # Only if you're importing from another file — otherwise fix this too

# ✅ Helper function to generate unique order ID
def generate_order_id():
    chars = string.ascii_uppercase + string.digits
    while True:
        code = ''.join(random.choices(chars, k=6))
        if not CustomMealPlan.objects.filter(custom_order_id=code).exists():
            return code

class CustomMealPlan(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    base_meal = models.ForeignKey(NoKitchenMenu, on_delete=models.CASCADE)
    start_date = models.DateField(null=True, blank=True) 
    end_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    updated_price = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    is_paid = models.BooleanField(default=False)
    transaction_id = models.CharField(max_length=100, null=True, blank=True)
    razorpay_order_id = models.CharField(max_length=100, null=True, blank=True)
    custom_order_id = models.CharField(max_length=10, unique=True, null=True, blank=True)
    breakfast = models.TextField(blank=True, null=True)   # Add if required
    lunch = models.TextField(blank=True, null=True)       # Add if required
    dinner = models.TextField(blank=True, null=True) 
    base_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # ✅
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    # ✅ Auto-generate custom_order_id if not set
    def save(self, *args, **kwargs):
        if not self.custom_order_id:
            self.custom_order_id = generate_order_id()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username}'s custom plan based on {self.base_meal}"




class CustomMealItem(models.Model):
    plan = models.ForeignKey(CustomMealPlan, on_delete=models.CASCADE, related_name='item_details')
    item = models.ForeignKey(NoKitchenMenu, on_delete=models.CASCADE,null=True)
    quantity = models.PositiveIntegerField(default=1)

    def get_total_price(self):
        return self.quantity * self.item.price

    def __str__(self):
        return f"{self.quantity} x {self.item.item_name} for {self.plan}"



from .models import NoKitchenCurries  # Add this if not already imported

class CustomCurryItem(models.Model):
    plan = models.ForeignKey(CustomMealPlan, on_delete=models.CASCADE, related_name='curry_items')
    curry = models.ForeignKey(NoKitchenCurries, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def get_total_price(self):
        return self.quantity * self.curry.price

    def __str__(self):
        return f"{self.quantity} x {self.curry.curry_name} for {self.plan}"





from django.contrib.auth.models import User
from django.db import models

class SkippedMeal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    meal_selection = models.ForeignKey('WeeklyMealSelection', on_delete=models.CASCADE, related_name='skips')
    skipped_at = models.DateTimeField(auto_now_add=True)
    refunded_amount = models.DecimalField(max_digits=8, decimal_places=2, default=0.0)

    def __str__(self):
        return f"{self.user.username} skipped {self.meal_selection} on {self.skipped_at.strftime('%Y-%m-%d')}"


class Wallet(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)

    def __str__(self):
        return f"{self.user.username}'s Wallet - ₹{self.balance}"






from django.contrib.auth.models import User
from django.db import models

class DeliveryAddress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    flat_number = models.CharField(max_length=100)
    street = models.CharField(max_length=100)
    landmark = models.CharField(max_length=100, blank=True)

    # Meal-wise delivery time and address type
    breakfast_time = models.TimeField(null=True, blank=True)
    breakfast_address_type = models.CharField(max_length=20, default='Home', null=True, blank=True)

    lunch_time = models.TimeField(null=True, blank=True)
    lunch_address_type = models.CharField(max_length=20, default='Home', null=True, blank=True)

    dinner_time = models.TimeField(null=True, blank=True)
    dinner_address_type = models.CharField(max_length=20, default='Home', null=True, blank=True)

    alt_mobile = models.CharField(max_length=10, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    address_type = models.CharField(max_length=20, default='Home', null=True, blank=True)
    preferred_time = models.TimeField(null=True, blank=True)

    def __str__(self):
        return f"Delivery for {self.user.username} on {self.created_at.date()}"




class RazorpayTransaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    transaction_id = models.CharField(max_length=100)
    order_id = models.CharField(max_length=100)
    payment_id = models.CharField(max_length=100)
    signature = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} – {self.transaction_id}"






from django.db import models
from django.contrib.auth.models import User
import string
import random

def generate_order_id():
    chars = string.ascii_uppercase + string.digits
    while True:
        code = ''.join(random.choices(chars, k=6))
        if not FinalMealOrder.objects.filter(order_id=code).exists():
            return code


from django.db import models
from django.contrib.auth.models import User
import string
import random

# Helper to generate a unique 6-character alphanumeric order ID
def generate_order_id():
    chars = string.ascii_uppercase + string.digits
    while True:
        code = ''.join(random.choices(chars, k=6))
        if not FinalMealOrder.objects.filter(order_id=code).exists():
            return code


class FinalMealOrder(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='meal_orders')

    # Unique system-generated order ID
    order_id = models.CharField(max_length=10, unique=True, blank=True)

    # Payment tracking
    payment_id = models.CharField(max_length=100, null=True, blank=True)

    # Meal plan duration
    start_date = models.DateField()
    end_date = models.DateField()

    # Delivery address fields
    flat_number = models.CharField(max_length=100)
    street = models.CharField(max_length=200)
    landmark = models.CharField(max_length=200, blank=True, null=True)
    alt_mobile = models.CharField(max_length=15, blank=True, null=True)

    # Preferred delivery time slots
    breakfast_time = models.CharField(max_length=50, blank=True, null=True)
    lunch_time = models.CharField(max_length=50, blank=True, null=True)
    dinner_time = models.CharField(max_length=50, blank=True, null=True)

    # Delivery address types for different meals (e.g., Home, Office)
    breakfast_address_type = models.CharField(max_length=50, blank=True, null=True)
    lunch_address_type = models.CharField(max_length=50, blank=True, null=True)
    dinner_address_type = models.CharField(max_length=50, blank=True, null=True)

    # Ordered items (stored as comma-separated string or JSON)
    ordered_items = models.TextField(help_text="Comma-separated or JSON string of meal items")

    # Total amount paid
    total_amount = models.DecimalField(max_digits=8, decimal_places=2)

    # Auto timestamp for creation
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.order_id} - {self.user.username}"

    def save(self, *args, **kwargs):
        if not self.order_id:
            self.order_id = generate_order_id()
        super().save(*args, **kwargs)







# models.py
from django.db import models

class StoreAdmin(models.Model):
    name = models.CharField(max_length=100)
    mobile = models.CharField(max_length=15, unique=True)
    email = models.EmailField(unique=True)
    is_approved = models.BooleanField(default=False)  # External admin approval required
    is_active = models.BooleanField(default=True)      # Set to False to deactivate access
    created_at = models.DateTimeField(auto_now_add=True)

    def status(self):
        if not self.is_active:
            return "Deactivated"
        elif not self.is_approved:
            return "Pending Approval"
        return "Active"

    def __str__(self):
        return f"{self.name} ({self.status()})"






# Delivery Person 

from django.db import models
import uuid

class DeliveryPartner(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    mobile = models.CharField(max_length=15, unique=True)

    # ✅ Add this field
    agent_code = models.CharField(max_length=20, unique=True, blank=True, null=True)

    # Document fields
    pan_number = models.CharField(max_length=20, blank=True, null=True)
    pan_card_image = models.ImageField(upload_to='delivery_docs/', blank=True, null=True)
    aadhar_number = models.CharField(max_length=12)
    aadhar_file = models.FileField(upload_to='delivery_docs/', blank=True, null=True)

    # Extra fields
    location = models.CharField(max_length=255, blank=True, null=True)
    selfie = models.ImageField(upload_to='delivery_docs/', blank=True, null=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    registered_on = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.mobile})"

    def save(self, *args, **kwargs):
        if not self.agent_code:
            base_code = "DLR"
            unique_id = uuid.uuid4().hex[:6].upper()
            self.agent_code = f"{base_code}{unique_id}"
        super().save(*args, **kwargs)






















# Store no kitchenlocation
from django.db import models

class DeliveryConfig(models.Model):
    api_key = models.CharField(max_length=255)
    store_latitude = models.FloatField()
    store_longitude = models.FloatField()

    def __str__(self):
        return "Delivery Configuration"



# models.py

class StoreLocation(models.Model):
    name = models.CharField(max_length=100)
    latitude = models.FloatField()
    longitude = models.FloatField()
    is_active = models.BooleanField(default=True)  # Toggle for open/close
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({'Active' if self.is_active else 'Closed'})"






# preparation/models.py

from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from datetime import datetime

class PreparationStatus(models.Model):
    STATUS_CHOICES = [
        ('queued', 'Queued'),
        ('preparing', 'Being Prepared'),
        ('ready', 'Ready for Dispatch'),
        ('dispatched', 'Dispatched'),
        ('not_available', 'Not Available'),
    ]

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    order = GenericForeignKey('content_type', 'object_id')  # Link to any of the 4 models

    meal_type = models.CharField(max_length=20)  # breakfast/lunch/dinner
    date = models.DateField()
    time = models.TimeField(null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='queued')
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.meal_type} | {self.status} | {self.order}"
