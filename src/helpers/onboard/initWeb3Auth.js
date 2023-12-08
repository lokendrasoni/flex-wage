import { CHAIN_NAMESPACES } from "@web3auth/base";
import { Web3Auth } from "@web3auth/modal";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";

const clientId = process.env.NEXT_PUBLIC_WEB3_AUTH_CLIENT_ID;

const web3auth = new Web3Auth({
    clientId,
    web3AuthNetwork: "testnet", // mainnet, aqua,  cyan or testnet
    chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: "0x1",
        rpcTarget: "https://rpc.ankr.com/eth", // This is the public RPC we have added, please pass on your own endpoint while creating an app
    },
    uiConfig: {
        theme: "dark",
        loginMethodsOrder: ["facebook", "google"],
        appLogo: "https://web3auth.io/images/w3a-L-Favicon-1.svg", // Your App Logo Here
    },
});

const openloginAdapter = new OpenloginAdapter({
    loginSettings: {
        mfaLevel: "default", // Pass on the mfa level of your choice: default, optional, mandatory, none
    },
    adapterSettings: {
        whiteLabel: {
            name: "Your app Name",
            logoLight: "https://web3auth.io/images/w3a-L-Favicon-1.svg",
            logoDark: "https://web3auth.io/images/w3a-D-Favicon-1.svg",
            defaultLanguage: "en",
            dark: true, // whether to enable dark mode. defaultValue: false
        },
    },
});
web3auth.configureAdapter(openloginAdapter);

export const initWeb3auth = web3auth;
