// A tiny module-level bridge so UI (Nav) can trigger Privy login/logout
// WITHOUT calling Privy hooks itself. Privy hooks are only valid inside
// <PrivyProvider>, which only mounts when configured — so <PrivyBridge>
// (which is inside the provider) registers the real actions here, and the
// rest of the app calls these plain functions. In mock mode they stay no-ops
// and the app uses its own mock sign-in flow.
type Fn = () => void;

export const authBridge: { login: Fn; logout: Fn } = {
  login: () => {},
  logout: () => {},
};
