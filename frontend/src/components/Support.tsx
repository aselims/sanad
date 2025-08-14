import React, { useState } from 'react';
import { ArrowLeft, Send, MessageCircle, FileText, HelpCircle } from 'lucide-react';

interface SupportProps {
  onBack: () => void;
}

export function Support({ onBack }: SupportProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, this would send the support request to a backend
    setSubmitted(true);
    // Reset form
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={onBack}
          className="flex items-center text-indigo-600 hover:text-indigo-800 mb-8"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Home
        </button>
        
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Support Center</h1>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Get Help</h2>
                
                {submitted ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <p className="text-green-800 font-medium">
                      Thank you for reaching out! We've received your message and will respond shortly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                      </label>
                      <textarea
                        id="message"
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      ></textarea>
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </button>
                  </form>
                )}
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Support Resources</h2>
                
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start">
                      <div className="bg-indigo-100 p-2 rounded-full mr-3">
                        <FileText className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Documentation</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Comprehensive guides and tutorials to help you navigate the platform.
                        </p>
                        <a href="#" className="text-sm text-indigo-600 font-medium mt-2 inline-block">
                          View Documentation
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start">
                      <div className="bg-indigo-100 p-2 rounded-full mr-3">
                        <HelpCircle className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">FAQ</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Find answers to commonly asked questions about using Collopi.
                        </p>
                        <a href="#" className="text-sm text-indigo-600 font-medium mt-2 inline-block">
                          View FAQ
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start">
                      <div className="bg-indigo-100 p-2 rounded-full mr-3">
                        <MessageCircle className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Community Forum</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Connect with other users to share experiences and get advice.
                        </p>
                        <a href="#" className="text-sm text-indigo-600 font-medium mt-2 inline-block">
                          Join the Community
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 bg-indigo-50 rounded-lg p-4">
                  <h3 className="font-medium text-indigo-800 mb-2">Contact Information</h3>
                  <p className="text-sm text-indigo-700">
                    Email: support@collopi.com<br />
                    Phone: +971 4 123 4567<br />
                    Hours: Sunday-Thursday, 9am-6pm GST
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 