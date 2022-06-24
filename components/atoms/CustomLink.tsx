import Link from 'next/link';
import React, { ReactNode, useEffect, useRef } from 'react';

interface CustomLinkI {
  href: string;
  disabled?: boolean;
  children: ReactNode;
}

const CustomLink: React.FC<CustomLinkI> = ({ href, disabled, children }) => {
  const containerRef = useRef<HTMLDivElement>();

  useEffect(() => {
    const handleInput = (e: any) => {
      e.stopPropagation();
    };

    if (disabled && containerRef.current) {
      containerRef.current.addEventListener('click', handleInput, {
        capture: true,
      });
      containerRef.current.addEventListener('keydown', handleInput, {
        capture: true,
      });
    }

    return () => {
      if (disabled && containerRef.current) {
        containerRef.current.removeEventListener('click', handleInput, {
          capture: true,
        });
        containerRef.current.removeEventListener('keydown', handleInput, {
          capture: true,
        });
      }
    };
  }, [disabled]);

  return (
    <div
      ref={(e) => {
        if (e) {
          containerRef.current = e;
        }
      }}
    >
      <Link href={href}>{children}</Link>
    </div>
  );
};

CustomLink.defaultProps = {
  disabled: false,
};

export default CustomLink;
