import { FunctionComponent, useState } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import { useContractWrite } from "wagmi";
import * as Slider from "@radix-ui/react-slider";
import toast from "react-hot-toast";

import { useWalletContext, getProvider } from "../../../components/v1/Wallet";
import { Metadata } from "./MarketMetadata";
import ToastError from "../../../uikit/toasts/Error";
import ToastSuccess from "../../../uikit/toasts/Success";

import { RedeemState } from "./States";
import { getExplorerLink } from "../../../utils/getExplorerLink";
import ToastInProgress from "../../../uikit/toasts/InProgress";
import { tokenBalanceFormatter } from "../../../utils/formatters";
import FormLoading from "./FormLoading";
import FormLoadingFailed from "./FormLoadingFailed";
import { useOraclePrice } from "../../../components/v1/swr/useCollateralPrice";
import { useLeveragedTokenNAV } from "../../../components/v1/swr/useLeveragedTokenNAV";
import { useTokenBalance } from "../../../components/v1/swr/useTokenBalance";
import VaultABI from "../../../abis/VaultABI";
import ButtonLoading from "../../../uikit/button/ButtonLoading";

/**
 * RedeemFormProps is a React Component properties that passed to React Component RedeemForm
 */
type RedeemFormProps = {
    chainID: number;
    address: string;
};

/**
 * RedeemForm is just yet another react component
 *
 * @link https://fettblog.eu/typescript-react/components/#functional-components
 */
