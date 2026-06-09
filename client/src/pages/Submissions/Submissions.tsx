import PageMeta from "../../components/common/PageMeta";

export default function Submissions() {
  return (
    <>
      <PageMeta
        title="Submissions | Error404 Admin"
        description="View all user submissions"
      />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Submissions
        </h3>
        <p className="text-gray-500 dark:text-gray-400">Submissions list will go here.</p>
      </div>
    </>
  );
}
