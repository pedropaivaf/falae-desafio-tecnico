import { FeedbackDashboard } from "./components/FeedbackDashboard";

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-brand-teal px-6 py-4 text-white shadow-sm">
        <h1 className="text-xl font-semibold">Falaê! — Painel de Feedbacks</h1>
      </header>
      <main className="p-6">
        <FeedbackDashboard />
      </main>
    </div>
  );
}

export default App;
