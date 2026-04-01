import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sand Wizard — Dan Farr',
};

export default function SandWizardPage() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center">
      <div
        className="border border-amber-900/40"
        style={{ width: 1200, height: 675, background: '#1a0a00' }}
      >
        {/* SandWizardGame component goes here — added in Track D */}
        <div className="w-full h-full flex items-center justify-center text-amber-600 font-mono text-sm">
          canvas placeholder
        </div>
      </div>
    </main>
  );
}
