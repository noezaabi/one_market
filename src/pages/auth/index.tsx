import React from "react";
import { SiweMessage } from "siwe";
import { arbitrum } from "viem/chains";
import { useAccount, useSignMessage } from "wagmi";
import { useWeb3Modal } from "@web3modal/react";
import { getCsrfToken, signIn } from "next-auth/react";

const AuthPage = () => {
  const [mounted, setMounted] = React.useState(false);
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const { signMessageAsync } = useSignMessage();
  const [hasSigned, setHasSigned] = React.useState(false);

  React.useEffect(() => setMounted(true), []);
  if (!mounted) return <></>;

  const handleSign = async () => {
    if (!isConnected) open();
    try {
      const message = new SiweMessage({
        domain: window.location.host,
        uri: window.location.origin,
        version: "1",
        address: address,
        statement: process.env.NEXT_PUBLIC_SIGNIN_MESSAGE,
        nonce: await getCsrfToken(),
        chainId: arbitrum.id,
      });

      const signedMessage = await signMessageAsync({
        message: message.prepareMessage(),
      });

      setHasSigned(true);

      const response = await signIn("web3", {
        message: JSON.stringify(message),
        signedMessage,
        redirect: true,
        callbackUrl: "/hidden",
      });
      if (response?.error) {
        console.log("Error occured:", response.error);
      }
    } catch (error) {
      console.log("Error Occured", error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      {!isConnected && (
        <>
          <h2 className="text-5xl font-semibold text-gray-400">Firstly,</h2>
          <p className="mb-6 mt-2 text-xl text-gray-500">
            you <span className="font-extrabold text-gray-300">need</span> to
          </p>
          <button
            className="rounded-lg bg-blue-700 px-4 py-2 hover:border hover:border-blue-700 hover:bg-transparent"
            onClick={() => open()}
          >
            Connect Wallet
          </button>
        </>
      )}
      {isConnected && !hasSigned && (
        <>
          <p className="text-xl font-semibold text-gray-400">
            Welcome {address?.slice(0, 8)}...
          </p>
          <button
            className="mt-2 rounded-lg bg-violet-700 px-4 py-2 hover:border hover:border-violet-700 hover:bg-transparent"
            onClick={handleSign}
          >
            Sign Message to Login
          </button>
          <button
            className="mt-2 rounded-lg bg-yellow-400 px-4 py-2 hover:border hover:border-orange-700 hover:bg-transparent"
            onClick={() => open()}
          >
            Disconnect Wallet
          </button>
        </>
      )}
      {isConnected && hasSigned && (
        <p>You are being authenticated. Please wait...</p>
      )}
    </main>
  );
};

export default AuthPage;
