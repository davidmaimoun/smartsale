type Product = {
  id: number
  name: string
  short_description: string
  images: { src: string }[]
}

type Props = {
  product: Product
  onClick: () => void
}

const ProductCard = ({ product, onClick }: Props) => {
  const image = product.images?.[0]?.src

  return (
    <div className="card-product" onClick={onClick}>
      <div className="card-product-image">
        {image ? (
          <img src={image} alt={product.name} />
        ) : (
          <span>📦</span>
        )}
      </div>

      <div className="card-product-body">
        <div className="card-product-title">{product.name}</div>

        <div
          className="card-product-description"
          dangerouslySetInnerHTML={{
            __html: product.short_description,
          }}
        />
      </div>
    </div>
  )
}

export default ProductCard