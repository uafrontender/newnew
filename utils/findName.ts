interface IAuthor {
  nickname?: string | null;
  username?: string | null;
}

function findName(text?: string | null, author?: IAuthor | null) {
  if (!text || !author) {
    return undefined;
  }

  if (author.nickname) {
    const nicknameIndex = text.indexOf(author.nickname);
    if (nicknameIndex > -1) {
      return {
        text: author.nickname,
        startsAtIndex: nicknameIndex,
      };
    }
  }

  if (author.username) {
    const usernameIndex = text.indexOf(author.username);
    if (usernameIndex > -1) {
      return {
        text: author.username,
        startsAtIndex: usernameIndex,
      };
    }
  }

  return undefined;
}

export default findName;
