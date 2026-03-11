import React from 'react';
import { Facebook, Instagram, Linkedin, Music as TiktokIcon } from 'lucide-react';
import { SubCategory, Quiz, Notification } from './types';

export const socialLinks = [
  { label: 'Facebook', icon: Facebook, url: 'https://www.facebook.com/MirpurkhasAliTalpurTown/', color: 'hover:text-blue-600' },
  { label: 'Instagram', icon: Instagram, url: 'https://www.instagram.com/majid.maqsood01/?hl=en', color: 'hover:text-pink-600' },
  { label: 'LinkedIn', icon: Linkedin, url: 'https://www.linkedin.com/in/majid-maqsood-633444374/', color: 'hover:text-blue-700' },
  { label: 'TikTok', icon: TiktokIcon, url: 'https://www.tiktok.com/@majid.maqsood8', color: 'hover:text-zinc-900 dark:hover:text-white' }
];

export const LAW_SUBCATEGORIES: SubCategory[] = [
  { id: 'llb-s1', name: 'LLB Semester 1', description: 'Notes and tests for introductory law subjects.' },
  { id: 'llb-s2', name: 'LLB Semester 2', description: 'Core legal studies for second semester students.' },
  { id: 'llb-s3', name: 'LLB Semester 3', description: 'Advanced legal frameworks and case studies.' },
  { id: 'llb-s4', name: 'LLB Semester 4', description: 'Procedural law and specialization modules.' },
];

export const GENERAL_SUBCATEGORIES: SubCategory[] = [
  { id: 'mcat', name: 'MDCAT / MCAT', description: 'Medical & Dental College Admission Test comprehensive preparation.' },
  { id: 'ecat', name: 'ECAT', description: 'Engineering College Admission Test resources and modules.' },
  { id: 'ielts', name: 'IELTS', description: 'English proficiency testing and preparation tracks.' },
  { id: 'spsc', name: 'SPSC', description: 'Sindh Public Service Commission job test preparation.' },
  { id: 'sts', name: 'STS', description: 'SIBA Testing Services preparation modules.' },
  { id: 'hec', name: 'HEC/ ETC', description: 'Higher Education Commission and Education Testing Council tests.' },
  { id: 'pphi', name: 'PPHI', description: 'Peoples Primary Healthcare Initiative recruitment tests.' },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: 'LLB Exams 2026 Schedule', date: '2026-02-01', content: 'University has released the tentative dates for LLB annual examinations.', type: 'News' },
  { id: 'n2', title: 'IELTS Mock Session', date: '2026-02-05', content: 'Free mock speaking session this Sunday at 5 PM.', type: 'News' },
  { id: 'n3', title: 'SPSC Result Update', date: '2026-02-08', content: 'Results for the secondary school teacher positions are now live.', type: 'Result' },
];

export const MOCK_QUIZ: Quiz = {
  id: 'q1',
  title: 'Introduction to Legal Systems',
  subCategoryId: 'llb-s1',
  videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  questions: [
    {
      id: 'q1_1',
      text: 'What is the primary source of law in a civil law system?',
      options: ['Judicial Precedents', 'Codified Statutes', 'Customary Law', 'Religious Texts'],
      correctAnswer: 1
    }
  ]
};