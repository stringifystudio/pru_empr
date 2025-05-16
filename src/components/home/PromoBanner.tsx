import React from 'react';
import { Truck, Shield, CreditCard, LifeBuoy } from 'lucide-react';

const PromoBanner: React.FC = () => {
  const benefits = [
    {
      icon: <Truck size={48} className="mb-4 text-blue-600" />,
      title: 'Free Shipping',
      description: 'On orders over $50',
    },
    {
      icon: <Shield size={48} className="mb-4 text-blue-600" />,
      title: 'Secure Payments',
      description: '100% secure checkout',
    },
    {
      icon: <CreditCard size={48} className="mb-4 text-blue-600" />,
      title: 'Easy Returns',
      description: '30-day return policy',
    },
    {
      icon: <LifeBuoy size={48} className="mb-4 text-blue-600" />,
      title: '24/7 Support',
      description: "We're here to help",
    },
  ];

  return (
    <div className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm transition-transform duration-300 hover:shadow-md hover:-translate-y-1"
            >
              {benefit.icon}
              <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;