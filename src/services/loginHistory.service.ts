import loginHistoryRepository from "../repositories/loginHistory.repository";

class LoginHistoryService {

    async getAll() {
        return loginHistoryRepository.findAll();
    }

    async getByUserId(userId: string) {
        return loginHistoryRepository.findByUserId(userId);
    }
}

export default new LoginHistoryService();