import summaryRepository from "../repositories/summary.repository";
import { getISTTodayRange } from "../utils/date";

class SummaryService {
    async getSummary() {
        const { start, end } = getISTTodayRange();

        const [users, reports] = await Promise.all([
            summaryRepository.getUsers(),
            summaryRepository.getTodayReports(start, end),
        ]);

        return users.map((user) => {
            const report = reports.find(
                (r) => r.userId === user.id
            );

            return {
                name: user.name,
                description: report?.description ?? "Pending",
            };
        });
    }
}

export default new SummaryService();