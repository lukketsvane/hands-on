import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Handsign | Learn ASL using AI camera',
  description: 'A simple ASL (American Sign Language) alphabet detection using TensorFlow and Handpose model.',
  openGraph: {
    title: 'Handsign | Learn ASL using AI camera',
    description: 'A simple ASL (American Sign Language) alphabet detection using TensorFlow and Handpose model.',
    images: [{ url: 'https://handsign.vercel.app/og-image.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Handsign | Learn ASL using AI camera',
    description: 'A simple ASL (American Sign Language) alphabet detection using TensorFlow and Handpose model.',
    images: ['https://handsign.vercel.app/twitter-image.png'],
  },
}

