import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sand Wizard — Dan Farr',
  description: 'A desert survival game. Walk through the sand. Place it, remove it. Survive.',
};

export default function SandWizardPage() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4">
      <div
        className="border border-amber-900/40 w-full max-w-[1200px] aspect-video"
        style={{ background: '#1a0a00' }}
      >
        {/* SandWizardGame component goes here — added in Track D */}
        <div className="w-full h-full flex items-center justify-center text-amber-600 font-mono text-sm">
          canvas placeholder
        </div>
      </div>
    </main>
  );
}
