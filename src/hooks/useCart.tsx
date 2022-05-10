import { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { getAllProducts } from '../services/products';
import { getAllStockData } from '../services/stock';
import { Product, Stock } from '../types';
import { ProductStorage } from '../util/ProductStorage';


const NO_STOCK_AVAILABLE_MSG = "Quantidade solicitada fora de estoque";

interface ProductFromAPI {
  id: number;
  title: string;
  price: number;
  image: string;
}
interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  allProducts: ProductFromAPI[];
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [stock, setStock] = useState<Stock[]>([]);
  const [allProducts, setAllProducts] = useState<ProductFromAPI[]>([]);
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = new ProductStorage().load();

    if (storagedCart) return storagedCart;

    return [];
  });

  const isObjectEmpty = (obj: Object) => { 
    if (Object.keys(obj).length === 0) return true
    return false;
  }

  const findIndexProduct = (cartArray:Product[] , productId: number) => { 
    return cartArray.findIndex(productItem => productItem.id === productId)
  }

  const addProduct = async (productId: number) => {
    try {
      const newCart = [...cart];

      const responseStock = await api.get<Stock>(`/stock/${productId}`);
      const responseProduct = await api.get(`/products/${productId}`);
    
      const productStock = responseStock.data;
      const productData = responseProduct.data;

      const productInCartIndex = findIndexProduct(cart, productId as number);


      if(productInCartIndex === -1) { 
        if(productStock.amount < 1) throw new Error(NO_STOCK_AVAILABLE_MSG);
        const productToAdd = (productData as ProductFromAPI);
        newCart.push({...productToAdd, amount: 1} as Product);
        setCart(newCart);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart))
        return
      } 
      else if(cart[productInCartIndex].amount + 1 > productStock.amount) {
        toast.error(NO_STOCK_AVAILABLE_MSG);
        return;
      }
      
      newCart[productInCartIndex].amount += 1;

      setCart(newCart);
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart))
    } catch(err) {
     toast.error("Erro na adição do produto")
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const productToRemoveIndex = findIndexProduct(cart, productId);
      if(productToRemoveIndex === -1) throw new Error();

      const cartWithoutProduct = [...cart];
      cartWithoutProduct.splice(productToRemoveIndex, 1);

      new ProductStorage().save(cartWithoutProduct);
      setCart(cartWithoutProduct)
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount < 1 ) return;

      const updateProductIndex = findIndexProduct(cart, productId);
      if (updateProductIndex === -1) throw new Error();

      const prodUpdate = cart[updateProductIndex];
      const stockResponse = await api.get<Stock>(`/stock/${productId}`);
      if (!stockResponse.data) return;

      const productStock = stockResponse.data;
 
      if (amount > productStock.amount) { 
        toast.error(NO_STOCK_AVAILABLE_MSG);
        return;
      }

      prodUpdate.amount = amount;
      const updatedCart = [...cart];
      updatedCart[updateProductIndex] = prodUpdate;

      new ProductStorage().save(updatedCart);
      setCart(updatedCart);

    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ allProducts, cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
