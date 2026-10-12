import type { ReactNode } from "react";
import {
  UsersThree,
  ListBullets,
  CalendarBlank,
  HandHeart,
  Package,
  ChartBar,
  Cards,
} from "@phosphor-icons/react";
import type { Lang } from "./contracts";
export function ProductLayout({
  brand,
  utilities,
  lang,
  children,
}: {
  brand: ReactNode;
  utilities: ReactNode;
  lang: Lang;
  children: ReactNode;
}) {
  const t = (en: string, ar: string) => (lang === "ar" ? ar : en);
  return (
    <div className="market-shell">
      <header className="market-mast">
        {brand}
        <span className="mast-message">
          {t("Less waste. More together.", "هدر أقل. خير أكتر.")}
        </span>
        {utilities}
      </header>
      <main className="identity-main">{children}</main>
      <footer className="market-footer">
        RescueTable{" "}
        <span>
          {t("A place for food to find its people.", "مكان يوصل الخير لأهله.")}
        </span>
      </footer>
    </div>
  );
}
