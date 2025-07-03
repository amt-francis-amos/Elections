import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { assets } from '../assets/assets';

const Footer = () => {
  return (
    <footer className="bg-[#0f172a] text-white pt-12 pb-8 px-4 sm:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        
        <div>
          <img src={assets.logo} alt="Logo" className="w-36 mb-4" />
          <p className="text-gray-300 text-sm">
            Empowering transparent, fair and secure voting for a better tomorrow. Join us in shaping the future.
          </p>
        </div>

       
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li><Link to="/" className="hover:text-blue-400 transition">Home</Link></li>
            <li><Link to="/vote/elections" className="hover:text-blue-400 transition">Current Elections</Link></li>
            <li><Link to="/vote/candidates" className="hover:text-blue-400 transition">View Candidates</Link></li>
            <li><Link to="/vote/results" className="hover:text-blue-400 transition">Election Results</Link></li>
            <li><Link to="/admin" className="hover:text-blue-400 transition">Admin</Link></li>
          </ul>
        </div>

      
        <div>
          <h3 className="text-lg font-semibold mb-4">Contact</h3>
          <ul className="space-y-3 text-gray-300 text-sm">
            <li className="flex items-start gap-2">
              <MapPin size={16} />
              <span>Accra, Ghana</span>
            </li>
            <li className="flex items-start gap-2">
              <Mail size={16} />
              <span>info@nsbtghana.org</span>
            </li>
            <li className="flex items-start gap-2">
              <Phone size={16} />
              <span>+233 55 123 4567</span>
            </li>
          </ul>
        </div>

     
        <div>
          <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-blue-400 transition">
              <Facebook size={20} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-blue-400 transition">
              <Twitter size={20} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-blue-400 transition">
              <Instagram size={20} />
            </a>
          </div>
        </div>
      </div>

      
      <div className="mt-12 border-t border-gray-700 pt-6 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} NSBT Ghana. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
