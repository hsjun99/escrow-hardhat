import { ethers } from "ethers"
import { useEffect, useState } from "react"
import deploy from "./deploy"
import Escrow from "./Escrow"
import axios from "axios"
import EscrowContract from "./artifacts/contracts/Escrow.sol/Escrow"

const provider = new ethers.providers.Web3Provider(window.ethereum)

const CONTRACT_STATUS = { PENDING: "PENDING", DEPLOYED: "DEPLOYED", REJECTED: "REJECTED" }

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

        // getAccounts()
        getContracts()
    }, [])

    async function getContracts() {
        const response = await axios.get(`http://localhost:4000/contracts`)
        updateEscrows(response.data)
    }

    async function postContract() {
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
            status: CONTRACT_STATUS.PENDING,
        }
        setEscrows([...escrows, escrow])
        await axios.post("http://localhost:4000/contracts", escrow)
        await escrowContract.deployed()
        escrow.status = CONTRACT_STATUS.DEPLOYED
        setEscrows([...escrows, escrow])
    }

    async function updateEscrows(data) {
        await Promise.all(
            data.map(async (item) => {
                const contract = new ethers.Contract(
                    item.address,
                    EscrowContract.abi,
                    provider.getSigner()
                )
                item.handleApprove = async () => await handleApprove(contract)
                try {
                    const contractDeployed = await contract.deployed()
                    item.status = CONTRACT_STATUS.DEPLOYED
                    item.isApproved = await contractDeployed.isApproved()
                } catch (e) {
                    item.status = CONTRACT_STATUS.PENDING
                    item.isApproved = false
                }
            })
        )
        setEscrows(data)
    }

    async function handleApprove(escrowContract) {
        escrowContract.on("Approved", () => {
            document.getElementById(escrowContract.address).className = "complete"
            document.getElementById(escrowContract.address).innerText = "✓ It's been approved!"
        })

        await approve(escrowContract)
        await getContracts()
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

                        postContract()
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
