import { Metadata } from 'next';
import SandWizardGame from '../../../components/sand-wizard/SandWizardGame';

export const metadata: Metadata = {
  title: 'Sand Wizard — Can you survive the desert?',
  description: 'Place sand to save a tiny wizard from boulders, falling rocks, and dust devils. How far can you go?',
  openGraph: {
    title: 'Sand Wizard 🧙‍♂️🏜️',
    description: 'Place sand to save a tiny wizard from boulders, falling rocks, and dust devils. How far can you go?',
    type: 'website',
    images: ['/wizard-walk.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sand Wizard 🧙‍♂️🏜️',
    description: 'Place sand to save a tiny wizard. How far can you survive?',
    images: ['/wizard-walk.png'],
  },
};

export default function SandWizardPage() {
  return (
    <main className="min-h-dvh bg-black flex items-center justify-center p-0 sm:p-4">
      <div
        className="border-0 sm:border border-amber-900/40 w-full max-w-[1200px] aspect-video"
        style={{ background: '#1a0a00' }}
      >
        <SandWizardGame />
      </div>
    </main>
  );
}
