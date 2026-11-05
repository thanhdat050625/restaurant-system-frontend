import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';

const CartContext = createContext();

const CART_STORAGE_KEY = 'foodhub_cart_data';

const getInitialState = () => {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.items)) {
        return {
          items: parsed.items,
          deliveryType: parsed.deliveryType || 'dine_in',
          coupon: parsed.coupon || null,
        };
      }
    }
  } catch {}
  return { items: [], deliveryType: 'dine_in', coupon: null };
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        item => item.id === action.payload.id && item.selectedOption === action.payload.selectedOption
      );
      if (existingIndex >= 0) {
        const newItems = [...state.items];
        const addedQty = typeof action.payload.quantity === 'number' ? action.payload.quantity : 1;
        newItems[existingIndex].quantity += addedQty;
        return { ...state, items: newItems };
      }
      const initialQty = typeof action.payload.quantity === 'number' ? action.payload.quantity : 1;
      return { ...state, items: [...state.items, { ...action.payload, quantity: initialQty }] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((_, index) => index !== action.payload) };
    case 'UPDATE_QUANTITY': {
      const newItems = [...state.items];
      newItems[action.payload.index].quantity = Math.max(1, action.payload.quantity);
      return { ...state, items: newItems };
    }
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'SET_DELIVERY_TYPE':
      return { ...state, deliveryType: action.payload };
    case 'SET_COUPON':
      return { ...state, coupon: action.payload };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, null, getInitialState);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const addItem = useCallback((item) => dispatch({ type: 'ADD_ITEM', payload: item }), []);
  const removeItem = useCallback((index) => dispatch({ type: 'REMOVE_ITEM', payload: index }), []);
  const updateQuantity = useCallback((index, quantity) => dispatch({ type: 'UPDATE_QUANTITY', payload: { index, quantity } }), []);
  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {}
  }, []);
  const setDeliveryType = useCallback((type) => dispatch({ type: 'SET_DELIVERY_TYPE', payload: type }), []);

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.items.reduce((sum, item) => {
    const optionPrice = item.selectedOptionPrice ? item.selectedOptionPrice : 0;
    return sum + (item.price + optionPrice) * item.quantity;
  }, 0);
  const deliveryFee = 0;
  const total = subtotal;

  return (
    <CartContext.Provider value={{ ...state, totalItems, subtotal, deliveryFee, total, addItem, removeItem, updateQuantity, clearCart, setDeliveryType }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

export default CartContext;
