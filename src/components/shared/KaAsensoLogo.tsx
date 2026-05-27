import Image from "next/image";
import Link from "next/link";

interface KaAsensoLogoProps {
  href?: string;
  compact?: boolean;
}

export default function KaAsensoLogo({ href = "/", compact = false }: KaAsensoLogoProps) {
  return (
    <Link href={href} className="ka-logo" aria-label="Ka Asenso home">
      <Image
        src="/brand-logo.png"
        alt="Ka Asenso"
        width={70}
        height={55}
        priority
        className={compact ? "ka-logo-mark compact" : "ka-logo-mark"}
      />
      {!compact ? <span className="ka-logo-word">KaAsenso</span> : null}
    </Link>
  );
}
