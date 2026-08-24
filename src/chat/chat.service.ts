import * as repository from "./chat.repository";

export async function getUsers(search?: string) {
    return repository.findUsers(search);
}

export async function getConversations(userId: string) {
    return repository.findUserConversations(userId);
}

export async function getConversationMembers(
    conversationId: string
) {
    return repository.findConversationMembers(
        conversationId
    );
}

export async function createDirectChat(
    userId: string,
    otherUserId: string
) {
    if (userId === otherUserId) {
        throw new Error("You cannot start a chat with yourself");
    }

    const otherUser =
        await repository.findUserById(otherUserId);

    if (!otherUser) {
        throw new Error("User not found");
    }

    const existing =
        await repository.findDirectConversation(
            userId,
            otherUserId
        );

    if (existing) {
        return existing;
    }

    return repository.createDirectConversation(
        userId,
        otherUserId
    );
}

export async function createGroupChat(
    userId: string,
    name: string,
    memberIds: string[]
) {
    const trimmedName = name.trim();

    if (!trimmedName) {
        throw new Error("Group name is required");
    }

    if (trimmedName.length > 100) {
        throw new Error(
            "Group name cannot exceed 100 characters"
        );
    }

    const uniqueMemberIds = [
        ...new Set(memberIds),
    ].filter((id) => id !== userId);

    if (uniqueMemberIds.length === 0) {
        throw new Error(
            "A group must contain at least one other member"
        );
    }

    const users = await Promise.all(
        uniqueMemberIds.map((id) =>
            repository.findUserById(id)
        )
    );

    if (users.some((user) => !user)) {
        throw new Error(
            "One or more selected users do not exist"
        );
    }

    return repository.createGroupConversation(
        userId,
        trimmedName,
        uniqueMemberIds
    );
}

export async function getMessages(
    userId: string,
    conversationId: string
) {
    const membership =
        await repository.findMembership(
            conversationId,
            userId
        );

    if (!membership) {
        throw new Error("You are not a member of this conversation");
    }

    const messages =
        await repository.findMessages(conversationId);

    return messages.reverse();
}

export async function sendMessage(
    userId: string,
    conversationId: string,
    content: string
) {
    const membership =
        await repository.findMembership(
            conversationId,
            userId
        );

    if (!membership) {
        throw new Error("You are not a member of this conversation");
    }

    const trimmedContent = content.trim();

    if (!trimmedContent) {
        throw new Error("Message cannot be empty");
    }

    if (trimmedContent.length > 5000) {
        throw new Error(
            "Message cannot exceed 5000 characters"
        );
    }

    return repository.createMessage(
        conversationId,
        userId,
        trimmedContent
    );
}

export async function addMember(
    requesterId: string,
    conversationId: string,
    userId: string
) {
    const requester =
        await repository.findMembership(
            conversationId,
            requesterId
        );

    if (!requester) {
        throw new Error(
            "You are not a member of this conversation"
        );
    }

    const conversation =
        await repository.findConversationById(
            conversationId
        );

    if (!conversation) {
        throw new Error("Conversation not found");
    }

    if (conversation.type !== "GROUP") {
        throw new Error(
            "Members can only be added to groups"
        );
    }

    const user =
        await repository.findUserById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    const existing =
        await repository.findMembership(
            conversationId,
            userId
        );

    if (existing) {
        throw new Error(
            "User is already a member"
        );
    }

    return repository.addConversationMember(
        conversationId,
        userId
    );
}

export async function removeMember(
    requesterId: string,
    conversationId: string,
    userId: string
) {
    const requester =
        await repository.findMembership(
            conversationId,
            requesterId
        );

    if (!requester) {
        throw new Error(
            "You are not a member of this conversation"
        );
    }

    const conversation =
        await repository.findConversationById(
            conversationId
        );

    if (!conversation) {
        throw new Error("Conversation not found");
    }

    if (conversation.type !== "GROUP") {
        throw new Error(
            "Members can only be removed from groups"
        );
    }

    return repository.removeConversationMember(
        conversationId,
        userId
    );



}

export async function updateMessage(
    userId: string,
    messageId: string,
    content: string
) {
    const trimmedContent =
        content.trim();

    if (!trimmedContent) {
        throw new Error(
            "Message content cannot be empty"
        );
    }

    const message =
        await repository.findMessageById(
            messageId
        );

    if (!message) {
        throw new Error(
            "Message not found"
        );
    }

    if (message.senderId !== userId) {
        throw new Error(
            "You can only edit your own messages"
        );
    }

    if (message.deletedAt) {
        throw new Error(
            "Deleted messages cannot be edited"
        );
    }

    const membership =
        await repository.findConversationMember(
            message.conversationId,
            userId
        );

    if (!membership) {
        throw new Error(
            "You are not a member of this conversation"
        );
    }

    return repository.updateMessage(
        messageId,
        trimmedContent
    );
}

export async function deleteMessage(
    userId: string,
    messageId: string
) {
    const message =
        await repository.findMessageById(
            messageId
        );

    if (!message) {
        throw new Error(
            "Message not found"
        );
    }

    if (message.senderId !== userId) {
        throw new Error(
            "You can only delete your own messages"
        );
    }

    if (message.deletedAt) {
        throw new Error(
            "Message is already deleted"
        );
    }

    const membership =
        await repository.findConversationMember(
            message.conversationId,
            userId
        );

    if (!membership) {
        throw new Error(
            "You are not a member of this conversation"
        );
    }

    return repository.softDeleteMessage(
        messageId
    );
}

export async function markConversationRead(
    userId: string,
    conversationId: string
) {
    const member =
        await repository.findConversationMember(
            conversationId,
            userId
        );

    if (!member) {
        throw new Error(
            "You are not a member of this conversation"
        );
    }

    return repository.markConversationRead(
        conversationId,
        userId
    );
}


export async function getUnreadCounts(
    userId: string
) {
    return repository.getUnreadCounts(
        userId
    );
}

export async function getUnreadCount(
    userId: string,
    conversationId: string
) {
    return repository.getUnreadCount(
        conversationId,
        userId
    );
}