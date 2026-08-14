import loginHistoryRepository from "../repositories/loginHistory.repository";

class LoginHistoryService {

    async getAll(page = 1, limit = 10) {

        const skip = (page - 1) * limit;

        const { items, total } =
            await loginHistoryRepository.findAll(
                skip,
                limit
            );

        return {
            items,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total as any / limit),
            },
        };
    }

    async getByUserId(userId: string) {
        return loginHistoryRepository.findByUserId(userId);
    }
}

export default new LoginHistoryService();