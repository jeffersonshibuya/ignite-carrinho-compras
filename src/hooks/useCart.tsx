import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    // const storagedCart = Buscar dados do localStorage
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart)
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // TODO
      const product = cart.filter(p => p.id === productId)[0]

      const checkStockResponse = await api.get(`/stock/${productId}`)

      const amount = product?.amount + 1 || 1

      if(amount > checkStockResponse.data.amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      if(product) {
        product.amount += 1
        const productIndex = cart.findIndex(p => p.id === productId)

        cart.splice(productIndex, 1);

        cart.push(product);
        setCart([...cart])
        localStorage.setItem('@RocketShoes:cart', JSON.stringify([...cart]))
      } else {
        const product = await api.get(`/products/${productId}`)
        setCart([...cart, {...product.data, amount: 1}])
        localStorage.setItem('@RocketShoes:cart', JSON.stringify([...cart, {...product.data, amount: 1}]))
      }
    } catch(error) {
      // TODO
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      const productIndex = cart.findIndex(p => p.id === productId);

      if(productIndex === -1) {
        toast.error('Erro na remoção do produto');
        return;
      }
      cart.splice(productIndex, 1);
      setCart([...cart])
      localStorage.setItem('@RocketShoes:cart', JSON.stringify([...cart]))
    } catch {
      // TODO
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      const checkStockResponse = await api.get(`/stock/${productId}`)

      if(amount > checkStockResponse.data.amount || amount < 1) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      cart.map(product => {
        if(product.id === productId) {
          product.amount = amount;
        }
        return product;
      })

      setCart([...cart])
      localStorage.setItem('@RocketShoes:cart', JSON.stringify([...cart]))
    } catch {
      // TODO
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
