import { BRAND_NAME } from "@/lib/brand";

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const faqItems: FAQItem[] = [
  {
    id: "1",
    question: "Are my files stored on your servers?",
    answer:
      "No. All processing happens locally in your browser. Your files never leave your device, ensuring complete privacy and security.",
  },
  {
    id: "2",
    question: "Is there a file size limit?",
    answer:
      "Free users can process files up to 50 MB. Pro subscribers enjoy unlimited file sizes and batch processing capabilities.",
  },
  {
    id: "3",
    question: "Do I need to create an account?",
    answer:
      `Yes. Sign up for a free account to use ${BRAND_NAME}. Your uploads and processed documents are saved to your profile.`,
  },
  {
    id: "4",
    question: "Which file formats are supported?",
    answer:
      "We support PDF, JPG, JPEG, PNG, and WebP for most conversion tools. Additional formats are coming soon.",
  },
  {
    id: "5",
    question: `Can I use ${BRAND_NAME} on mobile?`,
    answer: `Yes! ${BRAND_NAME} is fully responsive and works on phones, tablets, and desktops with the same powerful feature set.`,
  },
  {
    id: "6",
    question: "What's included in the Pro plan?",
    answer:
      "Pro unlocks unlimited file sizes, batch processing, priority processing speed, watermark removal, and premium support.",
  },
];
