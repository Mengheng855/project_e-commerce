<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreSetting extends Model
{
    protected $fillable = [
        'store_name',
        'store_email',
        'store_phone',
        'store_address',
        'currency',
        'timezone',
        'store_logo',
        'login_alerts',
        'two_factor_required',
        'password_expiry_days',
        'session_timeout_minutes',
        'order_email_notifications',
        'low_stock_notifications',
        'marketing_emails',
        'notify_email',
        'enable_telegram_receipts',
        'telegram_chat_id',
        'currency_position',
        'tax_rate',
        'enable_cod',
        'enable_card_payments',
        'enable_bank_transfer',
        'shipping_origin',
        'free_shipping_threshold',
        'flat_shipping_rate',
        'processing_time_days',
        'email_from_name',
        'email_footer_text',
        'enable_branded_emails',
        'theme_mode',
        'accent_color',
        'show_store_logo_in_header',
    ];

    protected function casts(): array
    {
        return [
            'login_alerts' => 'boolean',
            'two_factor_required' => 'boolean',
            'password_expiry_days' => 'integer',
            'session_timeout_minutes' => 'integer',
            'order_email_notifications' => 'boolean',
            'low_stock_notifications' => 'boolean',
            'marketing_emails' => 'boolean',
            'enable_telegram_receipts' => 'boolean',
            'tax_rate' => 'decimal:2',
            'enable_cod' => 'boolean',
            'enable_card_payments' => 'boolean',
            'enable_bank_transfer' => 'boolean',
            'free_shipping_threshold' => 'decimal:2',
            'flat_shipping_rate' => 'decimal:2',
            'processing_time_days' => 'integer',
            'enable_branded_emails' => 'boolean',
            'show_store_logo_in_header' => 'boolean',
        ];
    }
}
