import json

from django import forms

from .models import ProductView


class ProductViewAdminForm(forms.ModelForm):
    class Meta:
        model = ProductView
        fields = "__all__"
        widgets = {
            "print_area": forms.Textarea(attrs={"rows": 3, "class": "vLargeTextField printforge-json-field"}),
            "perspective_points": forms.Textarea(attrs={"rows": 4, "class": "vLargeTextField printforge-json-field"}),
        }

    def clean_print_area(self):
        value = self.cleaned_data["print_area"]
        if isinstance(value, str):
            value = json.loads(value)
        required = {"x", "y", "width", "height"}
        if not required.issubset(value.keys()):
            raise forms.ValidationError("Print area must contain x, y, width, and height.")
        return value

    def clean_perspective_points(self):
        value = self.cleaned_data["perspective_points"]
        if isinstance(value, str):
            value = json.loads(value)
        if len(value) != 4:
            raise forms.ValidationError("Perspective points must include exactly four points.")
        return value
