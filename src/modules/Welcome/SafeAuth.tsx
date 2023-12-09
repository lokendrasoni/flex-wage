import {
    Box,
    AppBar as MuiAppBar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    styled,
} from "@mui/material";
import { SafeAuthInitOptions, SafeAuthPack, SafeAuthUserInfo } from "@safe-global/auth-kit";
import { BrowserProvider, Eip1193Provider, ethers } from "ethers";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import SafeContext from "src/contexts/SafeContext";
import { SafeContextTypes } from "src/contexts/types/SafeContextTyes";
import AppBar from "./AppBar";

const SafeAuth = () => {
    const router = useRouter();
    const { safeAuthSignInResponse, setSafeAuthSignInResponse, setSafeAddress } = useContext(
        SafeContext,
    ) as SafeContextTypes;
    const [safeAuthPack, setSafeAuthPack] = useState<SafeAuthPack | undefined>();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
        !!safeAuthPack?.isAuthenticated,
    );
    const [userInfo, setUserInfo] = useState<SafeAuthUserInfo | null>(null);
    const [chainId, setChainId] = useState<string | undefined>();
    const [balance, setBalance] = useState<string | undefined>();
    const [provider, setProvider] = useState<BrowserProvider | undefined>();

    useEffect(() => {
        const initAuthPack = async () => {
            try {
                // Check if the code is running in the browser

                if (typeof window !== "undefined") {
                    const { SafeAuthPack } = await import("@safe-global/auth-kit");
                    const options: SafeAuthInitOptions = {
                        enableLogging: true,
                        buildEnv: "production",
                        chainConfig: {
                            chainId: chainId || "0x5",
                            rpcTarget: "https://gnosis.drpc.org",
                        },
                    };

                    const authPack = new SafeAuthPack();

                    await authPack.init(options);

                    console.log("safeAuthPack:safeEmbed", authPack.safeAuthEmbed);
                    console.log("authPack", authPack);

                    setSafeAuthPack(authPack);

                    authPack.subscribe("accountsChanged", async accounts => {
                        console.log(
                            "safeAuthPack:accountsChanged",
                            accounts,
                            authPack.isAuthenticated,
                        );
                        if (authPack.isAuthenticated) {
                            const signInInfo = await authPack?.signIn();
                            setSafeAuthSignInResponse(signInInfo);
                            setIsAuthenticated(true);
                        }
                    });

                    authPack.subscribe("chainChanged", eventData =>
                        console.log("safeAuthPack:chainChanged", eventData),
                    );
                }
            } catch (err) {
                console.log("error in useEffect ---- ", err);
            }
        };

        console.log("loggedin clicked");
        if (typeof window !== "undefined") initAuthPack();
    }, []);

    useEffect(() => {
        if (!safeAuthPack || !isAuthenticated) return;

        const safeAuthCheckFunc = async () => {
            const web3Provider = safeAuthPack.getProvider();
            const userInfo = await safeAuthPack.getUserInfo();
            console.log("userINfo", userInfo);

            setUserInfo(userInfo);

            if (web3Provider) {
                const provider = new BrowserProvider(safeAuthPack.getProvider() as Eip1193Provider);
                const signer = await provider.getSigner();
                const signerAddress = await signer.getAddress();

                setChainId((await provider?.getNetwork()).chainId.toString());
                setBalance(
                    ethers.formatEther(
                        (await provider.getBalance(signerAddress)) as ethers.BigNumberish,
                    ),
                );
                setProvider(provider);
            }
        };
        safeAuthCheckFunc();
    }, [isAuthenticated, safeAuthPack]);

    const login = async () => {
        const signInInfo = await safeAuthPack?.signIn();
        console.log("signInInfo --- ", signInInfo);
        setSafeAuthSignInResponse(signInInfo);
        setIsAuthenticated(true);
    };

    const logout = async () => {
        await safeAuthPack?.signOut();
        setSafeAuthSignInResponse(null);
    };

    const isLoggedIn = !!safeAuthPack?.isAuthenticated;

    return (
        <>
            {isLoggedIn && (
                <Box sx={{ display: "flex", heigth: "200px", background: "grey" }}>
                    <Box
                        sx={{
                            width: "70%",
                            display: "flex",
                            alignItems: "center",
                            paddingLeft: "400px",
                        }}
                    >
                        <Typography
                            variant="h3"
                            pl={25}
                            fontWeight={700}
                            sx={{ textDecoration: "white" }}
                        >
                            Buildoors...
                        </Typography>
                    </Box>
                </Box>
            )}
            <AppBar
                onLogin={login}
                onLogout={logout}
                userInfo={userInfo || undefined}
                isLoggedIn={!!safeAuthPack?.isAuthenticated}
                eoa={safeAuthSignInResponse?.eoa}
            />
            {isLoggedIn && (
                <TableContainer
                    sx={{
                        marginTop: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Table
                        sx={{
                            minWidth: 650,
                            border: "1px solid grey",
                            borderRadius: 10,
                            width: "50%",
                        }}
                        aria-label="simple table"
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell
                                    sx={{
                                        fontWeight: "bold",
                                        display: "flex",
                                        alignContent: "center",
                                        justifyContent: "center",
                                        fontSize: "30px",
                                    }}
                                >
                                    Safes
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {safeAuthSignInResponse?.safes.map(i => (
                                <TableRow
                                    key={i}
                                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                >
                                    <TableCell
                                        component="th"
                                        scope="row"
                                        sx={{
                                            fontWeight: "bold",
                                            display: "flex",
                                            alignContent: "center",
                                            justifyContent: "center",
                                            fontSize: "30px",
                                        }}
                                        onClick={() => {
                                            setSafeAddress(i);
                                            router.push("/dao/quick-send");
                                        }}
                                    >
                                        gor:{i}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </>
    );
};

const StyledAppBar = styled(MuiAppBar)`
    && {
        position: sticky;
        top: 0;
        background: "grey";
        height: 70px;
        align-items: center;
        justify-content: center;
        flex-direction: row;
        border-bottom: 2px solid ${({ theme }) => theme.palette.background.paper};
        box-shadow: none;
    }
`;

export default SafeAuth;
