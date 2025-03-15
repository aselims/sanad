import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface LegalPageProps {
  onBack: () => void;
  pageType: 'terms' | 'privacy' | 'cookies';
}

export function LegalPage({ onBack, pageType }: LegalPageProps) {
  const getPageTitle = () => {
    switch (pageType) {
      case 'terms':
        return 'Terms of Service';
      case 'privacy':
        return 'Privacy Policy';
      case 'cookies':
        return 'Cookie Policy';
      default:
        return '';
    }
  };
  
  const renderTermsContent = () => (
    <div className="prose prose-indigo max-w-none">
      <p>
        Welcome to Saned. By accessing or using our platform, you agree to be bound by these Terms of Service.
      </p>
      
      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using the Saned platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
      </p>
      
      <h2>2. Use License</h2>
      <p>
        Permission is granted to temporarily use the Saned platform for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
      </p>
      <ul>
        <li>Modify or copy the materials;</li>
        <li>Use the materials for any commercial purpose;</li>
        <li>Attempt to decompile or reverse engineer any software contained on the Saned platform;</li>
        <li>Remove any copyright or other proprietary notations from the materials; or</li>
        <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
      </ul>
      
      <h2>3. User Accounts</h2>
      <p>
        To access certain features of the platform, you may be required to create an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
      </p>
      
      <h2>4. User Content</h2>
      <p>
        Users may post content to the platform, including but not limited to profiles, project descriptions, and comments. You retain ownership of your content, but grant Saned a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, and distribute your content in any existing or future media.
      </p>
      
      <h2>5. Intellectual Property</h2>
      <p>
        The Saned platform and its original content, features, and functionality are owned by Saned and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
      </p>
      
      <h2>6. Revenue Sharing Model</h2>
      <p>
        Innovators contribute just 1% of revenue generated from successful collaborations. You only pay when you succeed. This fair model ensures that our platform remains accessible to all innovators while sustainably supporting our services.
      </p>
      <p>
        The 1% contribution applies only to revenue directly generated from collaborations facilitated through our platform. No upfront fees or charges will be applied before your project generates revenue.
      </p>
      
      <h2>7. Termination</h2>
      <p>
        We may terminate or suspend your account and bar access to the platform immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
      </p>
      
      <h2>8. Limitation of Liability</h2>
      <p>
        In no event shall Saned, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the platform.
      </p>
      
      <h2>9. Changes to Terms</h2>
      <p>
        Saned reserves the right, at its sole discretion, to modify or replace these Terms at any time. It is your responsibility to check these Terms periodically for changes.
      </p>
      
      <h2>10. Contact Us</h2>
      <p>
        If you have any questions about these Terms, please contact us at legal@Saned.com.
      </p>
    </div>
  );
  
  const renderPrivacyContent = () => (
    <div className="prose prose-indigo max-w-none">
      <p>
        At Saned, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
      </p>
      
      <h2>1. Information We Collect</h2>
      <p>
        We collect information that you provide directly to us, such as when you create an account, update your profile, or communicate with us. This may include:
      </p>
      <ul>
        <li>Personal identifiers (name, email address, phone number)</li>
        <li>Professional information (organization, position, expertise)</li>
        <li>Profile information (biography, profile picture)</li>
        <li>Communications you send to us</li>
      </ul>
      
      <p>
        We also automatically collect certain information when you use our platform, including:
      </p>
      <ul>
        <li>Log information (IP address, browser type, pages visited)</li>
        <li>Device information (hardware model, operating system)</li>
        <li>Usage information (interactions with the platform)</li>
      </ul>
      
      <h2>2. How We Use Your Information</h2>
      <p>
        We use the information we collect to:
      </p>
      <ul>
        <li>Provide, maintain, and improve our platform</li>
        <li>Create and maintain your account</li>
        <li>Process transactions</li>
        <li>Send technical notices, updates, and support messages</li>
        <li>Respond to your comments, questions, and requests</li>
        <li>Develop new products and services</li>
        <li>Monitor and analyze trends, usage, and activities</li>
        <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
        <li>Personalize and improve your experience</li>
      </ul>
      
      <h2>3. Sharing of Information</h2>
      <p>
        We may share your information with:
      </p>
      <ul>
        <li>Other users of the platform as part of your profile and interactions</li>
        <li>Service providers who perform services on our behalf</li>
        <li>Business partners with whom we jointly offer products or services</li>
        <li>Legal authorities when required by law or to protect our rights</li>
      </ul>
      
      <h2>4. Data Security</h2>
      <p>
        We implement appropriate technical and organizational measures to protect the security of your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, so we cannot guarantee absolute security.
      </p>
      
      <h2>5. Your Rights</h2>
      <p>
        Depending on your location, you may have certain rights regarding your personal information, such as the right to access, correct, delete, or restrict processing of your personal information.
      </p>
      
      <h2>6. Changes to This Privacy Policy</h2>
      <p>
        We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
      </p>
      
      <h2>7. Contact Us</h2>
      <p>
        If you have any questions about this Privacy Policy, please contact us at privacy@Saned.com.
      </p>
    </div>
  );
  
  const renderCookiesContent = () => (
    <div className="prose prose-indigo max-w-none">
      <p>
        This Cookie Policy explains how Saned uses cookies and similar technologies to recognize you when you visit our platform.
      </p>
      
      <h2>1. What are Cookies?</h2>
      <p>
        Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners to make their websites work, or to work more efficiently, as well as to provide reporting information.
      </p>
      
      <h2>2. How We Use Cookies</h2>
      <p>
        We use cookies for the following purposes:
      </p>
      <ul>
        <li><strong>Essential Cookies:</strong> These cookies are necessary for the platform to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in, or filling in forms.</li>
        <li><strong>Performance Cookies:</strong> These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our platform. They help us to know which pages are the most and least popular and see how visitors move around the platform.</li>
        <li><strong>Functionality Cookies:</strong> These cookies enable the platform to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.</li>
        <li><strong>Targeting Cookies:</strong> These cookies may be set through our platform by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant advertisements on other sites.</li>
      </ul>
      
      <h2>3. Types of Cookies We Use</h2>
      <p>
        We use both session cookies (which expire once you close your web browser) and persistent cookies (which stay on your device until you delete them).
      </p>
      
      <h2>4. Third-Party Cookies</h2>
      <p>
        In addition to our own cookies, we may also use various third-party cookies to report usage statistics of the platform, deliver advertisements, and so on.
      </p>
      
      <h2>5. Controlling Cookies</h2>
      <p>
        Most web browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites to set cookies, you may worsen your overall user experience, since it will no longer be personalized to you.
      </p>
      
      <h2>6. Changes to This Cookie Policy</h2>
      <p>
        We may update our Cookie Policy from time to time. We will notify you of any changes by posting the new Cookie Policy on this page and updating the "Last Updated" date.
      </p>
      
      <h2>7. Contact Us</h2>
      <p>
        If you have any questions about this Cookie Policy, please contact us at privacy@Saned.com.
      </p>
    </div>
  );
  
  const renderContent = () => {
    switch (pageType) {
      case 'terms':
        return renderTermsContent();
      case 'privacy':
        return renderPrivacyContent();
      case 'cookies':
        return renderCookiesContent();
      default:
        return null;
    }
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
            <h1 className="text-3xl font-bold text-gray-900 mb-6">{getPageTitle()}</h1>
            <div className="text-sm text-gray-500 mb-8">
              Last Updated: June 1, 2023
            </div>
            
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
} 