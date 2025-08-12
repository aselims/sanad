import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';

interface FAQProps {
  onBack: () => void;
}

interface FAQItem {
  question: string;
  answer: string;
}

export function FAQ({ onBack }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  const faqItems: FAQItem[] = [
    {
      question: "What is Collopi?",
      answer: "Collopi is a platform that connects innovators with challenges and partnership opportunities. We facilitate collaboration between individuals, startups, research institutions, corporations, and government entities to solve complex problems and drive innovation."
    },
    {
      question: "How do I create an account?",
      answer: "To create an account, click on the 'Login / Register' button in the top right corner of the homepage. Follow the registration process by providing your email, creating a password, and completing your profile information."
    },
    {
      question: "Is Collopi free to use?",
      answer: "Collopi offers both free and premium tiers. The basic account is free and allows you to browse opportunities and create a profile. Premium accounts offer additional features such as advanced search, priority matching, and analytics tools."
    },
    {
      question: "How are matches determined?",
      answer: "Our matching algorithm considers multiple factors including skills, experience, interests, and past collaborations. We use a combination of AI technology and human expertise to suggest the most promising connections between innovators and opportunities."
    },
    {
      question: "Can I post both challenges and partnerships?",
      answer: "Yes, organizations can post both challenges (specific problems that need solutions) and partnerships (collaborative opportunities). Individuals can respond to these opportunities or propose their own partnership ideas."
    },
    {
      question: "How do I express interest in a collaboration?",
      answer: "When viewing a challenge or partnership that interests you, click the 'Express Interest' button. You'll be prompted to explain why you're a good fit and what you can contribute to the collaboration."
    },
    {
      question: "What happens after I express interest?",
      answer: "The organization or individual who posted the opportunity will review your expression of interest. If they believe you're a good fit, they'll initiate a conversation through our platform to discuss next steps."
    },
    {
      question: "How are intellectual property rights handled?",
      answer: "Collopi provides templates for collaboration agreements that address intellectual property rights. However, we recommend that all parties consult with legal professionals to establish formal agreements before beginning substantive work together."
    },
    {
      question: "Can I update my profile after creating it?",
      answer: "Yes, you can update your profile at any time by clicking on your profile picture in the top right corner and selecting 'Your Profile'. From there, you can edit your information, update your skills, and add new experiences."
    },
    {
      question: "How can I get help if I have a problem?",
      answer: "For technical issues or questions about using the platform, visit our Support page or contact us at support@collopi.com. Our team is available to help you navigate the platform and resolve any issues you encounter."
    }
  ];
  
  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
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
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h1>
            
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <div 
                  key={index} 
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    className="w-full flex justify-between items-center p-4 text-left focus:outline-none"
                    onClick={() => toggleFAQ(index)}
                  >
                    <span className="font-medium text-gray-900">{item.question}</span>
                    {openIndex === index ? (
                      <ChevronUp className="h-5 w-5 text-indigo-600" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  
                  {openIndex === index && (
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                      <p className="text-gray-700">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-4 bg-indigo-50 rounded-lg">
              <p className="text-indigo-800">
                Still have questions? Contact our support team at{' '}
                <a href="mailto:support@collopi.com" className="font-medium underline">
                  support@collopi.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 