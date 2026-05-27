import Image from "next/image";
import Link from "next/link";

interface KaAsensoLogoProps {
  href?: string;
  compact?: boolean;
  /**
   * When the logo sits on a dark background (e.g. /call), the wordmark needs
   * a bit of glow to keep contrast.
   */
  invert?: boolean;
}

/**
 * Full Ka Asenso wordmark.
 * Source: /public/new_logo.png (1920x1080 — the artwork is the single mark + text).
 */
export default function KaAsensoLogo({
  href = "/",
  compact = false,
  invert = false,
}: KaAsensoLogoProps) {
  const className = [
    "ka-logo",
    compact ? "ka-logo-compact" : "",
    invert ? "ka-logo-invert" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link href={href} className={className} aria-label="Ka Asenso home">
      <Image
        src="/new_logo.png"
        alt="Ka Asenso"
        width={1920}
        height={1080}
        priority
        className="ka-logo-wordmark"
      />
    </Link>
  );
}
