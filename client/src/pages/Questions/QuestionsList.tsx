import PageMeta from "../../components/common/PageMeta";

export default function QuestionsList() {
  return (
    <>
      <PageMeta
        title="All Questions | Error404 Admin"
        description="List of all questions"
      />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          All Questions
        </h3>
        <p className="text-gray-500 dark:text-gray-400">Questions list will go here.</p>
      </div>
    </>
  );
}
