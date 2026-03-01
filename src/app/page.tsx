export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-6xl font-bold text-primary">
          Ava Park
        </h1>
        <p className="font-body text-xl text-text-secondary mt-4">
          Your Escape Into Nature
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <span className="px-4 py-2 bg-primary text-white rounded-full text-sm">Primary</span>
          <span className="px-4 py-2 bg-secondary text-white rounded-full text-sm">Secondary</span>
          <span className="px-4 py-2 bg-accent text-white rounded-full text-sm">Accent</span>
        </div>
      </div>
    </div>
  );
}
