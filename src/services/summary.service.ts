import summaryRepository from "../repositories/summary.repository";
import { getISTTodayRange } from "../utils/date";

class SummaryService {

    async getSummary() {

        const { start, end } = getISTTodayRange();

        const [users, reports] = await Promise.all([
            summaryRepository.getUsers(),
            summaryRepository.getTodayReports(start, end),
        ]);

        let summary = "";

        users.forEach((user) => {

            const report = reports.find(
                r => r.userId === user.id
            );

            summary += `${user.name}\n`;

            if (report) {
                summary += `${report.description}\n\n`;
            } else {
                summary += "Pending\n\n";
            }

        });

        return summary;

    }

}

export default new SummaryService();