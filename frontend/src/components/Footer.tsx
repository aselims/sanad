import React from 'react';
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Github } from 'lucide-react';

interface FooterProps {
  onNavigateToTerms: () => void;
  onNavigateToPrivacy: () => void;
  onNavigateToCookies: () => void;
  onNavigateToContactUs: () => void;
  onNavigateToFAQ: () => void;
}

export function Footer({
  onNavigateToTerms,
  onNavigateToPrivacy,
  onNavigateToCookies,
  onNavigateToContactUs,
  onNavigateToFAQ
}: FooterProps) {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About Saned</h3>
            <p className="text-gray-400 text-sm">
              Saned is a platform connecting innovators, startups, researchers, and investors to foster collaboration and drive sustainable development in the MENA region.
            </p>
            <div className="mt-4 flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <Twitter size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <Instagram size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button onClick={onNavigateToFAQ} className="hover:text-white">
                  FAQ
                </button>
              </li>
              <li>
                <button onClick={onNavigateToContactUs} className="hover:text-white">
                  Contact Us
                </button>
              </li>
              <li>
                <a href="#partnerships" className="hover:text-white">
                  Partnerships
                </a>
              </li>
              <li>
                <a href="#challenges" className="hover:text-white">
                  Challenges
                </a>
              </li>
              <li>
                <a href="#ideas" className="hover:text-white">
                  Ideas
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button onClick={onNavigateToTerms} className="hover:text-white">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={onNavigateToPrivacy} className="hover:text-white">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={onNavigateToCookies} className="hover:text-white">
                  Cookie Policy
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center">
                <MapPin size={16} className="mr-2" />
                <span>Riyadh, Sinai, Duesseldorf</span>
              </li>
              <li className="flex items-center">
                <Phone size={16} className="mr-2" />
                <span>+94 17676796292</span>
              </li>
              <li className="flex items-center">
                <Mail size={16} className="mr-2" />
                <span>s@selimsalman.de</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Saned Platform. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm mt-4 md:mt-0 flex items-center">
            Made with <Heart size={16} className="mx-1 text-red-500" /> For the MENA region and the world
          </p>
        </div>
      </div>
    </footer>
  );
} 