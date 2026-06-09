import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface LeaderboardUser {
  _id: string;
  username: string;
  email?: string;
  xp: number;
  level: number;
  streak?: number;
  solvedQuestions?: string[];
  attemptedQuestions?: string[];
  achievements?: string[];
  createdAt?: string;
  rankScore?: number;
}

const getRankStyle = (index: number, score: number) => {
  if (!score || score === 0) return "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400";
  if (index === 0) return "bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-500";
  if (index === 1) return "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
  if (index === 2) return "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-500";
  return "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-500";
};

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/dashboard/stats`)
      .then(res => res.json())
      .then(data => {
        if (data.leaderboard) {
          setUsers(data.leaderboard);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <PageMeta
        title="Leaderboard | Error404 Admin"
        description="Top users ranked by composite score"
      />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Leaderboard
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Ranked by composite score — XP (50%) + Solved (30%) + Attempts (20%)
          </p>
        </div>
        
        {loading ? (
          <p className="text-gray-500">Loading leaderboard...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Rank</th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">User</th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400 text-center">Level</th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400 text-center">Streak</th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400 text-center">Attempts</th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400 text-center">Solved</th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400 text-center">Achievements</th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400 text-right">XP</th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400 text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user._id || index} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-4">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold shadow-sm ${getRankStyle(index, user.rankScore || 0)}`}>
                        #{index + 1}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-800 dark:text-white/90">{user.username}</div>
                      {user.email && <div className="text-xs text-gray-500">{user.email}</div>}
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-gray-700 dark:text-gray-300">
                      {user.level || 1}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-500">
                        🔥 {user.streak || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400">
                        {user.attemptedQuestions?.length || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400">
                        {user.solvedQuestions?.length || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-gray-700 dark:text-gray-300">
                      {user.achievements?.length || 0}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-brand-500">
                      {user.xp?.toLocaleString() || 0}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-bold text-gray-800 dark:text-white/90">{user.rankScore || 0}</span>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-gray-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
