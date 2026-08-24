import { prisma } from "../prisma/client";

export async function findUsers(search?: string) {
    return prisma.user.findMany({
        where: search
            ? {
                OR: [
                    {
                        name: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    {
                        email: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                ],
            }
            : undefined,
        select: {
            id: true,
            name: true,
            email: true,
        },
        orderBy: {
            name: "asc",
        },
    });
}

export async function findUserById(userId: string) {
    return prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            name: true,
            email: true,
        },
    });
}

export async function findConversationById(
    conversationId: string
) {
    return prisma.conversation.findUnique({
        where: {
            id: conversationId,
        },
        include: {
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        },
    });
}

export async function findMembership(
    conversationId: string,
    userId: string
) {
    return prisma.conversationMember.findUnique({
        where: {
            conversationId_userId: {
                conversationId,
                userId,
            },
        },
    });
}

export async function findDirectConversation(
    userId: string,
    otherUserId: string
) {
    return prisma.conversation.findFirst({
        where: {
            type: "DIRECT",
            AND: [
                {
                    members: {
                        some: {
                            userId,
                        },
                    },
                },
                {
                    members: {
                        some: {
                            userId: otherUserId,
                        },
                    },
                },
            ],
        },
        include: {
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        },
    });
}

export async function createDirectConversation(
    userId: string,
    otherUserId: string
) {
    return prisma.conversation.create({
        data: {
            type: "DIRECT",
            createdById: userId,
            members: {
                create: [
                    {
                        userId,
                    },
                    {
                        userId: otherUserId,
                    },
                ],
            },
        },
        include: {
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        },
    });
}

export async function createGroupConversation(
    userId: string,
    name: string,
    memberIds: string[]
) {
    const uniqueMemberIds = [
        ...new Set([userId, ...memberIds]),
    ];

    return prisma.conversation.create({
        data: {
            type: "GROUP",
            name,
            createdById: userId,
            members: {
                create: uniqueMemberIds.map((memberId) => ({
                    userId: memberId,
                })),
            },
        },
        include: {
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        },
    });
}

export async function addConversationMember(
    conversationId: string,
    userId: string
) {
    return prisma.conversationMember.create({
        data: {
            conversationId,
            userId,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });
}

export async function removeConversationMember(
    conversationId: string,
    userId: string
) {
    return prisma.conversationMember.delete({
        where: {
            conversationId_userId: {
                conversationId,
                userId,
            },
        },
    });
}

export async function findUserConversations(
    userId: string
) {
    const conversations =
        await prisma.conversation.findMany({
            where: {
                members: {
                    some: {
                        userId,
                    },
                },
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },

                messages: {
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 1,
                    include: {
                        sender: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },

            orderBy: {
                updatedAt: "desc",
            },
        });

    const result =
        await Promise.all(
            conversations.map(
                async (conversation) => {
                    const unreadCount =
                        await getUnreadCount(
                            conversation.id,
                            userId
                        );

                    return {
                        ...conversation,
                        unreadCount,
                    };
                }
            )
        );

    return result;
}


export async function findMessages(
    conversationId: string,
    limit = 50
) {
    return prisma.message.findMany({
        where: {
            conversationId,
            deletedAt: null,
        },
        include: {
            sender: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        take: limit,
    });
}

export async function createMessage(
    conversationId: string,
    senderId: string,
    content: string
) {
    return prisma.message.create({
        data: {
            conversationId,
            senderId,
            content,
        },
        include: {
            sender: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });
}

export async function findMessageById(
    messageId: string
) {
    return prisma.message.findUnique({
        where: {
            id: messageId,
        },
        select: {
            id: true,
            conversationId: true,
            senderId: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            deletedAt: true,
        },
    });
}

export async function updateMessage(
    messageId: string,
    content: string
) {
    return prisma.message.update({
        where: {
            id: messageId,
        },
        data: {
            content,
            updatedAt: new Date(),
        },
        include: {
            sender: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });
}

export async function softDeleteMessage(
    messageId: string
) {
    return prisma.message.update({
        where: {
            id: messageId,
        },
        data: {
            deletedAt: new Date(),
        },
        select: {
            id: true,
            conversationId: true,
            senderId: true,
            deletedAt: true,
        },
    });
}

export async function findConversationMember(
    conversationId: string,
    userId: string
) {
    return prisma.conversationMember.findUnique({
        where: {
            conversationId_userId: {
                conversationId,
                userId,
            },
        },
        select: {
            id: true,
            conversationId: true,
            userId: true,
            joinedAt: true,
            lastReadAt: true,
        },
    });
}


export async function findConversationMembers(
    conversationId: string
) {
    return prisma.conversationMember.findMany({
        where: {
            conversationId,
        },
        select: {
            userId: true,
        },
    });
}

export async function markConversationRead(
    conversationId: string,
    userId: string
) {
    return prisma.conversationMember.update({
        where: {
            conversationId_userId: {
                conversationId,
                userId,
            },
        },
        data: {
            lastReadAt: new Date(),
        },
    });
}

export async function getUnreadCount(
    conversationId: string,
    userId: string
) {
    const member =
        await prisma.conversationMember.findUnique({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId,
                },
            },
            select: {
                lastReadAt: true,
            },
        });

    if (!member) {
        return 0;
    }

    return prisma.message.count({
        where: {
            conversationId,
            senderId: {
                not: userId,
            },
            deletedAt: null,
            ...(member.lastReadAt
                ? {
                    createdAt: {
                        gt: member.lastReadAt,
                    },
                }
                : {}),
        },
    });
}

export async function getUnreadCounts(
    userId: string
) {
    const memberships =
        await prisma.conversationMember.findMany({
            where: {
                userId,
            },
            select: {
                conversationId: true,
                lastReadAt: true,
            },
        });

    const result = await Promise.all(
        memberships.map(async (member) => {
            const count =
                await prisma.message.count({
                    where: {
                        conversationId:
                            member.conversationId,

                        senderId: {
                            not: userId,
                        },

                        deletedAt: null,

                        ...(member.lastReadAt
                            ? {
                                createdAt: {
                                    gt: member.lastReadAt,
                                },
                            }
                            : {}),
                    },
                });

            return {
                conversationId:
                    member.conversationId,

                unreadCount: count,
            };
        })
    );

    return result;
}