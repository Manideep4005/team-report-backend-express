import { Socket } from "socket.io";
import { parse } from "cookie";

import { verifyToken } from "../utils/jwt";
import { prisma } from "../prisma/client";

import * as chatService from "./chat.service";

export interface AuthenticatedSocket extends Socket {
    userId: string;
    userName: string;
    userEmail: string;
}

export async function authenticateSocket(
    socket: Socket,
    next: (err?: Error) => void
) {
    try {
        const cookieHeader =
            socket.handshake.headers.cookie;

        if (!cookieHeader) {
            return next(
                new Error("Unauthorized: no cookie")
            );
        }

        const tokenCookie = cookieHeader
            .split(";")
            .map((cookie) => cookie.trim())
            .find((cookie) =>
                cookie.startsWith("token=")
            );

        if (!tokenCookie) {
            return next(
                new Error("Unauthorized: token missing")
            );
        }

        const token = tokenCookie.substring(
            "token=".length
        );

        if (!token) {
            return next(
                new Error("Unauthorized: token empty")
            );
        }

        const payload =
            verifyToken(token);

        const user =
            await prisma.user.findUnique({
                where: {
                    id: payload.userId,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            });

        if (!user) {
            return next(
                new Error("User not found")
            );
        }

        const authenticatedSocket =
            socket as AuthenticatedSocket;

        authenticatedSocket.userId =
            user.id;

        authenticatedSocket.userName =
            user.name;

        authenticatedSocket.userEmail =
            user.email;

        next();
    } catch (error) {
        console.error(
            "❌ Socket authentication failed:",
            error
        );

        next(
            new Error("Invalid token")
        );
    }
}
export function registerChatSocketEvents(
    io: any,
    socket: AuthenticatedSocket
) {

    /**
 * Personal user room
 *
 * Every authenticated user gets their own room.
 * This allows us to send sidebar/unread updates
 * even when they are not inside a conversation.
 */
    socket.join(
        `user:${socket.userId}`
    );
    /**
     * Join a conversation room
     */
    socket.on(
        "join_conversation",
        async (conversationId: string) => {
            try {
                if (!conversationId) {
                    return socket.emit("chat_error", {
                        message:
                            "Conversation ID is required",
                    });
                }

                const membership =
                    await prisma.conversationMember.findUnique(
                        {
                            where: {
                                conversationId_userId: {
                                    conversationId,
                                    userId: socket.userId,
                                },
                            },
                        }
                    );

                if (!membership) {
                    return socket.emit("chat_error", {
                        message:
                            "You are not a member of this conversation",
                    });
                }

                await socket.join(
                    `conversation:${conversationId}`
                );

                socket.emit("conversation_joined", {
                    conversationId,
                });
            } catch {
                socket.emit("chat_error", {
                    message:
                        "Failed to join conversation",
                });
            }
        }
    );

    /**
     * Leave a conversation room
     */
    socket.on(
        "leave_conversation",
        async (conversationId: string) => {
            if (!conversationId) {
                return;
            }

            await socket.leave(
                `conversation:${conversationId}`
            );
        }
    );

    /**
     * Send a real-time message
     */
    socket.on(
        "send_message",
        async (data: {
            conversationId: string;
            content: string;
        }) => {
            try {
                if (
                    !data ||
                    !data.conversationId ||
                    !data.content
                ) {
                    return socket.emit("chat_error", {
                        message:
                            "Conversation ID and message content are required",
                    });
                }



                const message =
                    await chatService.sendMessage(
                        socket.userId,
                        data.conversationId,
                        data.content
                    );

                const room =
                    `conversation:${data.conversationId}`;

                /*
                 * 1. Send the actual message to everyone
                 * currently inside the conversation.
                 */
                io.to(room).emit(
                    "new_message",
                    message
                );

                /*
                 * 2. Get every member of the conversation.
                 */
                const members =
                    await chatService.getConversationMembers(
                        message.conversationId
                    );

                /*
                 * 3. Notify every member's personal room.
                 *
                 * This is what makes unread counts and
                 * conversation previews real-time.
                 */
                for (const member of members) {
                    const unreadCount =
                        member.userId === socket.userId
                            ? 0
                            : await chatService.getUnreadCount(
                                member.userId,
                                message.conversationId
                            );

                    io.to(
                        `user:${member.userId}`
                    ).emit(
                        "conversation_updated",
                        {
                            conversationId:
                                message.conversationId,

                            message,

                            unreadCount,
                        }
                    );
                }
            } catch (error) {
                socket.emit("chat_error", {
                    message:
                        error instanceof Error
                            ? error.message
                            : "Failed to send message",
                });
            }
        }
    );

    socket.on(
        "update_message",
        async (data) => {
            try {
                const message =
                    await chatService.updateMessage(
                        socket.userId,
                        data.messageId,
                        data.content
                    );

                io.to(
                    `conversation:${message.conversationId}`
                ).emit(
                    "message_updated",
                    message
                );
            } catch (error) {
                socket.emit("chat_error", {
                    message:
                        error instanceof Error
                            ? error.message
                            : "Failed to update message",
                });
            }
        }
    );

    socket.on(
        "delete_message",
        async (messageId: string) => {
            try {
                const message =
                    await chatService.deleteMessage(
                        socket.userId,
                        messageId
                    );

                io.to(
                    `conversation:${message.conversationId}`
                ).emit(
                    "message_deleted",
                    message
                );
            } catch (error) {
                socket.emit("chat_error", {
                    message:
                        error instanceof Error
                            ? error.message
                            : "Failed to delete message",
                });
            }
        }
    );

    socket.on(
        "mark_conversation_read",
        async (conversationId: string) => {
            try {
                await chatService.markConversationRead(
                    socket.userId,
                    conversationId
                );

                io.to(
                    `conversation:${conversationId}`
                ).emit(
                    "conversation_read",
                    {
                        conversationId,
                        userId:
                            socket.userId,
                    }
                );
            } catch (error) {
                socket.emit("chat_error", {
                    message:
                        error instanceof Error
                            ? error.message
                            : "Failed to mark conversation as read",
                });
            }
        }
    );

    /**
     * Typing indicator
     */
    socket.on(
        "typing",
        async (conversationId: string) => {
            if (!conversationId) {
                return;
            }

            const membership =
                await prisma.conversationMember.findUnique(
                    {
                        where: {
                            conversationId_userId: {
                                conversationId,
                                userId: socket.userId,
                            },
                        },
                    }
                );

            if (!membership) {
                return;
            }

            socket
                .to(
                    `conversation:${conversationId}`
                )
                .emit("user_typing", {
                    conversationId,
                    userId: socket.userId,
                    userName: socket.userName,
                });
        }
    );

    /**
     * Stop typing indicator
     */
    socket.on(
        "stop_typing",
        async (conversationId: string) => {
            if (!conversationId) {
                return;
            }

            socket
                .to(
                    `conversation:${conversationId}`
                )
                .emit("user_stopped_typing", {
                    conversationId,
                    userId: socket.userId,
                });
        }
    );
}