import React from 'react';
import { ShieldCheck, Scale, Award, Handshake } from 'lucide-react';

const values = [
  {
    icon: <ShieldCheck className="text-white w-8 h-8" />,
    title: 'Discipline',
    description:
      'NSBT shall manage Client’s Trust and Schedules placed in its care with discipline.',
  },
  {
    icon: <Scale className="text-white w-8 h-8" />,
    title: 'Integrity',
    description:
      'NSBT shall be honest, fair, and consistent in accordance with the spirit of honorable conduct.',
  },
  {
    icon: <Award className="text-white w-8 h-8" />,
    title: 'Superior Service',
    description:
      'NSBT requires quality and excellence in all Client services, and all other undertakings.',
  },
  {
    icon: <Handshake className="text-white w-8 h-8" />,
    title: 'Commitment',
    description:
      'NSBT shall seek to understand and address Client’s issues and concerns in a timely manner.',
  },
];

const VisionSection = () => {
  return (
    <section className="bg-[#042028] text-white py-16 px-6 md:px-20">
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Core Values</h2>
        <p className="text-gray-300 max-w-xl mx-auto">
          At NSBT, we uphold the highest standards in all we do. Our values guide our mission and reflect our commitment to those we serve.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {values.map((value, index) => (
          <div
            key={index}
            className="bg-white/10 rounded-2xl p-6 text-left hover:bg-white/20 transition duration-300 shadow-md"
          >
            <div className="bg-orange-500 rounded-full w-14 h-14 flex items-center justify-center mb-4">
              {value.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
            <p className="text-gray-300 text-sm">{value.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default VisionSection;
