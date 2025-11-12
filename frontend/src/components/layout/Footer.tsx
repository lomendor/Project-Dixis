export default function Footer(){
  return (
    <footer className="border-t bg-white mt-12">
      <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-neutral-600 flex flex-wrap gap-3 items-center justify-between">
        <div>© Dixis — τοπικοί παραγωγοί</div>
        <nav className="flex gap-4">
          <a className="underline" href="/legal/privacy">Απόρρητο</a>
          <a className="underline" href="/legal/terms">Όροι</a>
        </nav>
      </div>
    </footer>
  );
}
