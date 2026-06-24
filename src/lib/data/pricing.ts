export interface PricingFeature {
  text: string;
  included: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  period: string;
  popular?: boolean;
  features: PricingFeature[];
  cta: string;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for occasional PDF tasks",
    price: 0,
    period: "forever",
    features: [
      { text: "All basic PDF tools", included: true },
      { text: "Up to 50 MB per file", included: true },
      { text: "Browser-based processing", included: true },
      { text: "Free account required", included: true },
      { text: "Batch processing", included: false },
      { text: "Priority speed", included: false },
      { text: "Premium support", included: false },
    ],
    cta: "Sign up free",
  },
  {
    id: "pro",
    name: "Pro",
    description: "For power users and professionals",
    price: 9,
    period: "month",
    popular: true,
    features: [
      { text: "All basic PDF tools", included: true },
      { text: "Unlimited file size", included: true },
      { text: "Browser-based processing", included: true },
      { text: "Batch processing", included: true },
      { text: "Priority processing speed", included: true },
      { text: "Advanced watermark tools", included: true },
      { text: "Premium email support", included: true },
    ],
    cta: "Start Pro Trial",
  },
  {
    id: "team",
    name: "Team",
    description: "Collaborate with your entire team",
    price: 29,
    period: "month",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Up to 10 team members", included: true },
      { text: "Shared workspace", included: true },
      { text: "Usage analytics dashboard", included: true },
      { text: "Custom branding", included: true },
      { text: "API access (coming soon)", included: true },
      { text: "Dedicated account manager", included: true },
    ],
    cta: "Contact Sales",
  },
];
