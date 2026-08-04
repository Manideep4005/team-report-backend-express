import reportRepository from "../repositories/report.repository";
import { getISTDateRange, getISTRange, getISTTodayRange } from "../utils/date";

class ReportService {

    async save(
        userId: string,
        description: string,
        reportDate: string
    ) {
        const { start } = getISTDateRange(
            new Date(reportDate)
        );

        return reportRepository.upsert(
            userId,
            description,
            start
        );
    }

    async today(userId: string) {

        const { start, end } = getISTTodayRange();

        return reportRepository.findToday(
            userId,
            start,
            end
        );
    }

    async history(
        userId: string,
        date?: string
    ) {

        let where = {};

        if (date) {

            const { start, end } = getISTRange(date);

            where = {
                reportDate: {
                    gte: start,
                    lt: end,
                },
            };

        }

        return reportRepository.history(
            userId,
            where
        );

    }
}

export default new ReportService();