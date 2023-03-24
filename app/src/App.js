import { ethers } from "ethers"
import { useEffect, useState } from "react"
import deploy from "./deploy"
import Escrow from "./Escrow"
import axios from "axios"
import EscrowContract from "./artifacts/contracts/Escrow.sol/Escrow"

const provider = new ethers.providers.Web3Provider(window.ethereum)

export async function approve(escrowContract) {
    const approveTxn = await escrowContract.connect(provider.getSigner()).approve()
    await approveTxn.wait()
}

function App() {
    const [escrows, setEscrows] = useState([])
    // const [account, setAccount] = useState()
    // const [signer, setSigner] = useState()

    useEffect(() => {
        // async function getAccounts() {
        // const accounts = await provider.send("eth_requestAccounts", [])

        // setAccount(accounts[0])
        // setSigner(provider.getSigner())
        // }
        async function getContracts() {
            const response = await axios.get(`http://localhost:4000/contracts`)
            updateEscrows(response.data)
        }

        // getAccounts()
        getContracts()
    }, [])

    function updateEscrows(data) {
        data.forEach((item) => {
            // console.log(new ethers.Contract(item.address, EscrowContract.abi, provider.getSigner()))
            item.handleApprove = async () =>
                await handleApprove(
                    new ethers.Contract(item.address, EscrowContract.abi, provider.getSigner())
                )
        })
        setEscrows(data)
    }

    async function handleApprove(escrowContract) {
        escrowContract.on("Approved", () => {
            document.getElementById(escrowContract.address).className = "complete"
            document.getElementById(escrowContract.address).innerText = "✓ It's been approved!"
        })

        await approve(escrowContract)
        const response = await axios.put(
            `http://localhost:4000/contracts/${escrowContract.address}`
        )
        updateEscrows(response.data)
    }

    async function newContract() {
        const beneficiary = document.getElementById("beneficiary").value
        const arbiter = document.getElementById("arbiter").value
        const value = ethers.BigNumber.from(
            ethers.utils.parseUnits(document.getElementById("ether").value.toString(), "ether")
        )
        const escrowContract = await deploy(provider.getSigner(), arbiter, beneficiary, value)

        const escrow = {
            address: escrowContract.address,
            arbiter,
            beneficiary,
            value: value.toString(),
            handleApprove: async () => await handleApprove(escrowContract),
            isApproved: false,
        }

        await axios.post("http://localhost:4000/contracts", escrow)
        setEscrows([...escrows, escrow])
    }

    return (
        <>
            <div className="contract">
                <h1> New Contract </h1>
                <label>
                    Arbiter Address
                    <input type="text" id="arbiter" />
                </label>

                <label>
                    Beneficiary Address
                    <input type="text" id="beneficiary" />
                </label>

                <label>
                    Deposit Amount (in ETHER)
                    <input type="text" id="ether" />
                </label>

                <div
                    className="button"
                    id="deploy"
                    onClick={(e) => {
                        e.preventDefault()

                        newContract()
                    }}
                >
                    Deploy
                </div>
            </div>

            <div className="existing-contracts">
                <h1> Existing Contracts </h1>

                <div id="container">
                    {escrows.map((escrow) => {
                        return <Escrow key={escrow.address} {...escrow} />
                    })}
                </div>
            </div>
        </>
    )
}

export default App
