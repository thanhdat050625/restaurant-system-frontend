import { createContext, useContext, useReducer, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../auth/AuthContext';

const CartContext = createContext();

const LEGACY_CART_STORAGE_KEY = 'foodhub_cart_data';
const CART_STORAGE_PREFIX = 'foodhub_cart_data_';
const EMPTY_CART = { items: [], deliveryType: 'dine_in', coupon: null };

const getCartStorageKey = (userId) => `${CART_STORAGE_PREFIX}${userId}`;

const readUserCartFromStorage = (userId) => {
  if (!userId) return EMPTY_CART;
  try {
    const saved = localStorage.getItem(getCartStorageKey(userId));
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.items)) {
        return {
          items: parsed.items,
          deliveryType: parsed.deliveryType === 'pickup' || parsed.deliveryType === 'dine_in'
            ? parsed.deliveryType
            : 'dine_in',
          coupon: parsed.coupon ? parsed.coupon : null,
        };
      }
    }
  } catch (err) {
    console.warn('Failed to read user cart from storage:', err);
  }
  return EMPTY_CART;
};

const getBaseCart = (state, userId) => (
  Object.prototype.hasOwnProperty.call(state, userId)
    ? state[userId]
    : readUserCartFromStorage(userId)
);

const cartReducer = (state, action) => {
  if (!action.userId) return state;
  const baseCart = getBaseCart(state, action.userId);

  switch (action.type) {
    case 'ADD_ITEM': {
      const addedQty = typeof action.payload.quantity === 'number' ? action.payload.quantity : 1;
      const existingIndex = baseCart.items.findIndex(
        (item) => item.id === action.payload.id && item.selectedOption === action.payload.selectedOption,
      );
      if (existingIndex >= 0) {
        const newItems = baseCart.items.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + addedQty } : item,
        );
        return { ...state, [action.userId]: { ...baseCart, items: newItems } };
      }
      return {
        ...state,
        [action.userId]: {
          ...baseCart,
          items: [...baseCart.items, { ...action.payload, quantity: addedQty }],
        },
      };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        [action.userId]: {
          ...baseCart,
          items: baseCart.items.filter((_, index) => index !== action.payload),
        },
      };
    case 'UPDATE_QUANTITY': {
      const { index, quantity } = action.payload;
      if (index < 0 || index >= baseCart.items.length) return state;
      const nextQty = Math.max(1, quantity);
      const newItems = baseCart.items.map((item, idx) =>
        idx === index ? { ...item, quantity: nextQty } : item,
      );
      return {
        ...state,
        [action.userId]: { ...baseCart, items: newItems },
      };
    }
    case 'CLEAR_CART':
      return { ...state, [action.userId]: EMPTY_CART };
    case 'SET_DELIVERY_TYPE':
      return {
        ...state,
        [action.userId]: { ...baseCart, deliveryType: action.payload },
      };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [cartsByUser, dispatch] = useReducer(cartReducer, {});
  const { user, isAuthenticated, isCheckingAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const activeUserId = isAuthenticated && user?.id ? user.id : null;

  // Xóa key giỏ hàng dùng chung cũ để tránh hiển thị giỏ hàng khi chưa đăng nhập
  useEffect(() => {
    try {
      localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
    } catch (err) {
      console.warn('Failed to remove legacy cart key:', err);
    }
  }, []);

  const currentCart = useMemo(() => {
    if (!activeUserId) return EMPTY_CART;
    if (Object.prototype.hasOwnProperty.call(cartsByUser, activeUserId)) {
      return cartsByUser[activeUserId];
    }
    return readUserCartFromStorage(activeUserId);
  }, [activeUserId, cartsByUser]);

  const persistedCart = activeUserId && Object.prototype.hasOwnProperty.call(cartsByUser, activeUserId)
    ? cartsByUser[activeUserId]
    : null;

  useEffect(() => {
    if (!activeUserId || !persistedCart) return;
    try {
      const storageKey = getCartStorageKey(activeUserId);
      if (persistedCart.items.length === 0 && !persistedCart.coupon) {
        localStorage.removeItem(storageKey);
      } else {
        localStorage.setItem(storageKey, JSON.stringify(persistedCart));
      }
    } catch (err) {
      console.warn('Failed to persist user cart:', err);
    }
  }, [activeUserId, persistedCart]);

  const addItem = useCallback((item) => {
    if (isCheckingAuth) return false;
    if (!activeUserId) {
      toast.error('Vui lòng đăng nhập để thêm món vào giỏ hàng', { id: 'cart-auth-required' });
      navigate('/login', { state: { from: location } });
      return false;
    }
    dispatch({ type: 'ADD_ITEM', userId: activeUserId, payload: item });
    return true;
  }, [isCheckingAuth, activeUserId, navigate, location]);

  const removeItem = useCallback((index) => {
    if (!activeUserId) return;
    dispatch({ type: 'REMOVE_ITEM', userId: activeUserId, payload: index });
  }, [activeUserId]);

  const updateQuantity = useCallback((index, quantity) => {
    if (!activeUserId) return;
    dispatch({ type: 'UPDATE_QUANTITY', userId: activeUserId, payload: { index, quantity } });
  }, [activeUserId]);

  const clearCart = useCallback(() => {
    if (!activeUserId) return;
    dispatch({ type: 'CLEAR_CART', userId: activeUserId });
  }, [activeUserId]);

  const setDeliveryType = useCallback((type) => {
    if (!activeUserId) return;
    dispatch({ type: 'SET_DELIVERY_TYPE', userId: activeUserId, payload: type });
  }, [activeUserId]);

  const totalItems = currentCart.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = currentCart.items.reduce((sum, item) => {
    const optionPrice = item.selectedOptionPrice ? item.selectedOptionPrice : 0;
    return sum + (item.price + optionPrice) * item.quantity;
  }, 0);
  const deliveryFee = 0;
  const total = subtotal;

  return (
    <CartContext.Provider
      value={{
        ...currentCart,
        totalItems,
        subtotal,
        deliveryFee,
        total,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        setDeliveryType,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
