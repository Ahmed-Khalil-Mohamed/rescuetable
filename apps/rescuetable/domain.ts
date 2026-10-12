import { z } from "zod";
import {
  c,
  text,
  note,
  count,
  datetime,
  metric,
  fail,
  type Project,
} from "../../src/contracts";
export const rescuetable: Project = {
  id: "rescuetable",
  name: "RescueTable",
  arabic: "خير باقي",
  kind: "web",
  color: "#94621d",
  mark: "03",
  tagline: c(
    "Good food deserves another table.",
    "الأكل الكويس يستاهل سفرة تانية.",
  ),
  problem: c(
    "A pickup coordination board for surplus food. Reserve portions, track collections, and keep expiry windows visible.",
    "لوحة تنسيق لفائض الطعام: حجز الكميات ومتابعة الاستلام وإظهار آخر موعد للاستلام.",
  ),
  entity: c("food batches", "دفعات طعام"),
  createLabel: c("Add surplus food", "إضافة فائض طعام"),
  fields: [
    {
      key: "title",
      label: c("Food description", "وصف الطعام"),
      required: true,
    },
    {
      key: "donor",
      label: c("Donor / kitchen", "المتبرع / المطبخ"),
      required: true,
    },
    {
      key: "location",
      label: c("Pickup location", "مكان الاستلام"),
      required: true,
    },
    {
      key: "portions",
      label: c("Available portions", "عدد الحصص"),
      type: "number",
      min: 1,
      max: 100000,
      required: true,
    },
    {
      key: "expiresAt",
      label: c("Pickup deadline", "آخر موعد للاستلام"),
      type: "datetime-local",
      required: true,
    },
    {
      key: "notes",
      label: c(
        "Allergens & storage instructions",
        "مسببات الحساسية وتعليمات الحفظ",
      ),
      type: "textarea",
    },
  ],
  schema: z
    .object({
      title: text,
      donor: text,
      location: text,
      portions: count,
      expiresAt: datetime,
      notes: note,
    })
    .strict(),
  create: (d, n) => {
    if (Date.parse(d.expiresAt) <= +n) fail("future_deadline");
    return { ...d, reserved: 0, collected: 0, reservations: [] };
  },
  act: (d, a, p, n) => {
    if (a === "reserve") {
      if (Date.parse(d.expiresAt) <= +n) fail("expired");
      const x = z.object({ name: text, quantity: count }).strict().parse(p);
      if (x.quantity > d.portions - d.reserved - d.collected)
        fail("insufficient_capacity");
      return {
        ...d,
        reserved: d.reserved + x.quantity,
        reservations: [
          ...d.reservations,
          { ...x, id: crypto.randomUUID(), status: "reserved" },
        ],
      };
    }
    if (a === "collect" || a === "release") {
      const { reservationId } = z
        .object({ reservationId: text })
        .strict()
        .parse(p);
      const item = d.reservations.find(
        (r: any) => r.id === reservationId && r.status === "reserved",
      );
      if (!item) fail("invalid_reservation");
      if (a === "collect" && Date.parse(d.expiresAt) <= +n) fail("expired");
      return {
        ...d,
        reserved: d.reserved - item.quantity,
        collected: d.collected + (a === "collect" ? item.quantity : 0),
        reservations: d.reservations.map((r: any) =>
          r.id === reservationId
            ? { ...r, status: a === "collect" ? "collected" : "released" }
            : r,
        ),
      };
    }
    return fail("invalid_transition");
  },
  actions: [
    {
      id: "reserve",
      label: c("Reserve portions", "حجز حصص"),
      fields: [
        {
          key: "name",
          label: c("Collector name", "اسم المستلم"),
          required: true,
        },
        {
          key: "quantity",
          label: c("Portions", "الحصص"),
          type: "number",
          min: 1,
          required: true,
        },
      ],
      when: (d) => d.portions > d.reserved + d.collected,
    },
  ],
  title: (d) => d.title,
  subtitle: (d) => `${d.donor} · ${d.location}`,
  status: (d, n) =>
    d.collected === d.portions
      ? "collected"
      : Date.parse(d.expiresAt) <= +n
        ? "expired"
        : d.reserved + d.collected === d.portions
          ? "reserved"
          : "available",
  statuses: {
    available: c("Available", "متاح"),
    reserved: c("Fully reserved", "محجوز بالكامل"),
    collected: c("Collected", "تم الاستلام"),
    expired: c("Window closed", "انتهى الموعد"),
  },
  metrics: (r, n) => [
    metric(
      "Available portions",
      "حصص متاحة",
      r
        .filter((x) => Date.parse(x.data.expiresAt) > +n)
        .reduce(
          (s, x) => s + x.data.portions - x.data.reserved - x.data.collected,
          0,
        ),
      "Within pickup window",
      "داخل فترة الاستلام",
    ),
    metric(
      "Reserved",
      "محجوزة",
      r.reduce((s, x) => s + x.data.reserved, 0),
      "Waiting for collection",
      "في انتظار الاستلام",
    ),
    metric(
      "Collected portions",
      "حصص تم استلامها",
      r.reduce((s, x) => s + x.data.collected, 0),
      "Recorded pickups",
      "عمليات استلام مسجلة",
    ),
  ],
  seed: (n) => [
    {
      title: "Fresh vegetable lunch boxes",
      donor: "Community Kitchen",
      location: "Downtown pickup point",
      portions: 24,
      expiresAt: new Date(+n + 21600000).toISOString(),
      notes: "Contains wheat. Keep chilled. Donor-provided information.",
      reserved: 4,
      collected: 8,
      reservations: [
        {
          id: "sample-reservation",
          name: "Neighbourhood volunteers",
          quantity: 4,
          status: "reserved",
        },
      ],
    },
    {
      title: "Bakery bread baskets",
      donor: "Morning Bakery",
      location: "Garden Street",
      portions: 12,
      expiresAt: new Date(+n + 14400000).toISOString(),
      notes: "Contains gluten and sesame.",
      reserved: 0,
      collected: 0,
      reservations: [],
    },
  ],
};
