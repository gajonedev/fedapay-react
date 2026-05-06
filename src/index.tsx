/**
 * @file @gajonedev/fedapay-react – React & Next.js integration for FedaPay CheckoutJS.
 *
 * Features
 * --------
 * - Functional components with React hooks (React 18+)
 * - Dynamic script loading – no need to add a `<script>` tag manually
 * - SSR-safe – works transparently with Next.js App Router & Pages Router
 * - `forwardRef` support on both components
 * - Full TypeScript types with JSDoc
 *
 * Quick-start (React)
 * -------------------
 * ```tsx
 * import { FedaCheckoutButton } from '@gajonedev/fedapay-react';
 *
 * <FedaCheckoutButton
 *   options={{
 *     public_key: 'pk_sandbox_XXXXX',
 *     transaction: { amount: 500, description: 'Order #42' },
 *     currency: { iso: 'XOF' },
 *     onComplete: (resp) => console.log(resp),
 *   }}
 * >
 *   Pay 500 FCFA
 * </FedaCheckoutButton>
 * ```
 *
 * Next.js (App Router)
 * --------------------
 * Add `'use client'` at the top of the file that uses these components because
 * FedaPay relies on the DOM and is browser-only.
 *
 * ```tsx
 * 'use client';
 * import { FedaCheckoutButton } from '@gajonedev/fedapay-react';
 * ```
 */

import * as React from 'react';
import CheckoutOptions from './checkout-options';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Default CDN URL for the FedaPay checkout.js script. */
const DEFAULT_SCRIPT_SRC = 'https://cdn.fedapay.com/checkout.js?v=1.1.2';

// ─── Script loader utility ────────────────────────────────────────────────────

/**
 * Injects the FedaPay `checkout.js` script into `<head>` exactly once.
 *
 * - Calling this function multiple times with the same `src` is idempotent.
 * - Resolves immediately in SSR environments (e.g. Next.js server components)
 *   where `document` is not available.
 *
 * @param src - The script URL to load.
 * @returns A Promise that resolves when the script is ready.
 */
function loadFedaPayScript(src: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    // SSR guard – document doesn't exist on the server
    if (typeof document === 'undefined') {
      resolve();
      return;
    }

    // Script already present in the DOM (e.g. injected via <script> tag or a
    // previous call to this function) – resolve straight away
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(
        new Error(
          `[@gajonedev/fedapay-react] Failed to load the FedaPay script: ${src}. ` +
            'Check your network connection or the scriptSrc prop.'
        )
      );

    document.head.appendChild(script);
  });
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * React hook that dynamically loads the FedaPay `checkout.js` script.
 *
 * The script is inserted into `<head>` once and shared across all component
 * instances, so multiple widgets on the same page do not cause duplicate loads.
 *
 * @param src - Custom script URL. Defaults to the official FedaPay CDN.
 * @returns An object with:
 *   - `isLoaded` – `true` once the script has been fetched and executed.
 *   - `error`    – An `Error` if the script failed to load, otherwise `null`.
 *
 * @example
 * ```tsx
 * function PayPage() {
 *   const { isLoaded, error } = useFedaPayScript();
 *   if (error) return <p>Could not load FedaPay.</p>;
 *   if (!isLoaded) return <p>Loading…</p>;
 *   return <p>FedaPay is ready!</p>;
 * }
 * ```
 */
export function useFedaPayScript(src: string = DEFAULT_SCRIPT_SRC): {
  isLoaded: boolean;
  error: Error | null;
} {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    // Bail out in SSR environments
    if (typeof document === 'undefined') return;

    let cancelled = false;

    loadFedaPayScript(src)
      .then(() => {
        if (!cancelled) setIsLoaded(true);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err);
      });

    return () => {
      cancelled = true;
    };
  }, [src]);

  return { isLoaded, error };
}

// ─── Prop types ───────────────────────────────────────────────────────────────

/**
 * Props shared by {@link FedaCheckoutButton} and {@link FedaCheckoutContainer}.
 */
export interface FedaCheckoutBaseProps {
  /** FedaPay checkout configuration. */
  options: CheckoutOptions;
  /**
   * URL of the FedaPay `checkout.js` CDN script.
   *
   * Override this if you self-host the script or need a specific version.
   * @default "https://cdn.fedapay.com/checkout.js?v=1.1.2"
   */
  scriptSrc?: string;
}

/**
 * Props for {@link FedaCheckoutButton}.
 *
 * Extends all standard `<button>` HTML attributes, so you can pass
 * `className`, `style`, `disabled`, `aria-label`, etc. directly.
 *
 * `onClick` is intentionally omitted – FedaPay attaches its own click handler
 * to open the checkout popup.
 */
export interface FedaCheckoutButtonProps
  extends FedaCheckoutBaseProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  /**
   * Content rendered inside the button.
   * @default "Pay with FedaPay"
   */
  children?: React.ReactNode;
}

/**
 * Props for {@link FedaCheckoutContainer}.
 *
 * Extends all standard `<div>` HTML attributes, so you can pass
 * `className`, `style`, `id`, `aria-*`, etc. directly.
 */
export interface FedaCheckoutContainerProps
  extends FedaCheckoutBaseProps,
    React.HTMLAttributes<HTMLDivElement> {}

// ─── Components ───────────────────────────────────────────────────────────────

