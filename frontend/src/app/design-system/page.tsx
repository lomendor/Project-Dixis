'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast, ToastTitle, ToastDescription, ToastClose } from '@/components/ui/Toast';

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2 greek-text">
            UI Design System
          </h1>
          <p className="text-neutral-600 greek-text">
            Σύστημα σχεδιασμού με Greek-optimized components
          </p>
        </header>

        {/* Colors */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Colors</h2>
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-primary-500 rounded"></div>
            <div className="w-12 h-12 bg-secondary-500 rounded"></div>
            <div className="w-12 h-12 bg-error-500 rounded"></div>
          </div>
        </section>

        {/* Buttons */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Buttons</h2>
          <div className="flex gap-2">
            <Button variant="primary">Primary</Button>
            <Button variant="outline">Outline</Button>
          </div>
        </section>

        {/* Inputs */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Inputs</h2>
          <Input label="Όνομα" placeholder="Εισάγετε όνομα" />
        </section>

        {/* Toast */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Toast</h2>
          <Toast variant="success">
            <ToastTitle>Επιτυχία!</ToastTitle>
            <ToastDescription>Η ενέργεια ολοκληρώθηκε.</ToastDescription>
            <ToastClose />
          </Toast>
        </section>
      </div>
    </div>
  );
}