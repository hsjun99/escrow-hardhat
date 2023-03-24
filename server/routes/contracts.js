var express = require("express")
var router = express.Router()

let escrowContractArr = []

router.post("/", (req, res) => {
    const { address, arbiter, beneficiary, value, isApproved } = req.body

    const newEscrowContract = {
        address,
        arbiter,
        beneficiary,
        value,
        isApproved,
    }

    escrowContractArr.push(newEscrowContract)
    console.log(escrowContractArr)

    res.send(newEscrowContract)
})

router.get("/", (req, res) => {
    res.send(escrowContractArr)
})

router.put("/:address", (req, res) => {
    const address = req.params.address

    escrowContractArr.forEach((item, index) => {
        if (item.address === address) {
            escrowContractArr[index].isApproved = true
        }
    })

    console.log(escrowContractArr)

    res.send(escrowContractArr)
})

module.exports = router
