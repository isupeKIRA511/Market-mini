/** نموذج بطاقة السائق/المركبة في واجهة السوق — يطابق الحقول المستخدمة في القوالب */

export type DriverCardUi = {
  id: string | number;
  type: 'featured' | 'small' | 'simple';
  name: string;
  rating: number;
  reviews: string;
  badge: string;
  price: string;
  car: string;
  icon: string;
  carTypes: string[];
  passengers: string[];
  luggage: string[];
  interactions: number;
  hasHemam: boolean;
  description?: string;
  eco?: boolean;
};

export type HomeOfferUi = {
  badge: string;
  title: string;
  desc: string;
  variant: 'gold' | 'dark';
};
