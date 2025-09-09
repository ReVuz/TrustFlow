'use client';
import Image from "next/image";
import Link from "next/link";
import { ConnectButton, lightTheme, useActiveAccount } from "thirdweb/react";
import { client } from "../client";

const Navbar = () => {
    const account= useActiveAccount();
    return (
        <nav className="bg-slate-100 border-b-2 border-b-slate-300">
            <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                <div className="relative flex h-16 items-center justify-between">
                    {/* Left side: Logo and Campaigns link */}
                    <div className="flex items-center gap-2 md:gap-4">
                        <div className="flex-shrink-0">
                            <Image
                                src="/logo.png"
                                alt="Logo"
                                width={64}
                                height={64}
                                // Using a blended light cyan for the shadow color
                                style={{filter: "drop-shadow(0px 0px 15px #80CBC4)"}} // A light aqua/cyan color
                            />
                        </div>
                        <div className="hidden sm:block">
                            <div className="flex items-center space-x-4">
                                <Link href={'/'}>
                                    <p className="rounded-md px-3 py-2 text-sm font-medium text-slate-700">Campaigns</p>
                                </Link>
                                {account && (
                                    <Link href={`/dashboard/${account.address}`}>
                                        <p className="rounded-md px-3 py-2 text-sm font-medium text-slate-700">Dashboard</p>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Right side: Connect Button */}
                    <div className="flex items-center">
                        <ConnectButton 
                            client={client}
                            theme={lightTheme()}
                            detailsButton={{
                                style: {
                                    maxHeight: "50px",
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;