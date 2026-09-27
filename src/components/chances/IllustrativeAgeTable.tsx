import { formatChancePercent, probabilityAtLeastK } from "@/data/chanceModel";

const ILLUSTRATIVE_AGES = [34, 37, 42];
const ILLUSTRATIVE_EGGS = 20;

export default function IllustrativeAgeTable() {
  const rows = ILLUSTRATIVE_AGES.map((age) => ({
    age,
    percent: formatChancePercent(probabilityAtLeastK(age, ILLUSTRATIVE_EGGS, 1)),
  }));

  return (
    <div className="overflow-x-auto rounded-2xl border-2 border-mist-200 bg-white shadow-card">
      <table className="w-full min-w-[420px] border-collapse text-right text-sm">
        <thead>
          <tr className="border-b border-mist-200 bg-mist-50/80">
            <th className="whitespace-nowrap px-4 py-3 font-semibold text-ink sm:px-5">
              גיל בזמן ההקפאה
            </th>
            <th className="whitespace-nowrap px-4 py-3 font-semibold text-ink sm:px-5">
              ביציות בשלות
            </th>
            <th className="whitespace-nowrap px-4 py-3 font-semibold text-ink sm:px-5">
              הערכת המודל: לידת חי אחת לפחות
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.age} className={idx % 2 === 1 ? "bg-mist-50/40" : undefined}>
              <td className="whitespace-nowrap px-4 py-3 align-top font-semibold text-ink sm:px-5">
                {row.age}
              </td>
              <td className="whitespace-nowrap px-4 py-3 align-top text-ink/80 sm:px-5">
                {ILLUSTRATIVE_EGGS}
              </td>
              <td className="whitespace-nowrap px-4 py-3 align-top text-ink/80 sm:px-5">
                כ-{row.percent}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
