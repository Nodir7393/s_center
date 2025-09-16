<?php

namespace App\Enums;

enum CategoryProduct: int
{
    public const DRINKS = 1;
    public const EDIBLES = 2;
    public const OTHERS = 0;

    public function label(int $value): string
    {
        return match($value) {
            self::DRINKS => 'Ichimliklar',
            self::EDIBLES => 'Yeyiladigan narsalar',
            self::OTHERS => 'Boshqalar',
            default => 'Noma’lum',
        };
    }

    public static function fromName(string $name): int
    {
        return match (strtoupper($name)) {
            'DRINKS' => self::DRINKS,
            'EDIBLES' => self::EDIBLES,
            'OTHERS' => self::OTHERS,
            default => throw new \InvalidArgumentException("Invalid application type: $name"),
        };
    }

    // Frontdan keladigan nomni (yoki bevosita label’ni) intga o‘girish
    public static function parse(mixed $value): int
    {
        if (is_numeric($value)) return (int)$value;

        $upper = mb_strtoupper(trim((string)$value));
        return match ($upper) {
            'DRINKS', 'ICHIMLIKLAR'           => self::DRINKS,
            'EDIBLES', 'YEYILADIGAN NARSALAR' => self::EDIBLES,
            'OTHERS', 'BOSHQALAR'             => self::OTHERS,
            default                           => self::OTHERS,
        };
    }
}
