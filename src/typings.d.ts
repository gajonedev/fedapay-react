import type CheckoutOptions from './checkout-options';

/**
 * @internal
 * Shape of the global `FedaPay` object injected by checkout.js.
 * This declaration is for TypeScript only and does not affect runtime behaviour.
 *
 * Wrapped in `declare global` so that the `import` statement above does not
 * turn this file into a module, which would strip the ambient global.
 */
declare global {
  /**
   * The global FedaPay object available after checkout.js has loaded.
   * Access it as `window.FedaPay` or simply `FedaPay` in browser environments.
   */
  interface FedaPayStatic {
    /** String constant emitted when the user dismisses the checkout dialog without paying. */
    DIALOG_DISMISSED: string;
    /** String constant emitted when the transaction completes successfully. */
    CHECKOUT_COMPLETED: string;

    /**
     * Initialize the checkout widget in **embedded / inline** mode.
     * The widget is rendered inside `options.container`.
     *
     * @param options - Checkout configuration (must include `container`).
     */
    init(options: CheckoutOptions): void;

    /**
     * Initialize the checkout widget in **popup** mode attached to a trigger element.
     *
     * @param trigger - A DOM element or a CSS selector string for the trigger button.
     * @param options - Checkout configuration.
     */
    init(trigger: HTMLElement | string, options: CheckoutOptions): void;
  }

  // eslint-disable-next-line no-var
  var FedaPay: FedaPayStatic;
}

export {};
