const images = ['/assets/9add2.webp', '/assets/8f387.webp', '/assets/83794.webp', '/assets/b7cfc.webp']
const articles = [
  ['Como funciona a propriedade de NFTs', 'Aprenda a colecionar, negociar e verificar ativos digitais.'],
  ['10 artistas digitais para acompanhar', 'Conheça criadores que moldam a cultura digital.'],
  ['Raridade, atributos e procedência', 'Entenda raridade, procedência, direitos autorais e utilidade.'],
  ['Como proteger sua carteira', 'Proteja sua carteira, seus ativos e sua identidade.'],
]

export function HomeExtras() {
  return <div className="home-extras">
    <div className="promo-grid">
      <a href="#catalogo" className="promo-card"><img src="/assets/8f387.webp" alt="" /><div><h2>Lançamentos gênesis de edição limitada</h2><p>Colecione edições escassas diretamente dos criadores antes da revelação pública.</p><span>Explorar →</span></div></a>
      <a href="#catalogo" className="promo-card"><img src="/assets/9add2.webp" alt="" /><div><h2>Arte digital selecionada e muito mais</h2><p>Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.</p><span>Explorar →</span></div></a>
    </div>
    <section className="journal"><h2>Diário da Cunhagem</h2><p>Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.</p><div className="journal-grid">{articles.map(([title, description], index) => <article key={title}><img src={images[index]} alt="" /><div><small>{12 + index} de setembro · Leitura de {index === 0 ? 6 : index === 2 ? 3 : 2} min</small><h3>{title}</h3><p>{description}</p><a href="#aprenda">Ler mais →</a></div></article>)}</div></section>
  </div>
}
