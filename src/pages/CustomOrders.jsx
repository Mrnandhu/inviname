// src/pages/CustomOrders.jsx — how custom & blood art orders work, plus every made-to-order product
import { useContent } from '../data/content.js'
import { useCatalog } from '../data/catalog.js'
import usePageTitle from '../lib/usePageTitle.js'
import ContentPage from '../components/ContentPage.jsx'
import ProductCard, { ProductCardSkeleton } from '../components/shop/ProductCard.jsx'

export default function CustomOrders() {
  const p = useContent().pages.customOrders
  const cat = useCatalog()
  usePageTitle('Custom Orders', p.intro)
  const items = cat ? cat.products.filter((x) => x.type === 'custom') : null
  return (
    <>
      <ContentPage label="Made just for you" title={p.title} intro={p.intro} body={p.body} />
      <section className="container-page pb-16">
        <h2 className="text-3xl sm:text-4xl">Choose your piece</h2>
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {(items || Array.from({ length: 4 })).map((x, i) => <li key={x?.id || i}>{x ? <ProductCard p={x} /> : <ProductCardSkeleton />}</li>)}
        </ul>
      </section>
    </>
  )
}
