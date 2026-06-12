import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Loader from "../../components/common/Loader";

const API_URL = import.meta.env.VITE_API_URL || "";

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
  warnings?: number;
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
      <PageBreadcrumb pageTitle="Leaderboard" />
        
      <div className="mt-6 relative overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm dark:bg-gray-900/60 rounded-xl">
            <Loader text="Loading leaderboard..." />
          </div>
        )}
        <div className={`max-w-full overflow-x-auto ${loading ? 'opacity-40 pointer-events-none' : ''}`}>
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="w-[5%] px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">#</TableCell>
                    <TableCell isHeader className="w-[25%] px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">User</TableCell>
                    <TableCell isHeader className="w-[15%] px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                    <TableCell isHeader className="w-[10%] px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Level</TableCell>
                    <TableCell isHeader className="w-[10%] px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Streak</TableCell>
                    <TableCell isHeader className="w-[10%] px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Attempts</TableCell>
                    <TableCell isHeader className="w-[10%] px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Solved</TableCell>
                    <TableCell isHeader className="w-[10%] px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Achievements</TableCell>
                    <TableCell isHeader className="w-[10%] px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">XP</TableCell>
                    <TableCell isHeader className="w-[10%] px-5 py-4 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Score</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {!loading && users.length === 0 ? (
                    <TableRow>
                      <TableCell className="px-5 text-center text-gray-500 dark:text-gray-400 h-[350px]" colSpan={10}>
                        <div className="flex flex-col items-center justify-center h-full">
                          <svg className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <p className="text-lg font-medium text-gray-600 dark:text-gray-300">No leaderboard data</p>
                          <p className="text-sm">Leaderboard will appear here once users start solving questions.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user, index) => (
                      <TableRow key={user._id || index}>
                      <TableCell className="px-5 py-4 text-start text-sm text-gray-500 dark:text-gray-400">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold shadow-sm ${getRankStyle(index, user.rankScore || 0)}`}>
                          #{index + 1}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 overflow-hidden rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500 font-semibold text-lg">
                            {user.username?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div>
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                              {user.username}
                            </span>
                            <span className="block text-gray-500 text-theme-xs dark:text-gray-400 mt-0.5">
                              {user.email || 'No email provided'}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-sm">
                        <div className="flex flex-col gap-1.5 items-start">
                          {(user.warnings || 0) >= 3 ? (
                            <Badge color="error">Disqualified</Badge>
                          ) : (
                            <Badge color="success">Active</Badge>
                          )}
                          {(user.warnings || 0) > 0 && (user.warnings || 0) < 3 && (
                            <Badge color="warning">{user.warnings}/3 Warnings</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold text-gray-800 dark:text-white/90">{user.level || 1}</span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 font-medium border border-orange-200 dark:border-orange-500/20">
                          🔥 {user.streak || 0}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-sm">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400">
                          {user.attemptedQuestions?.length || 0}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-sm">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400">
                          {user.solvedQuestions?.length || 0}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start font-medium text-gray-700 dark:text-gray-300">
                        {user.achievements?.length || 0}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start font-bold text-brand-500">
                        {user.xp?.toLocaleString() || 0} XP
                      </TableCell>
                      <TableCell className="px-5 py-4 text-end">
                        <span className="font-bold text-gray-800 dark:text-white/90">{user.rankScore || 0}</span>
                      </TableCell>
                    </TableRow>
                  ))
                  )}
                </TableBody>
              </Table>
            </div>
        </div>
    </>
  );
}
