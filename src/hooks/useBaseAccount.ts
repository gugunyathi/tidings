import { createBaseAccountSDK } from "@base-org/account";
import { useState, useCallback } from "react";

export interface BaseUser {
  address: string;
  message: string;
  signature: string;
}

let sdkInstance: ReturnType<typeof createBaseAccountSDK> | null = null;

function getSDK() {
  if (!sdkInstance) {
    sdkInstance = createBaseAccountSDK({
      appName: "Tidings",
      appLogoUrl: "https://tidingsapp.vercel.app/favicon.ico",
    });
  }
  return sdkInstance;
}

export function useBaseAccount() {
  const [baseUser, setBaseUser] = useState<BaseUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = getSDK().getProvider();

      // Generate nonce before user interaction to avoid popup blockers
      const nonce = crypto.randomUUID().replace(/-/g, "");

      // 1 — Switch to Base Mainnet
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x2105" }],
      });

      // 2 — Connect and authenticate
      const { accounts } = await provider.request({
        method: "wallet_connect",
        params: [
          {
            version: "1",
            capabilities: {
              signInWithEthereum: {
                nonce,
                chainId: "0x2105",
              },
            },
          },
        ],
      }) as { accounts: { address: string; capabilities: { signInWithEthereum: { message: string; signature: string } } }[] };

      const { address } = accounts[0];
      const { message, signature } = accounts[0].capabilities.signInWithEthereum;

      const user: BaseUser = { address, message, signature };
      setBaseUser(user);
      return user;
    } catch (err: any) {
      // Fallback: method_not_supported — wallet doesn't support wallet_connect yet
      if (err?.code === 4200 || err?.message?.includes("method_not_supported")) {
        setError("Your wallet doesn't support Sign in with Base yet. Try updating it.");
      } else {
        setError(err?.message ?? "Sign in failed");
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(() => {
    setBaseUser(null);
    setError(null);
  }, []);

  return { baseUser, loading, error, signIn, signOut };
}
