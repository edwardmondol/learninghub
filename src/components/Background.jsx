export default function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-950">
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-fuchsia-600/30 blur-3xl animate-blob" />
      <div
        className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl animate-blob"
        style={{ animationDelay: '3s' }}
      />
      <div
        className="absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-cyan-500/30 blur-3xl animate-blob"
        style={{ animationDelay: '6s' }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0,rgba(2,6,23,0.6)_100%)]" />
    </div>
  )
}
