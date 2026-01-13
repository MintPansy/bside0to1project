'use client';

import { useState } from 'react';

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition"
      >
        <span className="font-semibold text-gray-900">{question}</span>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-gray-50 text-gray-700">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function FAQAccordion() {
  const faqs = [
    {
      question: 'LearnTeam은 무료인가요?',
      answer: '네, 무료로 시작할 수 있습니다. 기본 기능은 모두 무료로 이용하실 수 있습니다.',
    },
    {
      question: '팀 초대는 어떻게 하나요?',
      answer: '팀을 생성한 후 초대 링크를 생성하여 팀원에게 공유하면 됩니다. 초대 링크는 7일간 유효합니다.',
    },
    {
      question: '포트폴리오는 어떻게 생성되나요?',
      answer: '팀의 학습 로그를 기반으로 자동으로 포트폴리오가 생성됩니다. 마크다운 형식으로 생성되며, 필요에 따라 수정할 수 있습니다.',
    },
    {
      question: '데이터는 안전한가요?',
      answer: '네, Supabase를 통해 안전하게 저장되며, Row Level Security(RLS)를 통해 데이터 접근을 제어합니다.',
    },
  ];

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <FAQItem key={index} question={faq.question} answer={faq.answer} />
      ))}
    </div>
  );
}

