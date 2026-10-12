import { useState, type ReactNode } from "react";
import {
  Plus,
  Scales,
  ArrowRight,
  ArrowUpRight,
  CheckCircle,
  FolderOpen,
  FileText,
  Wrench,
  ShieldCheck,
  Package,
  Receipt,
  Cards,
  MapPin,
  Clock,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import {
  type Project,
  type Entry,
  type Lang,
  type Action,
  cash,
} from "./contracts";
import { Status, fmtDate } from "./components";
type Slots = {
  p: Project;
  now: Date;
  create: () => void;
  notices: ReactNode;
  metrics: ReactNode;
  features: ReactNode;
  records: ReactNode;
  lang: Lang;
};
type Props = {
  p: Project;
  rows: Entry[];
  lang: Lang;
  now: Date;
  busy: boolean;
  open: (e: Entry) => void;
  action: (e: Entry, a: Action) => void;
};
const words = (lang: Lang) => (en: string, ar: string) =>
  lang === "ar" ? ar : en;
function Title({ e, p, open }: Pick<Props, "p" | "open"> & { e: Entry }) {
  return (
    <button className="record-title" dir="auto" onClick={() => open(e)}>
      {p.title(e.data)}
      <ArrowUpRight size={17} />
    </button>
  );
}
function Next({ e, p, lang, busy, action }: Props & { e: Entry }) {
  const a = p.actions.find((a) => a.when(e.data));
  return a ? (
    <button
      className="secondary compact"
      disabled={busy}
      onClick={() => action(e, a)}
    >
      {a.label[lang]}
      <ArrowRight size={14} />
    </button>
  ) : null;
}
function Scene({ label }: { label: string }) {
  return (
    <figure className="brand-scene">
      <img src="/brand-scene.png" alt="" />
      <figcaption>{label}</figcaption>
    </figure>
  );
}

export function ProductComposition({
  p,
  now,
  create,
  notices,
  metrics,
  features,
  records,
  lang,
}: Slots) {
  const t = words(lang);
  return (
    <div className="experience">
      <div className="market-layout">
        <aside className="market-story" id="overview">
          <span className="overline">
            {t("GOOD FOOD, SHARED", "خير يستاهل يتشارك")}
          </span>
          <h1>
            {t("Another table. Another chance.", "سفرة تانية. فرصة تانية.")}
          </h1>
          <Scene
            label={t(
              "Community food sharing · illustration",
              "مشاركة الطعام · صورة توضيحية",
            )}
          />
          <p>
            {t(
              "A meal to share. A collection to arrange. A little less waste.",
              "وجبة تتشارك. استلام يتنظم. وهدر أقل.",
            )}
          </p>
          <button className="primary" onClick={create}>
            <Plus />
            {p.createLabel[lang]}
          </button>
          {metrics}
        </aside>
        <div className="market-offers">
          <div className="market-intro">
            <h2>{t("On the table", "على السفرة")}</h2>
            <span>{t("Local food collections", "استلامات الطعام")}</span>
          </div>
          {features}
          {records}
        </div>
      </div>
      <div className="workspace-notes">{notices}</div>
    </div>
  );
}
export function ProductRecords(props: Props) {
  const { p, rows, lang, now, busy, open, action } = props;
  const t = words(lang);
  return (
    <div className="food-offers">
      {rows.map((e, i) => (
        <article className="record-card food-offer" key={e.id}>
          <div className={"food-label food-label-" + (i % 2)}>
            <span>{e.data.donor}</span>
            <strong>
              {Math.max(
                0,
                e.data.portions - e.data.reserved - e.data.collected,
              )}
            </strong>
            <span>{t("portions available", "وجبة متاحة")}</span>
            <div className="food-line" />
          </div>
          <div className="food-offer-body">
            <Status project={p} entry={e} lang={lang} now={now} />
            <Title {...props} e={e} />
            <p>
              <MapPin size={16} />
              {e.data.location}
            </p>
            <p>
              <Clock size={16} />
              {fmtDate(e.data.expiresAt, lang, true)}
            </p>
            <p className="food-information">
              {e.data.notes ||
                t(
                  "Ask the donor about ingredients and storage.",
                  "اسأل المتبرع عن المكونات والتخزين.",
                )}
            </p>
            <div className="food-offer-bottom">
              <small>
                {e.data.collected} {t("collected", "تم استلامها")}
              </small>
              <Next {...props} e={e} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
