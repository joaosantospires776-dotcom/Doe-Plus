
(() => {
  const ACCOUNT_KEY = 'doePlus.account';

  function readAccount() {
    const storedAccount = window.sessionStorage.getItem(ACCOUNT_KEY);

    if (!storedAccount) return null;

    try {
      return JSON.parse(storedAccount);
    } catch {
      window.sessionStorage.removeItem(ACCOUNT_KEY);
      return null;
    }
  }

  function writeAccount(account) {
    window.sessionStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
  }

  function getProfile() {
    const account = readAccount();
    return account ? { ...account.profile } : null;
  }

  window.DoeSession = {
    isAuthenticated() {
      const account = readAccount();
      return Boolean(account && account.authenticated);
    },

    getProfile,

    createAccount(profile) {
      writeAccount({
        authenticated: true,
        email: profile.email.trim().toLowerCase(),
        profile
      });
    },

    authenticate() {
      // A validação de e-mail e senha é feita pela API.
      return false;
    },

    updateProfile(profile) {
      const account = readAccount();

      if (!account || !account.authenticated) {
        throw new Error('Não há uma conta ativa nesta aba.');
      }

      account.profile = { ...account.profile, ...profile };
      account.email = account.profile.email.trim().toLowerCase();

      writeAccount(account);
    },

    clearAccount() {
      window.sessionStorage.removeItem(ACCOUNT_KEY);
    }
  };
})();
