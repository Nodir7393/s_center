<?php
namespace App\Enums;

enum Month: int
{
    case M01 = 1; case M02 = 2; case M03 = 3; case M04 = 4; case M05 = 5; case M06 = 6;
    case M07 = 7; case M08 = 8; case M09 = 9; case M10 = 10; case M11 = 11; case M12 = 12;

    public function label(): string
    {
        return match($this) {
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
        };
    }

    public static function fromName(string $name): self
    {
        return match (strtoupper(trim($name))) {
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
            default => throw new \InvalidArgumentException("Invalid month: $name"),
        };
    }
}
