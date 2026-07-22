import summaryRepository from "../repositories/summary.repository";
import { getISTTodayRange } from "../utils/date";

class SummaryService {
    async getSummary() {
        const { start, end } = getISTTodayRange();

        const [users, reports] = await Promise.all([
            summaryRepository.getUsers(),
            summaryRepository.getTodayReports(start, end),
        ]);

        const reportMap = new Map(
            reports.map((report) => [report.userId, report])
        );

        return users.flatMap((user) => {
            const report = reportMap.get(user.id);

            return report
                ? [
                      {
                          name: user.name,
                          description: report.description,
                      },
                  ]
                : [];
        });
    }
}

export default new SummaryService();