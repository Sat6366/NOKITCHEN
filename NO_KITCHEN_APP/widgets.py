# widgets.py
from django import forms
from django.utils.safestring import mark_safe

class ImageCheckboxSelectMultiple(forms.CheckboxSelectMultiple):
    def render(self, name, value, attrs=None, choices=(), renderer=None):
        output = []
        # Ensure value is iterable
        if value is None:
            value = []  # Default to an empty list if value is None

        # Iterate over the choices
        for option in self.choices.queryset:
            # Generate the HTML for the image and checkbox
            img_tag = f'<img src="{option.image.url}" width="150" height="150" alt="{option.name}" class="d-flex justify-center" />'
            checkbox = (
                f'<input type="checkbox" name="{name}" value="{option.pk}"'
                f' {"checked" if str(option.pk) in value else ""}/> {option.name}'
            )

            output.append(f'<label>{img_tag} {checkbox}</label><br/>')

        return mark_safe(''.join(output))
