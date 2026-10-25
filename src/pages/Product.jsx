// src/pages/Product.jsx — placeholder (built in Phase 2)
import { useParams } from 'react-router'
import PageIntro from '../components/PageIntro.jsx'

export default function Product() {
  const { slug } = useParams()
  return (
    <PageIntro label="Product" title={slug.replace(/-/g, ' ')} phase={2}>
      Photos, sizes, prices, delivery check and Add to Cart.
    </PageIntro>
  )
}
