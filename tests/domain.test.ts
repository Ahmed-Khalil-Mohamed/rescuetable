import { test } from "node:test";
import assert from "node:assert/strict";
import { projects, findProject } from "../src/projects";
import { DomainError, cash, type Entry } from "../src/contracts";
import { splitCents, balances, settlements } from "../src/settlements";
const now = new Date("2026-10-12T12:00:00Z");
const p = (id: string) => findProject(id)!;
const rejects = (fn: () => unknown, code: string) =>
  assert.throws(
    fn,
    (e: unknown) => e instanceof DomainError && e.code === code,
  );
for (const project of projects) {
  test(`${project.name}: samples yield finite, renderable metrics and recognized states`, () => {
    const entries = project.seed(now).map((data, i) => ({
      id: String(i),
      version: 1,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      data,
    }));
    assert.ok(entries.length);
    assert.equal(project.metrics(entries, now).length, 3);
    for (const e of entries) {
      assert.ok(project.title(e.data));
      assert.ok(project.statuses[project.status(e.data, now)]);
    }
    for (const m of project.metrics(entries, now)) {
      assert.ok(m.label.ar && m.label.en);
      assert.ok(typeof m.value === "string" || Number.isFinite(m.value));
    }
  });
}
test("RescueTable reservations preserve capacity through reserve, release and collect", () => {
  const project = p("rescuetable");
  let d = project.seed(now)[1];
  rejects(
    () => project.act(d, "reserve", { name: "A", quantity: 13 }, now),
    "insufficient_capacity",
  );
  d = project.act(d, "reserve", { name: "A", quantity: 5 }, now);
  const id = d.reservations[0].id;
  d = project.act(d, "collect", { reservationId: id }, now);
  assert.equal(d.collected, 5);
  assert.equal(d.reserved, 0);
  rejects(
    () => project.act(d, "collect", { reservationId: id }, now),
    "invalid_reservation",
  );
  d = project.act(d, "reserve", { name: "B", quantity: 7 }, now);
  d = project.act(d, "release", { reservationId: d.reservations[1].id }, now);
  assert.equal(d.reserved, 0);
  assert.equal(d.collected, 5);
});
test("RescueTable blocks reservation and collection after expiry", () => {
  const project = p("rescuetable");
  const d = project.seed(now)[0],
    later = new Date(+now + 86400000);
  rejects(
    () => project.act(d, "reserve", { name: "A", quantity: 1 }, later),
    "expired",
  );
  rejects(
    () =>
      project.act(d, "collect", { reservationId: "sample-reservation" }, later),
    "expired",
  );
});
test("Currency display preserves cents above Number safe integer range", () => {
  assert.equal(cash(200000000000000001n), "EGP 2,000,000,000,000,000.01");
  assert.equal(cash(-1n), "-EGP 0.01");
});
