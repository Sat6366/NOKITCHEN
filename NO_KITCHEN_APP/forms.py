from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import Profile

class RegisterUserForm(UserCreationForm):
    email = forms.EmailField(required=True)
    mobile_number = forms.CharField(max_length=10, required=True)
    address = forms.CharField(widget=forms.Textarea,required=True)
    pincode = forms.CharField(max_length=6, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']
    def __init__(self, *args, **kwargs):
        super(RegisterUserForm, self).__init__(*args, **kwargs)
        self.fields['username'].widget.attrs.update({'class': 'form-control', 'placeholder': 'Username...', 'style': 'height: 40px;'})
        self.fields['email'].widget.attrs.update({'class': 'form-control', 'placeholder': 'Email Address...' ,'style': 'height: 40px;'})
        self.fields['password1'].widget.attrs.update({'class': 'form-control', 'placeholder': 'Password...', 'style': 'height: 40px;'})
        self.fields['password2'].widget.attrs.update({'class': 'form-control', 'placeholder': 'Confirm Password...', 'style': 'height: 40px;'})
        self.fields['mobile_number'].widget.attrs.update({'class': 'form-control', 'placeholder': 'Mobile Number...', 'style': 'height: 40px;'})
        self.fields['address'].widget.attrs.update({'class': 'form-control', 'placeholder': 'Address...', 'style': 'height: 50px;'})
        self.fields['pincode'].widget.attrs.update({'class': 'form-control', 'placeholder': 'Pincode...', 'style': 'height: 40px;'})

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']

        if commit:
            user.save()
            # Check if the profile already exists
            profile, created = Profile.objects.get_or_create(
                user=user,
                defaults={
                    'mobile_number': self.cleaned_data['mobile_number'],
                    'address': self.cleaned_data['address'],
                    'pincode': self.cleaned_data['pincode']
                }
            )
            
            # If the profile was not created, it means it already exists.
            if not created:
                profile.mobile_number = self.cleaned_data['mobile_number']
                profile.address = self.cleaned_data['address']
                profile.pincode = self.cleaned_data['pincode']
                profile.save()

        return user



# forms.py
from django import forms
from .models import Subscription, Food
from .widgets import ImageCheckboxSelectMultiple

class SubscriptionForm(forms.ModelForm):
    breakfast_items = forms.ModelMultipleChoiceField(
        queryset=Food.objects.filter(meal_type='breakfast'),
        widget=ImageCheckboxSelectMultiple,  # Custom widget that displays images
        required=False  # Set to False if it's optional
    )
    lunch_items = forms.ModelMultipleChoiceField(
        queryset=Food.objects.filter(meal_type='lunch'),
        widget=ImageCheckboxSelectMultiple,
        required=False
    )
    dinner_items = forms.ModelMultipleChoiceField(
        queryset=Food.objects.filter(meal_type='dinner'),
        widget=ImageCheckboxSelectMultiple,
        required=False
    )

    class Meta:
        model = Subscription
        fields = ['duration', 'breakfast_items', 'lunch_items', 'dinner_items']




# # forms.py

from django import forms
from .models import Payment

class PaymentForm(forms.ModelForm):
    class Meta:
        model = Payment
        fields = ['card_number','cvv']  # Include other fields as needed

    def save(self, commit=True):
        payment = super().save(commit=False)  # Don't save yet
        # Ensure that we don't access subscription here
        # Instead, handle it in the view where we can access the correct subscription
        
        if commit:
            payment.save()  # Save the payment if commit is True
        return payment




# forms.py


from django import forms
from .models import CartPayment, Profile  # Ensure you have the correct import for Profile model

class CartPaymentForm(forms.ModelForm):
    class Meta:
        model = CartPayment
        fields = ['card_number', 'cvv', 'total_amount', 'order_type', 'mobile_number', 'address']

        widgets = {
            'card_number': forms.TextInput(attrs={
                'class': 'form-control',  # Bootstrap class for styling
                'maxlength': 16,  # Max length for card number
                'placeholder': 'Enter your 16-digit card number',
            }),
            'cvv': forms.PasswordInput(attrs={
                'class': 'form-control',
                'maxlength': 4,  # Max length for CVV
                'placeholder': 'Enter CVV',
            }),
            'total_amount': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': 0.01,  # Ensure decimal step
                'placeholder': 'Total Amount',
                'readonly': 'readonly',
            }),
            'order_type': forms.Select(attrs={
                'class': 'form-control',  # Dropdown select styling
            }),
            'mobile_number': forms.TextInput(attrs={
                'class': 'form-control',
                'maxlength': 10,  # Max length for mobile number
                'placeholder': 'Enter mobile number',
                'readonly': 'readonly',
            }),
            'address': forms.Textarea(attrs={
                'class': 'form-control',
                'maxlength': 500,  # Max length for address
                'placeholder': 'Enter address',
                'rows': 3,  # Set the height to 4 rows
                'readonly': 'readonly',  # Make address field read-only
            }),
        }

    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None) 
        cart_total_amount = kwargs.pop('cart_total_amount', None)
        super().__init__(*args, **kwargs)

        if cart_total_amount is not None:
            self.fields['total_amount'].initial = cart_total_amount

        # If user is passed, pre-fill address and mobile number from profile
        if user:
            try:
                profile = Profile.objects.get(user=user)
                self.fields['address'].initial = profile.address
                self.fields['mobile_number'].initial = profile.mobile_number
            except Profile.DoesNotExist:
                pass  # If no profile exists, leave fields empty

    def clean_address(self):
        """Allow updating address if provided in the cleaned data."""
        address = self.cleaned_data.get('address')
        # If the address is modified, it will be saved
        return address


from django import forms
from .models import Profile

class AddressUpdateForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ['address']

        widgets = {
            'address': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,  # Set height to 4 rows
                'placeholder': 'Enter your address',
            }),
        }

# from django import forms
from .models import Contact

class ContactForm(forms.ModelForm):
    class Meta:
        model = Contact
        fields = ['name', 'email', 'subject', 'message']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Your Name'}),
            'email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Your Email'}),
            'subject': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Subject'}),
            'message': forms.Textarea(attrs={'class': 'form-control', 'rows': 4, 'placeholder': 'Your Message'}),
        }



from django import forms
from .models import Food

class FoodForm(forms.ModelForm):
    class Meta:
        model = Food
        fields = '__all__'
        widgets = {
            'meal_type': forms.Select(attrs={'class': 'form-control'}),
            'order_type': forms.Select(attrs={'class': 'form-control'}),
            'category': forms.Select(attrs={'class': 'form-control'}),
        }




















# forms.py

from django import forms
from .models import StoreLocation

class StoreLocationForm(forms.ModelForm):
    class Meta:
        model = StoreLocation
        fields = ['name', 'latitude', 'longitude', 'is_active']
