<?php

namespace App\Enums;

enum CategoryExpenses: int
{
    case RENT = 1;        // Arenda
    case INTERNET = 2;    // Internet
    case ELECTRICITY = 3; // Elektr
    case TAX = 4;         // Soliq
    case SALARY = 5;      // Ish haqi
    case PERSONAL = 6;    // Shaxsiy xarajat

    public function label(): string
    {
        return match($this) {
            self::RENT       => 'Arenda',
            self::INTERNET   => 'Internet',
            self::ELECTRICITY=> 'Elektr',
            self::TAX        => 'Soliq',
            self::SALARY     => 'Ish haqi',
            self::PERSONAL   => 'Shaxsiy xarajat',
        };
    }

    public static function fromName(string $name): self
    {
        return match (mb_strtoupper(trim($name))) {
            'ARENDA'          => self::RENT,
            'INTERNET'        => self::INTERNET,
            'ELEKTR'          => self::ELECTRICITY,
            'SOLIQ'           => self::TAX,
            'ISH HAQI'        => self::SALARY,
            'SHAHSIY XARAJAT' => self::PERSONAL,
            default           => throw new \InvalidArgumentException("Invalid expense type: $name"),
        };
    }

    // Frontdan keladigan int yoki string qiymatni enumga parse qiladi
    public static function parse(mixed $value): self
    {
        if ($value instanceof self) return $value;
        if (is_numeric($value)) {
            return self::from($value);
        }

        return self::fromName((string)$value);
    }

    // Select uchun barcha variantlar
    public static function options(): array
    {
        return array_map(fn(self $e) => [
            'id' => $e->value,
            'label' => $e->label(),
        ], self::cases());
    }
}
