import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { assets } from '../assets/assets';

const Footer = () => {
  return (
    <footer className="bg-[#042028] text-white py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        
       
        <div>
          <img src={assets.logo} alt="NSBT Logo" className="w-[140px] mb-4" />
          <p className="text-sm text-gray-300">
            Empowering your vote with transparency, integrity, and real-time results.
          </p>
        </div>

     
        <div>
          <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-orange-400">Home</Link></li>
            <li><Link to="/vote/elections" className="hover:text-orange-400">Current Elections</Link></li>
            <li><Link to="/vote/candidates" className="hover:text-orange-400">View Candidates</Link></li>
            <li><Link to="/vote/results" className="hover:text-orange-400">Election Results</Link></li>
            <li><Link to="/admin" className="hover:text-orange-400">Admin</Link></li>
          </ul>
        </div>

      
        <div>
          <h4 className="text-lg font-semibold mb-4 text-white">Contact</h4>
          <p className="text-sm text-gray-300">123 Democracy Lane<br />Accra, Ghana</p>
          <p className="text-sm text-gray-300 mt-2">Email: info@nsbt.org</p>
          <p className="text-sm text-gray-300">Phone: +233 20 000 0000</p>
        </div>

    
        <div>
          <h4 className="text-lg font-semibold mb-4 text-white">Follow Us</h4>
          <div className="flex space-x-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-gray-700 hover:bg-blue-600 flex items-center justify-center transition duration-300">
              <FaFacebookF className="text-white text-lg" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-gray-700 hover:bg-blue-400 flex items-center justify-center transition duration-300">
              <FaTwitter className="text-white text-lg" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-gray-700 hover:bg-pink-500 flex items-center justify-center transition duration-300">
              <FaInstagram className="text-white text-lg" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-gray-700 hover:bg-blue-700 flex items-center justify-center transition duration-300">
              <FaLinkedinIn className="text-white text-lg" />
            </a>
          </div>
        </div>
      </div>

   
      <div className="mt-10 border-t border-gray-700 pt-4 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} NSBT. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
