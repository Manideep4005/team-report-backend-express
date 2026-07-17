import reportRepository from "../repositories/report.repository";
import { getISTRange, getISTTodayRange } from "../utils/date";

class ReportService {

    async save(userId: string, description: string) {

        const { start, end } = getISTTodayRange();

        const report = await reportRepository.findToday(
            userId,
            start,
            end
        );

        if (report) {

            return reportRepository.update(
                report.id,
                description
            );

        }

        return reportRepository.create(
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