'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { MenuGroup } from '@/data/menu-data';

const CART_STORAGE_KEY =
  'harmony-restaurant-cart-v1';

export type HarmonyCartItem = {
  id: string;
  menuItemId?: string;
  name: string;
  categoryName: string;
  group: MenuGroup;
  price: number;
  quantity: number;
};

type AddCartItemInput = Omit<
  HarmonyCartItem,
  'quantity'
> & {
  quantity?: number;
};

type CartContextValue = {
  cart: HarmonyCartItem[];

  cartCount: number;

  subtotal: number;

  isCartReady: boolean;

  addItem: (
    item: AddCartItemInput,
  ) => void;

  updateQuantity: (
    id: string,
    amount: number,
  ) => void;

  setQuantity: (
    id: string,
    quantity: number,
  ) => void;

  removeItem: (
    id: string,
  ) => void;

  clearCart: () => void;
};

const CartContext =
  createContext<CartContextValue | null>(
    null,
  );

/* =========================================================
   STORED CART VALIDATION
========================================================= */

function isValidStoredCart(
  value: unknown,
): value is HarmonyCartItem[] {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.every((item) => {
    if (
      !item ||
      typeof item !== 'object'
    ) {
      return false;
    }

    const candidate =
      item as Partial<HarmonyCartItem>;

    return (
      typeof candidate.id ===
        'string' &&
      typeof candidate.name ===
        'string' &&
      typeof candidate.categoryName ===
        'string' &&
      typeof candidate.group ===
        'string' &&
      [
        'FOOD',
        'BEVERAGES',
        'BAR',
      ].includes(candidate.group) &&
      typeof candidate.price ===
        'number' &&
      Number.isFinite(
        candidate.price,
      ) &&
      candidate.price >= 0 &&
      typeof candidate.quantity ===
        'number' &&
      Number.isInteger(
        candidate.quantity,
      ) &&
      candidate.quantity > 0
    );
  });
}

/* =========================================================
   CART PROVIDER
========================================================= */

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [cart, setCart] = useState<
    HarmonyCartItem[]
  >([]);

  const [
    isCartReady,
    setIsCartReady,
  ] = useState(false);

  /* =======================================================
     RESTORE CART FROM LOCAL STORAGE

     Important:
     - Server render starts with empty cart.
     - localStorage is read only in browser.
     - State update is scheduled asynchronously so
       React Compiler does not flag synchronous
       setState inside an effect.
  ======================================================= */

  useEffect(() => {
    let restoredCart:
      | HarmonyCartItem[]
      | null = null;

    try {
      const storedValue =
        window.localStorage.getItem(
          CART_STORAGE_KEY,
        );

      if (storedValue) {
        const parsed: unknown =
          JSON.parse(storedValue);

        if (
          isValidStoredCart(parsed)
        ) {
          restoredCart = parsed;
        } else {
          window.localStorage.removeItem(
            CART_STORAGE_KEY,
          );
        }
      }
    } catch {
      /*
       * Corrupted or unavailable
       * localStorage must never crash UI.
       */
      window.localStorage.removeItem(
        CART_STORAGE_KEY,
      );
    }

    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) {
        return;
      }

      if (restoredCart) {
        setCart(restoredCart);
      }

      setIsCartReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     PERSIST CART

     We only write after initial restoration is complete.
  ======================================================= */

  useEffect(() => {
    if (!isCartReady) {
      return;
    }

    try {
      if (cart.length === 0) {
        window.localStorage.removeItem(
          CART_STORAGE_KEY,
        );

        return;
      }

      window.localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cart),
      );
    } catch {
      /*
       * Storage failure should not stop
       * cart usage during this session.
       */
    }
  }, [
    cart,
    isCartReady,
  ]);

  /* =======================================================
     ADD ITEM
  ======================================================= */

  const addItem =
    useCallback(
      (
        item: AddCartItemInput,
      ) => {
        const quantity =
          item.quantity ?? 1;

        if (
          quantity <= 0 ||
          item.price <= 0
        ) {
          return;
        }

        setCart((current) => {
          const existing =
            current.find(
              (
                cartItem,
              ) =>
                cartItem.id ===
                item.id,
            );

          if (existing) {
            return current.map(
              (
                cartItem,
              ) =>
                cartItem.id ===
                item.id
                  ? {
                      ...cartItem,

                      quantity:
                        cartItem.quantity +
                        quantity,
                    }
                  : cartItem,
            );
          }

          return [
            ...current,

            {
              ...item,

              quantity,
            },
          ];
        });
      },
      [],
    );

  /* =======================================================
     UPDATE QUANTITY
  ======================================================= */

  const updateQuantity =
    useCallback(
      (
        id: string,
        amount: number,
      ) => {
        if (amount === 0) {
          return;
        }

        setCart((current) =>
          current
            .map((item) =>
              item.id === id
                ? {
                    ...item,

                    quantity:
                      item.quantity +
                      amount,
                  }
                : item,
            )
            .filter(
              (item) =>
                item.quantity >
                0,
            ),
        );
      },
      [],
    );

  /* =======================================================
     SET QUANTITY
  ======================================================= */

  const setQuantity =
    useCallback(
      (
        id: string,
        quantity: number,
      ) => {
        if (
          !Number.isInteger(
            quantity,
          )
        ) {
          return;
        }

        if (quantity <= 0) {
          setCart(
            (current) =>
              current.filter(
                (
                  item,
                ) =>
                  item.id !==
                  id,
              ),
          );

          return;
        }

        setCart((current) =>
          current.map(
            (item) =>
              item.id === id
                ? {
                    ...item,

                    quantity,
                  }
                : item,
          ),
        );
      },
      [],
    );

  /* =======================================================
     REMOVE ITEM
  ======================================================= */

  const removeItem =
    useCallback(
      (
        id: string,
      ) => {
        setCart(
          (current) =>
            current.filter(
              (
                item,
              ) =>
                item.id !== id,
            ),
        );
      },
      [],
    );

  /* =======================================================
     CLEAR CART
  ======================================================= */

  const clearCart =
    useCallback(() => {
      setCart([]);
    }, []);

  /* =======================================================
     DERIVED VALUES
  ======================================================= */

  const cartCount =
    useMemo(
      () =>
        cart.reduce(
          (
            total,
            item,
          ) =>
            total +
            item.quantity,
          0,
        ),
      [cart],
    );

  const subtotal =
    useMemo(
      () =>
        cart.reduce(
          (
            total,
            item,
          ) =>
            total +
            item.price *
              item.quantity,
          0,
        ),
      [cart],
    );

  /* =======================================================
     CONTEXT VALUE
  ======================================================= */

  const value =
    useMemo<CartContextValue>(
      () => ({
        cart,

        cartCount,

        subtotal,

        isCartReady,

        addItem,

        updateQuantity,

        setQuantity,

        removeItem,

        clearCart,
      }),
      [
        cart,

        cartCount,

        subtotal,

        isCartReady,

        addItem,

        updateQuantity,

        setQuantity,

        removeItem,

        clearCart,
      ],
    );

  return (
    <CartContext.Provider
      value={value}
    >
      {children}
    </CartContext.Provider>
  );
}

/* =========================================================
   CART HOOK
========================================================= */

export function useCart() {
  const context =
    useContext(
      CartContext,
    );

  if (!context) {
    throw new Error(
      'useCart must be used inside CartProvider.',
    );
  }

  return context;
}