export default function Header({ onReset }: { onReset: () => void }) {
  return (
    <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="bg-slate-900 text-white font-bold p-2 rounded">FD</div>
        <div>
          <h1 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Federated DAO
          </h1>
          <h2 className="text-xl font-bold">Proof-of-Learning Console</h2>
        </div>
      </div>
      <div className="flex-1 text-center">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Live Project Demonstration
        </p>
        <h3 className="text-2xl font-bold text-slate-800">
          Real-time federated training governed by a DAO
        </h3>
      </div>
      <button
        onClick={onReset}
        className="px-4 py-2 border rounded-md font-medium hover:bg-slate-50"
      >
        Reset
      </button>
    </header>
  );
}
