import { Request, Response } from "express";
import * as chatService from "./chat.service";

function getUserId(req: Request): string {
    if (!req.user?.id) {
        throw new Error("Unauthorized");
    }

    return req.user.id;
}

export async function getUsers(
    req: Request,
    res: Response
) {
    try {
        const search =
            typeof req.query.search === "string"
                ? req.query.search
                : undefined;

        const users =
            await chatService.getUsers(search);

        return res.json({
            success: true,
            data: users,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch users",
        });
    }
}

export async function getConversations(
    req: Request,
    res: Response
) {
    try {
        const userId = getUserId(req);

        const conversations =
            await chatService.getConversations(userId);

        return res.json({
            success: true,
            data: conversations,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch conversations",
        });
    }
}

export async function createDirectChat(
    req: Request,
    res: Response
) {
    try {
        const userId = getUserId(req);

        const { userId: otherUserId } = req.body;

        if (!otherUserId) {
            return res.status(400).json({
                success: false,
                message: "userId is required",
            });
        }

        const conversation =
            await chatService.createDirectChat(
                userId,
                otherUserId
            );

        return res.status(201).json({
            success: true,
            data: conversation,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to create direct chat",
        });
    }
}

export async function createGroupChat(
    req: Request,
    res: Response
) {
    try {
        const userId = getUserId(req);

        const { name, memberIds } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Group name is required",
            });
        }

        if (!Array.isArray(memberIds)) {
            return res.status(400).json({
                success: false,
                message: "memberIds must be an array",
            });
        }

        const conversation =
            await chatService.createGroupChat(
                userId,
                name,
                memberIds
            );

        return res.status(201).json({
            success: true,
            data: conversation,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to create group",
        });
    }
}

export async function getMessages(
    req: Request,
    res: Response
) {
    try {
        const userId = getUserId(req);

        const { conversationId } = req.params;

        const messages =
            await chatService.getMessages(
                userId,
                conversationId as any
            );

        return res.json({
            success: true,
            data: messages,
        });
    } catch (error) {
        return res.status(403).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch messages",
        });
    }
}

export async function sendMessage(
    req: Request,
    res: Response
) {
    try {
        const userId = getUserId(req);

        const { conversationId } = req.params;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({
                success: false,
                message: "Message content is required",
            });
        }

        const message =
            await chatService.sendMessage(
                userId,
                conversationId as any,
                content
            );

        return res.status(201).json({
            success: true,
            data: message,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to send message",
        });
    }
}

export async function addMember(
    req: Request,
    res: Response
) {
    try {
        const requesterId = getUserId(req);

        const { conversationId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "userId is required",
            });
        }

        const member =
            await chatService.addMember(
                requesterId,
                conversationId as any,
                userId
            );

        return res.status(201).json({
            success: true,
            data: member,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to add member",
        });
    }
}

export async function removeMember(
    req: Request,
    res: Response
) {
    try {
        const requesterId = getUserId(req);

        const { conversationId, userId } =
            req.params;

        await chatService.removeMember(
            requesterId,
            conversationId as any,
            userId as any
        );

        return res.json({
            success: true,
            message: "Member removed successfully",
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to remove member",
        });
    }
}

export async function updateMessage(
    req: Request,
    res: Response
) {
    try {
        const userId = getUserId(req);

        const { messageId } =
            req.params;

        const { content } =
            req.body;

        if (
            typeof content !== "string" ||
            !content.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Message content is required",
            });
        }

        const message =
            await chatService.updateMessage(
                userId,
                messageId as any,
                content
            );

        return res.json({
            success: true,
            data: message,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to update message",
        });
    }
}

export async function deleteMessage(
    req: Request,
    res: Response
) {
    try {
        const userId = getUserId(req);

        const { messageId } =
            req.params;

        const message =
            await chatService.deleteMessage(
                userId,
                messageId as any
            );

        return res.json({
            success: true,
            data: message,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to delete message",
        });
    }
}