const RedeemForm: FunctionComponent<RedeemFormProps> = ({ chainID, address }) => {
    // Global states
    const { account, chain, signer } = useWalletContext();
    const provider = getProvider({ chainId: chainID });
    const metadata = Metadata[chainID][address];

    // Read onchain data
    const oracleResponse = useOraclePrice({ oracle: metadata.oracleAddress, provider: provider });
    const navResponse = useLeveragedTokenNAV({ token: address, vault: metadata.vaultAddress, provider: provider });
    const balanceResponse = useTokenBalance({ account: account, token: address, provider: provider });

    // Parse onchain data
    const nav = parseFloat(ethers.utils.formatUnits(navResponse.data ? navResponse.data : 0, metadata.debtDecimals));
    const collateralPrice = parseFloat(ethers.utils.formatUnits(oracleResponse.data ? oracleResponse.data : 0, metadata.debtDecimals));
    const balance = parseFloat(ethers.utils.formatUnits(balanceResponse.data ? balanceResponse.data : 0, metadata.collateralDecimals));

    // Local states
    const [redeemState, setRedeemState] = useState<RedeemState>({ amount: 0 });

    // Prepare writing onchain data based on the state
    const [, redeem] = useContractWrite(
        {
            addressOrName: metadata.vaultAddress,
            contractInterface: VaultABI,
            signerOrProvider: signer,
        },
        "redeem",
        {
            args: [address, ethers.utils.parseUnits(redeemState.amount ? redeemState.amount.toString() : "0", metadata.collateralDecimals)],
        }
    );

    const redeemedValue = redeemState.amount ? (redeemState.amount * nav) / collateralPrice : 0;
    const minimalRedeemedValue = redeemedValue - redeemedValue * (5 / 100); // rough estimation

    // UI States
    const showLoading = oracleResponse.isLoading || navResponse.isLoading || balanceResponse.isLoading ? true : false;
    const showError = !showLoading && (oracleResponse.error || navResponse.error || balanceResponse.error) ? true : false;
    const showForm = !showLoading && !showError;

    const showNotEnoughBalanceButton = redeemState.amount && redeemState.amount > balance ? true : false;
    const showRedeemButton = !showNotEnoughBalanceButton;
    const showNormalSlider = !redeemState.amount || (redeemState.amount && redeemState.amount <= balance) ? true : false;
    const showRedSlider = !showNormalSlider;

    return (
        <div>
            {showLoading && <FormLoading />}
            {showError && <FormLoadingFailed />}
            {showForm && (
                <div className="mt-6">
                    <div className="flex flex-row items-center justify-between">
                        <p className="text-xs font-semibold leading-4 text-gray-light-12 dark:text-gray-dark-12">How many {metadata.title}?</p>
                    </div>
                    <form className="mt-2 flex flex-col space-y-4">
                        <div className="flex flex-row items-center justify-between rounded-lg bg-gray-light-3 p-4 dark:bg-gray-dark-3">
                            {/* Input form */}
                            <div className="grow">
                                <input
                                    className="gradient move-gradient w-full appearance-none bg-[length:250%_250%] bg-clip-text font-ibm text-2xl font-bold text-transparent outline-none transition-none placeholder:bg-clip-text placeholder:text-transparent focus:shadow-none focus:outline-none focus:ring-0"
                                    type="number"
                                    placeholder="0"
                                    min={0}
                                    max={tokenBalanceFormatter.format(balance)}
                                    value={redeemState.amount ? tokenBalanceFormatter.format(redeemState.amount) : 0}
                                    step={0.001}
                                    onChange={(e) => {
                                        if (e.target.value === "") {
                                            setRedeemState({ ...redeemState, amount: tokenBalanceFormatter.format(0) });
                                            return;
                                        }
                                        const value = parseFloat(e.target.value);
                                        setRedeemState({ ...redeemState, amount: tokenBalanceFormatter.format(value) });
                                    }}
                                />
                            </div>

                            {/* Max button */}
                            <div className="flex-none">
                                <button
                                    className="flex flex-row items-center space-x-2 outline-none"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setRedeemState({ ...redeemState, amount: tokenBalanceFormatter.format(balance) });
                                    }}
                                >
                                    <svg width="15" height="16" viewBox="0 0 15 16" xmlns="http://www.w3.org/2000/svg" className="fill-green-light-10 dark:fill-green-dark-10">
                                        <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M13.9 1.0001C13.9 0.779184 13.7209 0.600098 13.5 0.600098C13.2791 0.600098 13.1 0.779184 13.1 1.0001V1.6001H12.5C12.2791 1.6001 12.1 1.77918 12.1 2.0001C12.1 2.22101 12.2791 2.4001 12.5 2.4001H13.1V3.0001C13.1 3.22101 13.2791 3.4001 13.5 3.4001C13.7209 3.4001 13.9 3.22101 13.9 3.0001V2.4001H14.5C14.7209 2.4001 14.9 2.22101 14.9 2.0001C14.9 1.77918 14.7209 1.6001 14.5 1.6001H13.9V1.0001ZM11.8536 3.64654C12.0488 3.8418 12.0488 4.15838 11.8536 4.35365L10.8536 5.35365C10.6583 5.54891 10.3417 5.54891 10.1465 5.35365C9.9512 5.15839 9.9512 4.84181 10.1465 4.64655L11.1464 3.64655C11.3417 3.45128 11.6583 3.45128 11.8536 3.64654ZM9.85357 5.64654C10.0488 5.84181 10.0488 6.15839 9.85357 6.35365L2.85355 13.3537C2.65829 13.5489 2.34171 13.5489 2.14645 13.3537C1.95118 13.1584 1.95118 12.8418 2.14645 12.6465L9.14646 5.64654C9.34172 5.45128 9.65831 5.45128 9.85357 5.64654ZM13.5 5.6001C13.7209 5.6001 13.9 5.77918 13.9 6.0001V6.6001H14.5C14.7209 6.6001 14.9 6.77918 14.9 7.0001C14.9 7.22101 14.7209 7.4001 14.5 7.4001H13.9V8.0001C13.9 8.22101 13.7209 8.4001 13.5 8.4001C13.2791 8.4001 13.1 8.22101 13.1 8.0001V7.4001H12.5C12.2791 7.4001 12.1 7.22101 12.1 7.0001C12.1 6.77918 12.2791 6.6001 12.5 6.6001H13.1V6.0001C13.1 5.77918 13.2791 5.6001 13.5 5.6001ZM8.90002 1.0001C8.90002 0.779184 8.72093 0.600098 8.50002 0.600098C8.2791 0.600098 8.10002 0.779184 8.10002 1.0001V1.6001H7.50002C7.2791 1.6001 7.10002 1.77918 7.10002 2.0001C7.10002 2.22101 7.2791 2.4001 7.50002 2.4001H8.10002V3.0001C8.10002 3.22101 8.2791 3.4001 8.50002 3.4001C8.72093 3.4001 8.90002 3.22101 8.90002 3.0001V2.4001H9.50002C9.72093 2.4001 9.90002 2.22101 9.90002 2.0001C9.90002 1.77918 9.72093 1.6001 9.50002 1.6001H8.90002V1.0001Z"
                                        />
                                    </svg>
                                    <p className="text-sm font-semibold tracking-tighter text-green-light-10 dark:text-green-dark-10">MAX</p>
                                </button>
                            </div>
                        </div>

                        {/* Balance information */}
                        <div className="flex flex-row justify-between">
                            <p className="text-left text-xs leading-4 text-gray-light-10 dark:text-gray-dark-10">
                                Balance: {tokenBalanceFormatter.format(balance)} {metadata.title}
                            </p>
                        </div>

                        {/* Sliders */}
                        <div className="border-b border-dashed border-gray-light-5 pt-4 pb-8 dark:border-gray-dark-5">
                            {/* mint amount in range, display normal slider */}
                            {showNormalSlider && (
                                <Slider.Root
                                    min={0}
                                    value={[redeemState.amount ? tokenBalanceFormatter.format(redeemState.amount) : 0]}
                                    max={tokenBalanceFormatter.format(balance)}
                                    step={0.01}
                                    className="relative flex w-full flex-row items-center"
                                    onValueChange={(value) => {
                                        setRedeemState({ ...redeemState, amount: tokenBalanceFormatter.format(value[0]) });
                                    }}
                                >
                                    <Slider.Track className="relative h-0.5 w-full bg-gray-light-4 dark:bg-gray-dark-4">
                                        <Slider.Range className="absolute h-0.5 bg-blue-light-10 dark:bg-blue-dark-10" />
                                    </Slider.Track>
                                    <Slider.Thumb className="block h-5 w-5 rounded-full border border-gray-light-5 bg-gray-light-1 dark:border-0 dark:bg-gray-dark-12" />
                                </Slider.Root>
                            )}

                            {/* mint amount out of range display red slider */}
                            {showRedSlider && (
                                <Slider.Root
                                    min={0}
                                    value={[tokenBalanceFormatter.format(balance)]}
                                    max={tokenBalanceFormatter.format(balance)}
                                    step={0.01}
                                    className="relative flex w-full flex-row items-center"
                                    onValueChange={(value) => {
                                        setRedeemState({ ...redeemState, amount: tokenBalanceFormatter.format(value[0]) });
                                    }}
                                >
                                    <Slider.Track className="relative h-0.5 w-full bg-gray-light-4 dark:bg-gray-dark-4">
                                        <Slider.Range className="absolute h-0.5 bg-red-light-11 dark:bg-red-dark-11" />
                                    </Slider.Track>
                                    <Slider.Thumb className="block h-5 w-5 rounded-full border border-gray-light-5 bg-gray-light-1 dark:border-0 dark:bg-gray-dark-12" />
                                </Slider.Root>
                            )}
                        </div>

                        {/* Exhange rate */}
                        <div className="space-y-2 text-xs text-gray-light-10 dark:text-gray-dark-10">
                            <div className="flex flex-row justify-between">
                                <p>Minimum received amount</p>
                                <p>
                                    {tokenBalanceFormatter.format(minimalRedeemedValue)} {metadata.collateralSymbol}
                                </p>
                            </div>
                            <div className="flex flex-row justify-between">
                                <p>Expected amount</p>
                                <p className="text-gray-light-12 dark:text-gray-dark-12">
                                    {tokenBalanceFormatter.format(redeemedValue)} {metadata.collateralSymbol}
                                </p>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="w-full text-center">
                            {/* Dislay disabled button with not enough balance */}
                            {showNotEnoughBalanceButton && (
                                <button disabled className="w-full cursor-not-allowed rounded-full border border-gray-light-5 bg-gray-light-4 py-[11px] text-sm font-semibold leading-4 tracking-tighter text-gray-light-10 dark:border-gray-dark-5 dark:bg-gray-dark-4 dark:text-gray-dark-10">
                                    Not enough balance
                                </button>
                            )}

                            {showRedeemButton && (
                                <div>
                                    {!redeemState.redeeming && !redeemState.confirming && (
                                        <button
                                            onClick={async (e) => {
                                                e.preventDefault();
                                                toast.remove(); // IMPORTANT this is used to prevent metamask popup stuck

                                                setRedeemState({ ...redeemState, confirming: true, redeeming: false });

                                                try {
                                                    const result = await redeem();
                                                    if (result.error) {
                                                        setRedeemState({ ...redeemState, confirming: false, redeeming: false });
                                                        toast.custom((t) => <ToastError>{result.error.message}</ToastError>);
                                                        return;
                                                    }
                                                    setRedeemState({ ...redeemState, confirming: false, redeeming: true, hash: result.data.hash });
                                                    toast.remove();
                                                    toast.custom((t) => (
                                                        <ToastInProgress>
                                                            Redeeming {tokenBalanceFormatter.format(redeemState.amount)} {metadata.title}...
                                                        </ToastInProgress>
                                                    ));
                                                    const receipt = await result.data.wait();
                                                    if (receipt.status === 1) {
                                                        // success
                                                        const event = receipt.logs[receipt.logs.length - 1];
                                                        const confirmedRedeemendAmount = parseFloat(ethers.utils.formatUnits(event.data, metadata.collateralDecimals));
                                                        toast.remove();
                                                        toast.custom((t) => (
                                                            <ToastSuccess>
                                                                Successfully redeemed {tokenBalanceFormatter.format(confirmedRedeemendAmount)} {metadata.collateralSymbol}
                                                            </ToastSuccess>
                                                        ));
                                                        setRedeemState({ ...redeemState, amount: 0, redeeming: false, hash: undefined });
                                                    } else {
                                                        setRedeemState({ ...redeemState, error: new Error("Something wrong with the receipt") });
                                                        toast.remove();
                                                        toast.custom((t) => <ToastError>Something wrong with the receipt</ToastError>);
                                                    }
                                                } catch (e) {
                                                    // Wallet rejected etc
                                                    const error = e as Error;
                                                    toast.remove();
                                                    if (error.message) {
                                                        toast.custom((t) => <ToastError>{error.message}</ToastError>);
                                                    } else {
                                                        toast.custom((t) => <ToastError>{error}</ToastError>);
                                                    }
                                                    setRedeemState({ ...redeemState, redeeming: false, error });
                                                    console.error(e);
                                                }
                                            }}
                                            className="w-full rounded-full border border-blue-light-11 bg-blue-light-10 py-[11px] text-sm font-semibold leading-4 tracking-tighter text-gray-light-1 dark:border-blue-dark-11 dark:bg-blue-dark-10 dark:text-blue-light-1"
                                        >
                                            Redeem
                                        </button>
                                    )}

                                    {redeemState.confirming && <ButtonLoading full>Waiting for confirmation...</ButtonLoading>}
                                    {redeemState.redeeming && <ButtonLoading full>Redeeming...</ButtonLoading>}
                                </div>
                            )}
                        </div>

                        {/* Display transaction hash */}
                        {redeemState.hash && (
                            <div className="text-center">
                                <Link href={getExplorerLink(chain.chain, redeemState.hash)}>
                                    <a target="_blank" rel="noreferrer" className="text-gray-text-center py-4 text-sm leading-6 text-gray-light-10 dark:text-gray-dark-10">
                                        <span className="hover:underline">Transaction is submitted</span> &#8599;
                                    </a>
                                </Link>
                            </div>
                        )}
                    </form>
                </div>
            )}
        </div>
    );
};

export default RedeemForm;
