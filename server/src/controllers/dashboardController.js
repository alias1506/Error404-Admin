const User = require('../models/User');

const getDashboardStats = async () => {
  try {
    const totalUsers = await User.countDocuments();
    
    // We can define active users as users who have logged in. We'll just use totalUsers as a placeholder if no complex logic.
    const activeUsers = totalUsers;
    
    // Monthly registrations (mapped to 'sales' in the template)
    const monthlySales = Array(12).fill(0);
    const users = await User.find({}, 'createdAt');
    users.forEach(user => {
      if (user.createdAt) {
        const month = new Date(user.createdAt).getMonth();
        monthlySales[month]++;
      }
    });

    // Composite leaderboard ranking:
    //   Score = (xp * 0.5) + (solvedCount * 30 * 0.3) + (attemptCount * 20 * 0.2)
    //   XP      = 50% weight  (raw value, rewards quality)
    //   Solved  = 30% weight  (30 pts per solved question, rewards completion)
    //   Attempt = 20% weight  (20 pts per unique attempt, rewards participation)
    const leaderboardRaw = await User.find(
      {},
      'username email xp level streak solvedQuestions attemptedQuestions achievements createdAt warnings'
    );

    const leaderboard = leaderboardRaw.map(user => {
      const solvedCount = user.solvedQuestions?.length || 0;
      const attemptCount = user.attemptedQuestions?.length || 0;
      const rankScore = (user.xp * 0.5) + (solvedCount * 30 * 0.3) + (attemptCount * 20 * 0.2);
      return {
        _id: user._id,
        username: user.username,
        email: user.email,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        solvedQuestions: user.solvedQuestions,
        attemptedQuestions: user.attemptedQuestions,
        achievements: user.achievements,
        createdAt: user.createdAt,
        warnings: user.warnings || 0,
        rankScore: Math.round(rankScore * 100) / 100
      };
    })
    .sort((a, b) => {
      const aWarnings = a.warnings >= 3 ? 3 : a.warnings;
      const bWarnings = b.warnings >= 3 ? 3 : b.warnings;
      if (aWarnings !== bWarnings) return aWarnings - bWarnings;
      return b.rankScore - a.rankScore;
    })
    .slice(0, 10);

    return {
      customers: totalUsers,
      orders: activeUsers,
      monthlySales: monthlySales,
      statistics: Array(7).fill(0), // Placeholder for weekly stats
      revenue: 0,
      target: 0,
      leaderboard: leaderboard
    };
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    return {
      customers: 0,
      orders: 0,
      monthlySales: Array(12).fill(0),
      statistics: Array(7).fill(0),
      revenue: 0,
      target: 0,
      leaderboard: []
    };
  }
};

const getDashboardStatsHandler = async (req, res) => {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getDashboardStats,
  getDashboardStatsHandler
};
