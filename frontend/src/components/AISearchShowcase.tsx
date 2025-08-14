import React, { useState, useEffect } from 'react';
import { Bot, Search, ArrowRight, Sparkles } from 'lucide-react';

interface AISearchShowcaseProps {
  onTrySearch: (query: string) => void;
}

export function AISearchShowcase({ onTrySearch }: AISearchShowcaseProps) {
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const examples = [
    "Find AI startups in healthcare",
    "Connect me with blockchain researchers",
    "Show partnerships in renewable energy",
    "Find corporate innovation challenges",
    "Discover fintech investors in Dubai"
  ];

  useEffect(() => {
    const currentExample = examples[currentExampleIndex];
    let timeoutId: NodeJS.Timeout;

    if (isTyping) {
      // Typing animation
      if (displayText.length < currentExample.length) {
        timeoutId = setTimeout(() => {
          setDisplayText(currentExample.substring(0, displayText.length + 1));
        }, 100);
      } else {
        // Finished typing, wait then start erasing
        timeoutId = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    } else {
      // Erasing animation
      if (displayText.length > 0) {
        timeoutId = setTimeout(() => {
          setDisplayText(displayText.substring(0, displayText.length - 1));
        }, 50);
      } else {
        // Finished erasing, move to next example
        setCurrentExampleIndex((prev) => (prev + 1) % examples.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [displayText, isTyping, currentExampleIndex, examples]);

  const handleTryAI = () => {
    onTrySearch(examples[currentExampleIndex]);
  };

  return (
    <section className="py-16 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
      <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-10 left-10 w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full blur-2xl opacity-25"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-white/10 text-white backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4 mr-2" />
            AI-Powered Search
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left side - Demo */}
              <div>
                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-700 mb-3 block">
                    Try asking our AI:
                  </label>
                  <div className="relative">
                    <div className="flex items-center bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-200">
                      <Bot className="h-5 w-5 text-indigo-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-800 font-medium">
                        {displayText}
                        <span className="animate-pulse">|</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleTryAI}
                    className="w-full bg-indigo-600 text-white rounded-lg px-6 py-3 font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Try This Search
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    Available for everyone • 3 free searches per day
                  </p>
                </div>
              </div>

              {/* Right side - Features */}
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-indigo-100 rounded-full p-2 mr-4 flex-shrink-0">
                    <Bot className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Natural Language</h4>
                    <p className="text-gray-600 text-sm">
                      Ask questions like you would to a human assistant
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-purple-100 rounded-full p-2 mr-4 flex-shrink-0">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Smart Matching</h4>
                    <p className="text-gray-600 text-sm">
                      AI understands context and finds relevant connections
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-2 mr-4 flex-shrink-0">
                    <ArrowRight className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Instant Results</h4>
                    <p className="text-gray-600 text-sm">
                      Get personalized matches in seconds, not hours
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}