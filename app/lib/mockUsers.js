const now = () => new Date().toISOString();

const seedUsers = () => [
  {
    id: "u-admin",
    username: "rajesh",
    password: "admin",
    role: "admin",
    access: "write",
    lastLoginAt: null,
    createdAt: now(),
    updatedAt: now(),
  },
];

const getStore = () => {
  if (!globalThis.__mockUsers) {
    globalThis.__mockUsers = seedUsers();
  }
  return globalThis.__mockUsers;
};

const setStore = (next) => {
  globalThis.__mockUsers = next;
};

let users = getStore();

export function findUser(username) {
  return users.find((u) => u.username.toLowerCase() === username.toLowerCase()) || null;
}

export function verifyUser(username, password) {
  const user = findUser(username);
  if (!user) return null;
  if (user.password !== password) return null;
  user.lastLoginAt = now();
  user.updatedAt = now();
  setStore(users);
  return user;
}

export function createUser(username, password) {
  const existing = findUser(username);
  if (existing) return existing;
  const user = {
    id: `u-${Math.random().toString(36).slice(2, 8)}`,
    username,
    password,
    role: "user",
    access: "read",
    lastLoginAt: now(),
    createdAt: now(),
    updatedAt: now(),
  };
  users = [user, ...users];
  setStore(users);
  return user;
}

export function listUsers() {
  return users.map(({ password, ...rest }) => rest);
}

export function updateUserAccess(username, access) {
  const user = findUser(username);
  if (!user) return null;
  if (user.role === "admin") return user;
  user.access = access;
  user.updatedAt = now();
  setStore(users);
  return user;
}

export function getUserAccess(username) {
  const user = findUser(username);
  return user?.access || null;
}
