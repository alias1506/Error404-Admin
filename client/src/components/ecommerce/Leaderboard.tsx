interface LeaderboardUser {
  _id: string;
  username: string;
  email?: string;
  xp: number;
  level: number;
  streak?: number;
  attemptedQuestions?: string[];
  solvedQuestions?: string[];
  rankScore?: number;
}

const getRankStyle = (index: number, score: number) => {
  if (!score || score === 0) return "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400";
  if (index === 0) return "bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-500";
  if (index === 1) return "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
  if (index === 2) return "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-500";
  return "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-500";
};

interface LeaderboardProps {
  users: LeaderboardUser[];
}

export default function Leaderboard({ users = [] }: LeaderboardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 h-full flex flex-col min-h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Leaderboard
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Top users by composite score
          </p>
        </div>
      </div>
      
      <div className="flex-1">
        <ul className="flex flex-col gap-4">
          {users.slice(0, 5).map((user, index) => (
            <li key={user._id || index} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold shadow-sm ${getRankStyle(index, user.rankScore || 0)}`}>
                  #{index + 1}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">{user.username}</h4>
                  {user.email && <p className="text-xs text-gray-400 dark:text-gray-500">{user.email}</p>}
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-0.5">
                <span className="text-sm font-bold text-gray-800 dark:text-white/90">{user.rankScore || 0} pts</span>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-brand-500 font-medium">{user.xp || 0} XP</span>
                  <span className="text-green-500 font-medium">{user.solvedQuestions?.length || 0} solved</span>
                  <span className="text-blue-400 font-medium">{user.attemptedQuestions?.length || 0} tried</span>
                </div>
              </div>
            </li>
          ))}
          {(!users || users.length === 0) && (
            <div className="text-center py-10 text-gray-500">No users found on the leaderboard.</div>
          )}
        </ul>
      </div>
    </div>
  );
}
