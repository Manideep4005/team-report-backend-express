import permissionRepository from "../repositories/permission.repository";

class PermissionService {
    async getAll() {
        return permissionRepository.findAll();
    }
}

export default new PermissionService();