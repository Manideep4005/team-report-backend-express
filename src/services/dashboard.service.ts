import dashboardRepository from "../repositories/dashboard.repository";
import { getISTDateRange, getISTTodayRange } from "../utils/date";

class DashboardService {

    async getDashboard(
        userId: string,
        date?: string
    ) {
        const { start, end } =
            date
                ? getISTDateRange(new Date(date))
                : getISTTodayRange();

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

    async getLoginPreview() {
        const { start, end } =
            getISTTodayRange();

        const [users, reports] = await Promise.all([
            dashboardRepository.getUsers(),
            dashboardRepository.getTodayReports(start, end),
        ]);

        const submittedUserIds = new Set(
            reports.map(report => report.userId)
        );

        const submitted = submittedUserIds.size;
        const totalMembers = users.length;

        return {
            date: start,

            stats: {
                submitted,
                pending: totalMembers - submitted,
                totalMembers,
                completion:
                    totalMembers === 0
                        ? 0
                        : Math.round(
                            (submitted / totalMembers) * 100
                        ),
            },

            teamStatus: users.map(user => ({
                name: user.name,
                submitted: submittedUserIds.has(user.id),
            })),
        };
    }
}
export default new DashboardService();