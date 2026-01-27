import PricingSection from '@/components/pricing/PricingSection';

export const metadata = {
  title: 'Pricing - Python Ninja',
  description: 'Choose the perfect plan for your Python learning journey',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PricingSection />
    </div>
  );
}
