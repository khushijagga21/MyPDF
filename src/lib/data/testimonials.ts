import { BRAND_NAME } from "@/lib/brand";

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  rating: number;
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Chen",
    role: "Product Designer",
    company: "Lumina Studio",
    avatar: "SC",
    content:
      `${BRAND_NAME} has completely replaced our old workflow. Merging and compressing files takes seconds, and the interface is gorgeous.`,
    rating: 5,
  },
  {
    id: "2",
    name: "Marcus Rivera",
    role: "Operations Manager",
    company: "Northwind Logistics",
    avatar: "MR",
    content:
      "We process hundreds of documents weekly. The tools are intuitive enough that our whole team adopted them without training.",
    rating: 5,
  },
  {
    id: "3",
    name: "Elena Volkov",
    role: "Freelance Illustrator",
    company: "Self-employed",
    avatar: "EV",
    content:
      `Converting my portfolio to PDF and back to JPG for clients used to be a hassle. ${BRAND_NAME} makes it feel effortless.`,
    rating: 5,
  },
  {
    id: "4",
    name: "James Okonkwo",
    role: "Legal Assistant",
    company: "Harbor & Co.",
    avatar: "JO",
    content:
      "Splitting large case files by page range is exactly what I needed. Clean UI, no clutter — just gets the job done.",
    rating: 4,
  },
];
