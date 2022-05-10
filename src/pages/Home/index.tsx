import React, { useState, useEffect } from 'react';
import { MdAddShoppingCart } from 'react-icons/md';

import { ProductList } from './styles';
import { api } from '../../services/api';
import { formatPrice } from '../../util/format';
import { useCart } from '../../hooks/useCart';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
}

interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<ProductFormatted[]>([]);
  const { addProduct, cart } = useCart();

  const formatAsProductFormatted = (data: Product[]) => { 
    const productsFormatted = data.map((product) => ({...product, priceFormatted: formatPrice(product.price) } as ProductFormatted) );
    return productsFormatted;
  }

  async function handleAddProduct(productId: number) {

    await addProduct(productId);
  }

  const cartItemsAmount = cart.reduce((sumAmount, product) => {
    let { id, amount } = product;
    return {...sumAmount, [id]: amount}
  }, {} as CartItemsAmount);

  useEffect(() => { 
    async function loadProducts() {
      const response = await api.get<Product[]>(`/products`);
      const prodFormatted = formatAsProductFormatted(response.data);
      setProducts(prodFormatted);
    }
    loadProducts();
  }, [])

  return (
    <ProductList>
      {
        products.map(productItemFormatted => (
          <li key={productItemFormatted.id}>
            <img src={productItemFormatted.image} alt="Tênis de Caminhada Leve Confortável" />
            <strong>{productItemFormatted.title}</strong>
            <span>{productItemFormatted.priceFormatted}</span>
            <button
              type="button"
              data-testid="add-product-button"
            onClick={() => handleAddProduct(productItemFormatted.id)}
            >
              <div data-testid="cart-product-quantity">
                <MdAddShoppingCart size={16} color="#FFF" />
                {cartItemsAmount[productItemFormatted.id] || 0}
              </div>

              <span>ADICIONAR AO CARRINHO</span>
            </button>
          </li>
        ))
      }
    </ProductList>

  );
};

export default Home;
