import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import FAQSchema from '../SEO/FAQSchema';

/**
 * FAQ Component with Schema Markup for AEO
 * Includes structured data for better SEO and voice search optimization
 */
const FAQ = ({ faqs = [], title = "Frequently Asked Questions", className = "" }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (faqs.length === 0) return null;

  return (
    <section className={`bg-white rounded-xl shadow-sm p-8 ${className}`} aria-labelledby="faq-heading">
      <FAQSchema faqs={faqs} />
      
      <div className="flex items-center gap-3 mb-6">
        <HelpCircle className="h-8 w-8 text-blue-600" aria-hidden="true" />
        <h2 id="faq-heading" className="text-3xl font-bold text-gray-900">{title}</h2>
      </div>

      <div className="space-y-4" itemScope itemType="https://schema.org/FAQPage">
        {faqs.map((faq, index) => (
          <article 
            key={index} 
            className="border border-gray-200 rounded-lg overflow-hidden"
            itemScope 
            itemProp="mainEntity" 
            itemType="https://schema.org/Question"\n          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full text-left px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between"
              aria-expanded={openIndex === index}
              aria-controls={`faq-answer-${index}`}
            >
              <h3 
                className="text-lg font-semibold text-gray-900 pr-8"
                itemProp="name"
              >
                {faq.question}
              </h3>
              {openIndex === index ? (
                <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" aria-hidden="true" />
              )}
            </button>
            {openIndex === index && (
              <div 
                id={`faq-answer-${index}`}
                className="px-6 py-4 bg-white"
                itemScope 
                itemProp="acceptedAnswer" 
                itemType="https://schema.org/Answer"
              >
                <div 
                  className="text-gray-700 leading-relaxed"
                  itemProp="text"
                  dangerouslySetInnerHTML={{ __html: faq.answer }}
                />
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
