/**
 * Describes a FedaPay transaction object returned inside the checkout callback.
 */
export interface FedaPayTransaction {
  /** Internal FedaPay transaction identifier. */
  id?: number;
  /** Transaction amount in the smallest currency unit (e.g. centimes for XOF). */
  amount: number;
  /** Human-readable description of the transaction. */
  description: string;
  /** Final status of the transaction as reported by FedaPay (e.g. "approved"). */
  status?: string;
  /** Arbitrary key-value metadata attached to the transaction. */
  custom_metadata?: Record<string, unknown>;
}

/**
 * Payload received in the `onComplete` callback after a payment attempt.
 */
export interface FedaPayResponse {
  /**
   * The reason the callback was triggered.
   * Common values are `FedaPay.DIALOG_DISMISSED` and `FedaPay.CHECKOUT_COMPLETED`.
   */
  reason: string;
  /** The transaction associated with this checkout session. */
  transaction: FedaPayTransaction;
}

/**
 * Configuration options passed to the FedaPay checkout widget.
 *
 * @see https://docs.fedapay.com/
 */
export default interface CheckoutOptions {
  /** Deployment environment. Use `'sandbox'` for testing and `'production'` for live payments. */
  environment?: 'live' | 'production' | 'test' | 'sandbox' | 'dev' | 'local';
  /** Override the FedaPay API base URL (advanced use only). */
  url?: string;
  /** Your FedaPay public key (starts with `pk_sandbox_` or `pk_live_`). */
  public_key?: string;
  /**
   * CSS selector string or DOM element used as the embedded widget container.
   * Required when using the embedded / inline widget mode.
   */
  container?: string | HTMLElement | null;
  /**
   * CSS selector string used to identify an external trigger element.
   * Only needed when triggering the popup from an element outside this SDK.
   */
  trigger?: string;
  /** UI locale for the checkout dialog. Defaults to `'fr'`. */
  locale?: 'en' | 'fr';
  /** Transaction details for this payment session. */
  transaction: {
    /** Existing FedaPay transaction ID to resume (optional). */
    id?: number;
    /** Amount to charge, in the smallest currency unit. */
    amount: number;
    /** Short description shown to the customer (e.g. "Order #42"). */
    description: string;
    /** Free-form metadata attached to the transaction. */
    custom_metadata?: Record<string, unknown>;
  };
  /** Currency used for this transaction. */
  currency: {
    /** ISO 4217 alphabetic currency code (e.g. `'XOF'`, `'EUR'`). */
    iso: string;
    /** ISO 4217 numeric currency code (optional). */
    code?: number;
  };
  /** Pre-fill customer information in the checkout form. */
  customer?: {
    firstname: string;
    lastname: string;
    email: string;
    phone_number?: {
      /** The phone number digits. */
      number: string;
      /** ISO 3166-1 alpha-2 country code (e.g. `'BJ'`). */
      country: string;
    };
  };
  /**
   * Appearance overrides for the button rendered by FedaPay's own checkout.js.
   * Only relevant when using the script-driven button (not `FedaCheckoutButton`).
   */
  button?: {
    /** Button label text. */
    text?: string;
    /** Additional CSS class names to apply to the button. */
    class?: string;
  };
  /**
   * Callback fired when the payment flow ends (whether completed or dismissed).
   *
   * @example
   * ```ts
   * onComplete: (resp) => {
   *   if (resp.reason === FedaPay.DIALOG_DISMISSED) {
   *     console.log('User closed the dialog');
   *   } else {
   *     console.log('Transaction done:', resp.transaction);
   *   }
   * }
   * ```
   */
  onComplete?: (response: FedaPayResponse) => void;
}
