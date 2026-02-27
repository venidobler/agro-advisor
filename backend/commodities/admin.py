from django.contrib import admin
from .models import Quote

@admin.register(Quote)
class QuoteAdmin(admin.ModelAdmin):
    list_display = ('commodity', 'price', 'date', 'location')
    list_filter = ('commodity', 'date', 'location')
    search_fields = ('location',)
    date_hierarchy = 'date'