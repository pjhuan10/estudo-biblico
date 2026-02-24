export default function InstalarPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-6">
          <div className="text-xs tracking-widest text-amber-300/80">INSTALAR APP</div>
          <h1 className="mt-3 text-2xl font-semibold">Colocar na Tela Inicial (iPhone)</h1>

          <ol className="mt-4 space-y-2 text-gray-300 list-decimal list-inside">
            <li>Abra o site no Safari.</li>
            <li>Toque no botão de compartilhar (quadrado com seta pra cima).</li>
            <li>Selecione <b>Adicionar à Tela de Início</b>.</li>
            <li>Confirme o nome e toque em <b>Adicionar</b>.</li>
          </ol>

          <p className="mt-5 text-sm text-gray-400">
            No iPhone não aparece “instalar” automático como Android. Esse é o jeito oficial.
          </p>

          <a
            href="/"
            className="mt-6 inline-flex items-center justify-center rounded-2xl px-5 py-3 bg-amber-500/20 ring-1 ring-amber-400/30 hover:bg-amber-500/30 transition"
          >
            Voltar para o início →
          </a>
        </div>
      </div>
    </main>
  );
}
