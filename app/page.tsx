import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/50 via-purple-950/50 to-black"></div>
      <div className="absolute inset-0">
        <div className="absolute w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] top-20 left-20 animate-pulse"></div>
        <div className="absolute w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] bottom-20 right-20 animate-pulse"></div>
      </div>

      <div className="relative z-10">
        {/* Nav */}
        <nav className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl shadow-2xl">
                🏙️
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">SmartCity AI</h1>
                <p className="text-xs text-blue-400">Emergency Response</p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-2xl transition text-lg"
            >
              🚀 Launch Dashboard
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="container mx-auto px-6 py-32">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/50 rounded-full px-6 py-3 mb-10">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </div>
              <span className="text-green-300 text-sm font-bold">System Online</span>
            </div>

            <h1 className="text-7xl md:text-8xl font-black text-white mb-8 leading-tight">
              The Future of<br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Emergency Response
              </span>
            </h1>

            <p className="text-2xl text-blue-200 mb-12 max-w-3xl mx-auto">
              Multi-agent AI system coordinating fire, police, and medical emergencies in real-time
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-600/30 to-blue-700/30 border-2 border-blue-400/50 rounded-3xl p-10 shadow-2xl">
                <div className="text-6xl font-black text-cyan-400 mb-3">3</div>
                <div className="text-blue-200 font-bold text-lg">AI Agents</div>
              </div>
              <div className="bg-gradient-to-br from-purple-600/30 to-purple-700/30 border-2 border-purple-400/50 rounded-3xl p-10 shadow-2xl">
                <div className="text-6xl font-black text-purple-400 mb-3">&lt;2min</div>
                <div className="text-purple-200 font-bold text-lg">Response Time</div>
              </div>
              <div className="bg-gradient-to-br from-pink-600/30 to-red-600/30 border-2 border-pink-400/50 rounded-3xl p-10 shadow-2xl">
                <div className="text-6xl font-black text-pink-400 mb-3">24/7</div>
                <div className="text-pink-200 font-bold text-lg">Always Active</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-6 py-20">
          <h2 className="text-6xl font-black text-white text-center mb-16">
            Powered by AI Agents
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { icon: '🚒', title: 'Fire Agent', desc: 'AI-powered fire response with severity assessment' },
              { icon: '🚓', title: 'Police Agent', desc: 'Smart traffic control and multi-agency coordination' },
              { icon: '🚑', title: 'Medical Agent', desc: 'Medical emergency response with trauma assessment' }
            ].map((agent, i) => (
              <div key={i} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-2 border-white/10 rounded-3xl p-8 hover:scale-105 transition">
                <div className="text-6xl mb-6">{agent.icon}</div>
                <h3 className="text-3xl font-black text-white mb-4">{agent.title}</h3>
                <p className="text-blue-200 text-lg">{agent.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="container mx-auto px-6 py-12 border-t border-white/20 text-center">
          <p className="text-blue-300">© 2025 Smart City AI</p>
        </footer>
      </div>
    </div>
  );
}
