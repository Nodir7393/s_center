<?php

namespace App\Enums;

enum Month: int
{
    public const M01 = 1;
    public const M02 = 2;
    public const M03 = 3;
    public const M04 = 4;
    public const M05 = 5;
    public const M06 = 6;
    public const M07 = 7;
    public const M08 = 8;
    public const M09 = 9;
    public const M10 = 10;
    public const M11 = 11;
    public const M12 = 12;

    public function label(int $value): string
    {
        return match($value) {
            self::M01 => 'M01',
            self::M02 => 'M02',
            self::M03 => 'M03',
            self::M04 => 'M04',
            self::M05 => 'M05',
            self::M06 => 'M06',
            self::M07 => 'M07',
            self::M08 => 'M08',
            self::M09 => 'M09',
            self::M10 => 'M10',
            self::M11 => 'M11',
            self::M12 => 'M12',
            default => 'Noma’lum',
        };
    }

    public static function fromName(string $name): int
    {
        return match (strtoupper($name)) {
            'M01' => self::M01,
            'M02' => self::M02,
            'M03' => self::M03,
            'M04' => self::M04,
            'M05' => self::M05,
            'M06' => self::M06,
            'M07' => self::M07,
            'M08' => self::M08,
            'M09' => self::M09,
            'M10' => self::M10,
            'M11' => self::M11,
            'M12' => self::M12,
            default => throw new \InvalidArgumentException("Invalid application type: $name"),
        };
    }
}
