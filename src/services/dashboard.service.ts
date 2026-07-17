import dashboardRepository from "../repositories/dashboard.repository";
import { getISTTodayRange } from "../utils/date";

class DashboardService {

    async getDashboard(userId: string) {

        const { start, end } = getISTTodayRange();

        const [users, reports] = await Promise.all([
            dashboardRepository.getUsers(),
            dashboardRepository.getTodayReports(start, end),
        ]);

        const myReport =
            reports.find(r => r.userId === userId) || null;

        const teamStatus = users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            submitted: reports.some(r => r.userId === user.id),
        }));

        return {
            stats: {
                submitted: reports.length,
                pending: users.length - reports.length,
                totalMembers: users.length,
                completion:
                    users.length === 0
                        ? 0
                        : Math.round(
                            (reports.length / users.length) * 100
                        ),
            },
            reports,
            myReport,
            teamStatus,
        };
    }
}

export default new DashboardService();