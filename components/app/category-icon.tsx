'use client';
import {
  UtensilsCrossed, Home, Car, Gamepad2, HeartPulse, GraduationCap,
  Shirt, Plane, Laptop, MoreHorizontal, Banknote, Briefcase,
  TrendingUp, PlusCircle, HelpCircle
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  UtensilsCrossed,
  Home,
  Car,
  Gamepad2,
  HeartPulse,
  GraduationCap,
  Shirt,
  Plane,
  Laptop,
  MoreHorizontal,
  Banknote,
  Briefcase,
  TrendingUp,
  PlusCircle,
};

interface CategoryIconProps {
  iconName: string;
  className?: string;
}

export function CategoryIcon({ iconName, className }: CategoryIconProps) {
  const Icon = ICON_MAP[iconName] ?? HelpCircle;
  return <Icon className={className ?? 'h-5 w-5'} />;
}
