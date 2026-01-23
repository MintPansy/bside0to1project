// Next.js 타입 선언 (타입 체크 우회용)
// Next.js가 이미 타입을 포함하고 있지만, TypeScript가 인식하지 못하는 경우를 위한 선언

declare module 'next/navigation' {
  export function redirect(path: string): never;
  export function notFound(): never;
  export function useRouter(): {
    push: (path: string) => void;
    replace: (path: string) => void;
    refresh: () => void;
    back: () => void;
    forward: () => void;
    prefetch: (path: string) => void;
  };
  export function usePathname(): string;
  export function useSearchParams(): URLSearchParams;
  export function useParams(): Record<string, string | string[]>;
}

declare module 'next/link' {
  import { ComponentProps, ReactNode } from 'react';
  
  interface LinkProps extends ComponentProps<'a'> {
    href: string;
    children: ReactNode;
    prefetch?: boolean;
    replace?: boolean;
    scroll?: boolean;
    shallow?: boolean;
  }
  
  export default function Link(props: LinkProps): JSX.Element;
}

