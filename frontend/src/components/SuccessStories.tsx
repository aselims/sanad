import React from 'react';
import { ArrowLeft, Award, Users, Lightbulb, Rocket } from 'lucide-react';

interface SuccessStoriesProps {
  onBack: () => void;
}

export function SuccessStories({ onBack }: SuccessStoriesProps) {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Success Stories</h1>
            
            <div className="space-y-12">
              <div className="border-b border-gray-200 pb-10">
                <div className="flex items-center mb-4">
                  <div className="bg-indigo-100 p-3 rounded-full mr-4">
                    <Rocket className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Smart City Transportation Initiative</h2>
                </div>
                
                <p className="text-gray-600 mb-6">
                  A collaboration between the Ministry of Transport and three local tech startups 
                  resulted in an AI-driven traffic management system that reduced congestion by 30% 
                  in major urban areas. The project, which began as a challenge posted on Collopi, 
                  is now being implemented in five cities nationwide.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="italic text-gray-700">
                    "Collopi helped us find the perfect partners for our smart city initiative. 
                    The platform's matching algorithm connected us with startups that had exactly 
                    the expertise we needed. What would have taken months through traditional 
                    procurement processes took just weeks with Collopi."
                  </p>
                  <p className="mt-2 font-medium text-gray-900">
                    — Ahmed Al-Farsi, Director of Innovation, Ministry of Transport
                  </p>
                </div>
              </div>
              
              <div className="border-b border-gray-200 pb-10">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 p-3 rounded-full mr-4">
                    <Lightbulb className="h-8 w-8 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Healthcare AI Research Partnership</h2>
                </div>
                
                <p className="text-gray-600 mb-6">
                  A research institution partnered with a healthcare provider and an AI startup 
                  to develop algorithms for early disease detection. Their collaboration, facilitated 
                  through Collopi, led to a breakthrough diagnostic tool that is now in clinical trials 
                  and has received $5 million in additional funding.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="italic text-gray-700">
                    "As a small AI startup, we struggled to get the attention of major healthcare 
                    institutions. Collopi changed that by giving us visibility and credibility. 
                    Our partnership has not only advanced medical science but also helped our 
                    company grow from 5 to 30 employees in just 18 months."
                  </p>
                  <p className="mt-2 font-medium text-gray-900">
                    — Dr. Sarah Chen, CEO, MedAI Solutions
                  </p>
                </div>
              </div>
              
              <div>
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Sustainable Agriculture Initiative</h2>
                </div>
                
                <p className="text-gray-600 mb-6">
                  A partnership between agricultural researchers, technology developers, and local 
                  farming communities led to the creation of a water-efficient irrigation system 
                  that has been adopted by over 200 farms. The project, which began as a challenge 
                  on Collopi, has reduced water usage by 40% while increasing crop yields by 15%.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="italic text-gray-700">
                    "Collopi brought together partners we would never have found on our own. 
                    The diverse perspectives and expertise in our collaboration were key to 
                    developing a solution that works in real-world conditions and addresses 
                    the needs of actual farmers."
                  </p>
                  <p className="mt-2 font-medium text-gray-900">
                    — Mohammed Al-Jabri, Lead Researcher, Agricultural Innovation Center
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