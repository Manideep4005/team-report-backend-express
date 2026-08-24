import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware";

import {
    getUsers,
    getConversations,
    createDirectChat,
    createGroupChat,
    getMessages,
    sendMessage,
    addMember,
    removeMember,
    deleteMessage,
    updateMessage,
} from "./chat.controller";

const router = Router();

router.use(authenticate);

router.get("/users", getUsers);

router.get(
    "/conversations",
    getConversations
);

router.post(
    "/conversations/direct",
    createDirectChat
);

router.post(
    "/conversations/group",
    createGroupChat
);

router.get(
    "/conversations/:conversationId/messages",
    getMessages
);

router.post(
    "/conversations/:conversationId/messages",
    sendMessage
);

router.post(
    "/conversations/:conversationId/members",
    addMember
);

router.delete(
    "/conversations/:conversationId/members/:userId",
    removeMember
);

router.patch(
    "/messages/:messageId",
    updateMessage
);

router.delete(
    "/messages/:messageId",
    deleteMessage
);
export default router;