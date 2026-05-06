# @gajonedev/fedapay-react

FedaPay CheckoutJS integration for **React 18+** and **Next.js** (App Router & Pages Router).

## Features

- ✅ **React 18 compatible** – functional components, hooks, `forwardRef`
- ✅ **Next.js ready** – SSR-safe, works with App Router (`'use client'`) and Pages Router
- ✅ **Automatic script loading** – no need to add `<script>` tags to your HTML
- ✅ **Full TypeScript types** – all props and callbacks are strongly typed
- ✅ **Dual CJS / ESM build** – works with any bundler
- ✅ **Zero runtime dependencies** – only a peer dependency on React

## Install

```bash
npm install @gajonedev/fedapay-react
# or
yarn add @gajonedev/fedapay-react
```

> **Note:** The FedaPay `checkout.js` script is loaded **automatically** by the
> components. You no longer need to add a `<script>` tag to your HTML.

## Quick start

### FedaCheckoutButton – popup mode

Renders a `<button>` that opens the FedaPay payment popup when clicked.

```tsx
import { FedaCheckoutButton } from '@gajonedev/fedapay-react';
import type { FedaPayResponse } from '@gajonedev/fedapay-react';

function handlePayment(resp: FedaPayResponse) {
  if (resp.reason === 'dialog dismissed') {
    console.log('User closed the dialog');
  } else {
    console.log('Transaction done:', resp.transaction);
  }
}

export default function PayPage() {
  return (
    <FedaCheckoutButton
      options={{
        public_key: 'pk_sandbox_XXXXX',
        transaction: { amount: 500, description: 'Order #42' },
        currency: { iso: 'XOF' },
        onComplete: handlePayment,
      }}
      className="btn btn-primary"
    >
      Pay 500 FCFA
    </FedaCheckoutButton>
  );
}
```

### FedaCheckoutContainer – embedded / inline mode

Renders a `<div>` that hosts the FedaPay widget directly on the page.

```tsx
import { FedaCheckoutContainer } from '@gajonedev/fedapay-react';

export default function PayPage() {
  return (
    <FedaCheckoutContainer
      options={{
        public_key: 'pk_sandbox_XXXXX',
        transaction: { amount: 500, description: 'Order #42' },
        currency: { iso: 'XOF' },
      }}
      style={{ height: 500, width: '100%' }}
    />
  );
}
```

## Next.js

### App Router

Because FedaPay relies on the browser DOM, any file that imports from
`@gajonedev/fedapay-react` must be a **Client Component**. Add the `'use client'`
directive at the top of the file:

```tsx
'use client';

import { FedaCheckoutButton } from '@gajonedev/fedapay-react';

export default function CheckoutPage() {
  return (
    <FedaCheckoutButton
      options={{
        public_key: 'pk_sandbox_XXXXX',
        transaction: { amount: 2000, description: 'Subscription' },
        currency: { iso: 'XOF' },
      }}
    >
      Subscribe – 2 000 FCFA
    </FedaCheckoutButton>
  );
}
```

> **Tip:** If you want to keep a Server Component as the parent, extract the
> button into its own `'use client'` file and import it from the server page.

### Pages Router

No special configuration is needed for the Pages Router; the components are
already SSR-safe and gracefully skip DOM operations during server-side rendering.

```tsx
// pages/pay.tsx
import { FedaCheckoutButton } from '@gajonedev/fedapay-react';

export default function PayPage() {
  return (
    <FedaCheckoutButton
      options={{
        public_key: 'pk_sandbox_XXXXX',
        transaction: { amount: 1000, description: 'Product X' },
        currency: { iso: 'XOF' },
      }}
    />
  );
}
```

## API

### `<FedaCheckoutButton>`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `CheckoutOptions` | **required** | FedaPay checkout configuration. |
| `children` | `ReactNode` | `"Pay with FedaPay"` | Button label or content. |
| `scriptSrc` | `string` | FedaPay CDN URL | Override the checkout.js script URL. |
| `ref` | `Ref<HTMLButtonElement>` | – | Forwarded ref to the underlying `<button>`. |
| …rest | `ButtonHTMLAttributes` | – | Any standard `<button>` attribute (`className`, `style`, `disabled`, `aria-*`, …). `onClick` is reserved by FedaPay. |

### `<FedaCheckoutContainer>`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `CheckoutOptions` | **required** | FedaPay checkout configuration. |
| `scriptSrc` | `string` | FedaPay CDN URL | Override the checkout.js script URL. |
| `ref` | `Ref<HTMLDivElement>` | – | Forwarded ref to the underlying `<div>`. |
| …rest | `HTMLAttributes<HTMLDivElement>` | – | Any standard `<div>` attribute (`className`, `style`, `id`, `aria-*`, …). |

### `useFedaPayScript(src?)`

Hook that dynamically loads the FedaPay `checkout.js` script. Useful when you
need to know whether the script is ready before calling `FedaPay` APIs
programmatically.

```tsx
'use client';
import { useFedaPayScript } from '@gajonedev/fedapay-react';

function MyComponent() {
  const { isLoaded, error } = useFedaPayScript();

  if (error) return <p>Failed to load FedaPay.</p>;
  if (!isLoaded) return <p>Loading payment gateway…</p>;

  return <p>FedaPay is ready! Access window.FedaPay as needed.</p>;
}
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `src` | `string` | FedaPay CDN URL | Custom URL for `checkout.js`. |

Returns `{ isLoaded: boolean, error: Error | null }`.

### `CheckoutOptions`

```ts
interface CheckoutOptions {
  public_key?: string;                  // Your FedaPay public key
  environment?: 'sandbox' | 'production' | 'live' | 'test' | 'dev' | 'local';
  url?: string;                         // Override FedaPay API base URL
  locale?: 'en' | 'fr';                // Checkout UI language
  transaction: {
    amount: number;                     // Amount in smallest currency unit
    description: string;
    id?: number;                        // Resume an existing transaction
    custom_metadata?: Record<string, unknown>;
  };
  currency: {
    iso: string;                        // e.g. 'XOF', 'EUR'
    code?: number;
  };
  customer?: {
    firstname: string;
    lastname: string;
    email: string;
    phone_number?: { number: string; country: string };
  };
  onComplete?: (response: FedaPayResponse) => void;
  // --- Button mode options ---
  button?: { text?: string; class?: string };
  trigger?: string;                     // CSS selector for external trigger
  // --- Container mode options ---
  container?: string | HTMLElement | null;
}
```

## License

MIT
