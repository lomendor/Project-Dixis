import { CartProvider } from '@/lib/cart/context';
export default function Layout({ children }:{ children: React.ReactNode }){
  return <CartProvider>{children}</CartProvider>;
}
