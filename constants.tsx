
import React from 'react';
import { SubCategory, Quiz, Notification } from './types';

export const LAW_SUBCATEGORIES: SubCategory[] = [
  { id: 'lat', name: 'LAT (Law Admission Test)', description: 'Entry test preparation for 5-year LLB programs.' },
  { id: 'law-gat', name: 'LAW GAT', description: 'Graduate Assessment Test for Bar Council registration.' },
  { id: 'llb-s1', name: 'LLB Semester 1', description: 'Notes and tests for introductory law subjects.' },
  { id: 'llb-s2', name: 'LLB Semester 2', description: 'Core legal studies for second semester students.' },
  { id: 'llb-s3', name: 'LLB Semester 3', description: 'Advanced legal frameworks and case studies.' },
  { id: 'llb-s4', name: 'LLB Semester 4', description: 'Procedural law and specialization modules.' },
];

export const GENERAL_SUBCATEGORIES: SubCategory[] = [
  { id: 'mcat', name: 'MCAT', description: 'Medical College Admission Test preparation.' },
  { id: 'ecat', name: 'ECAT', description: 'Engineering College Admission Test resources.' },
  { id: 'ielts', name: 'IELTS', description: 'International English Language Testing System.' },
  { id: 'spsc', name: 'SPSC', description: 'Sindh Public Service Commission job tests.' },
  { id: 'iba', name: 'IBA Sukkur', description: 'Teachers and Magistrate test preparation.' },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: 'LAT Result 2026 Announced', date: '2026-02-01', content: 'The HEC has released the official results for the Jan 2026 LAT.', type: 'Result' },
  { id: 'n2', title: 'LAW GAT Registration Open', date: '2026-02-05', content: 'Apply for the upcoming Law GAT before Feb 28th.', type: 'Test Date' },
  { id: 'n3', title: 'SPSC New Vacancies', date: '2026-02-08', content: 'Consolidated advertisement for various magistrate positions released.', type: 'News' },
];

export const MOCK_QUIZ: Quiz = {
  id: 'q1',
  title: 'Constitution of Pakistan - Part I',
  subCategoryId: 'law-gat',
  videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Sample video
  questions: [
    {
      id: 'q1_1',
      text: 'Which article of the 1973 Constitution deals with the Definition of the State?',
      options: ['Article 2', 'Article 7', 'Article 1', 'Article 4'],
      correctAnswer: 1
    },
    {
      id: 'q1_2',
      text: 'Objective Resolution was passed in which year?',
      options: ['1947', '1948', '1949', '1956'],
      correctAnswer: 2
    },
    {
      id: 'q1_3',
      text: 'Who is the Head of State in Pakistan?',
      options: ['Prime Minister', 'Chief Justice', 'President', 'Army Chief'],
      correctAnswer: 2
    },
    {
      id: 'q1_4',
      text: 'The Senate of Pakistan consists of how many members?',
      options: ['104', '96', '100', '150'],
      correctAnswer: 1
    },
    {
      id: 'q1_5',
      text: 'High Courts are established under which article?',
      options: ['Article 175', 'Article 192', 'Article 184', 'Article 212'],
      correctAnswer: 1
    }
  ]
};
