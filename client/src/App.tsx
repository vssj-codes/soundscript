import { useState } from "react";
import TranscriptionForm from "./components/TranscriptionForm";
import TranscriptionTable from "./components/TranscriptionTable";

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div data-theme="light" className="min-h-screen bg-gray-100 flex flex-col">
      <div className="navbar bg-base-100 shadow-sm">
        <div className="container mx-auto">
          <div className="flex-1">
            <span className="text-xl font-semibold">SoundScript</span>
          </div>
        </div>
      </div>

      <main className="container bg-gray-100 mx-auto p-4 md:p-6 max-w-5xl flex-1 flex flex-col gap-6">
        <section>
          <TranscriptionForm onCreated={() => setRefreshKey((k) => k + 1)} />
        </section>
        <section className="flex-1">
          <TranscriptionTable refreshKey={refreshKey} />
        </section>
      </main>
    </div>
  );
}

export default App;