/**
 * Renders a `<button>` that opens the FedaPay payment popup when clicked.
 *
 * The FedaPay `checkout.js` script is loaded **automatically** – you do not
 * need to add a `<script>` tag to your HTML. Simply drop this component into
 * your page and it will handle everything.
 *
 * ### Next.js App Router
 * Because FedaPay relies on the DOM, the file that renders this component must
 * begin with the `'use client'` directive:
 * ```tsx
 * 'use client';
 * import { FedaCheckoutButton } from '@gajonedev/fedapay-react';
 * ```
 *
 * @example Basic usage
 * ```tsx
 * <FedaCheckoutButton
 *   options={{
 *     public_key: 'pk_sandbox_XXXXX',
 *     transaction: { amount: 500, description: 'Order #42' },
 *     currency: { iso: 'XOF' },
 *     onComplete: (resp) => console.log(resp),
 *   }}
 *   className="btn btn-primary"
 * >
 *   Pay 500 FCFA
 * </FedaCheckoutButton>
 * ```
 */
export const FedaCheckoutButton = React.forwardRef<
  HTMLButtonElement,
  FedaCheckoutButtonProps
>(function FedaCheckoutButton(
  {
    options,
    scriptSrc = DEFAULT_SCRIPT_SRC,
    children = 'Pay with FedaPay',
    ...buttonProps
  },
  forwardedRef
) {
  // Internal ref pointing to the <button> DOM node (used to call FedaPay.init)
  const internalRef = React.useRef<HTMLButtonElement | null>(null);

  /**
   * Merged callback ref that keeps both the internal ref and any forwarded ref
   * in sync with the same DOM node.
   */
  const mergedRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      internalRef.current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        (
          forwardedRef as React.MutableRefObject<HTMLButtonElement | null>
        ).current = node;
      }
    },
    // Include forwardedRef so the callback is recreated if the parent swaps
    // the ref (e.g. switches from a callback ref to a RefObject ref).
    [forwardedRef]
  );

  const { isLoaded, error } = useFedaPayScript(scriptSrc);

  React.useEffect(() => {
    if (!isLoaded || !internalRef.current) return;

    if (typeof FedaPay === 'undefined') {
      console.error(
        '[@gajonedev/fedapay-react] The FedaPay global is not defined after the script ' +
          `loaded. Verify that "${scriptSrc}" is a valid checkout.js URL.`
      );
      return;
    }

    // Attach FedaPay to the button DOM node (popup / trigger mode)
    FedaPay.init(internalRef.current, options);
  }, [isLoaded, options, scriptSrc]);

  // Log script load errors without crashing the render tree
  if (error) {
    console.error('[@gajonedev/fedapay-react]', error.message);
  }

  return (
    <button ref={mergedRef} {...buttonProps}>
      {children}
    </button>
  );
});

FedaCheckoutButton.displayName = 'FedaCheckoutButton';

/**
 * Renders a `<div>` that hosts the FedaPay payment widget in **embedded
 * (inline) mode** – the checkout form appears directly on your page without
 * opening a popup.
 *
 * The FedaPay `checkout.js` script is loaded **automatically**.
 *
 * ### Next.js App Router
 * ```tsx
 * 'use client';
 * import { FedaCheckoutContainer } from '@gajonedev/fedapay-react';
 * ```
 *
 * @example Basic usage
 * ```tsx
 * <FedaCheckoutContainer
 *   options={{
 *     public_key: 'pk_sandbox_XXXXX',
 *     transaction: { amount: 500, description: 'Order #42' },
 *     currency: { iso: 'XOF' },
 *   }}
 *   style={{ height: 500, width: '100%' }}
 * />
 * ```
 */
export const FedaCheckoutContainer = React.forwardRef<
  HTMLDivElement,
  FedaCheckoutContainerProps
>(function FedaCheckoutContainer(
  { options, scriptSrc = DEFAULT_SCRIPT_SRC, ...divProps },
  forwardedRef
) {
  // Internal ref pointing to the <div> DOM node (used as FedaPay container)
  const internalRef = React.useRef<HTMLDivElement | null>(null);

  /**
   * Merged callback ref that keeps both the internal ref and any forwarded ref
   * in sync with the same DOM node.
   */
  const mergedRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      internalRef.current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        (
          forwardedRef as React.MutableRefObject<HTMLDivElement | null>
        ).current = node;
      }
    },
    // Include forwardedRef so the callback is recreated if the parent swaps
    // the ref (e.g. switches from a callback ref to a RefObject ref).
    [forwardedRef]
  );

  const { isLoaded, error } = useFedaPayScript(scriptSrc);

  React.useEffect(() => {
    if (!isLoaded || !internalRef.current) return;

    if (typeof FedaPay === 'undefined') {
      console.error(
        '[@gajonedev/fedapay-react] The FedaPay global is not defined after the script ' +
          `loaded. Verify that "${scriptSrc}" is a valid checkout.js URL.`
      );
      return;
    }

    // Pass the container DOM node to FedaPay (embedded / inline mode)
    FedaPay.init({ ...options, container: internalRef.current });
  }, [isLoaded, options, scriptSrc]);

  // Log script load errors without crashing the render tree
  if (error) {
    console.error('[@gajonedev/fedapay-react]', error.message);
  }

  return <div ref={mergedRef} {...divProps} />;
});

FedaCheckoutContainer.displayName = 'FedaCheckoutContainer';

// ─── Re-exports ───────────────────────────────────────────────────────────────

/** Re-exported `CheckoutOptions` type for consumer convenience. */
export type { default as CheckoutOptions } from './checkout-options';

/** Re-exported `FedaPayTransaction` type for consumer convenience. */
export type { FedaPayTransaction } from './checkout-options';

/** Re-exported `FedaPayResponse` type for consumer convenience. */
export type { FedaPayResponse } from './checkout-options';

