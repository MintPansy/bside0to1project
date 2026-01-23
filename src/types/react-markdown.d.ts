// react-markdown 타입 선언
declare module 'react-markdown' {
  import { ReactNode } from 'react';

  export interface ReactMarkdownProps {
    children?: string;
    className?: string;
    components?: Record<string, any>;
    remarkPlugins?: any[];
    rehypePlugins?: any[];
  }

  export default function ReactMarkdown(props: ReactMarkdownProps): ReactNode;
}

