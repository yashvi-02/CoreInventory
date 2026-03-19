/**
 * Reusable callout that explains what a page does and what activities users can perform.
 * Use on every page to make the app easier to understand.
 */
const PageInfo = ({ title, description, activities }) => (
  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700">
    <p className="font-semibold text-slate-800 mb-1">{title}</p>
    <p className="mb-2">{description}</p>
    <p className="font-medium text-slate-700 mb-1">You can:</p>
    <ul className="list-disc list-inside space-y-0.5 text-slate-600">
      {activities.map((act, i) => (
        <li key={i}>{act}</li>
      ))}
    </ul>
  </div>
);

export default PageInfo;
